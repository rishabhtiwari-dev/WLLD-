import { Campaign, ICampaignDocument } from '../models/Campaign';
import { Submission, ISubmissionDocument } from '../models/Submission';
import { IMilestone } from '../types';
import { SpikeDetectionService } from './spikeService';
import { CacheService } from './cacheService';

export interface MilestoneCalculationResult {
  highestMilestone: IMilestone | null;
  targetPayout: number;
}

export interface PayoutIncrementResult {
  highestMilestone: IMilestone | null;
  targetPayout: number;
  payoutDelta: number;
}

export interface ViewUpdateResult {
  submission: ISubmissionDocument;
  payoutIncrement: number;
  highestMilestone: IMilestone | null;
  budgetExhausted: boolean;
  partialPayout: boolean;
  flaggedForSpike: boolean;
  spikeReason?: string;
}

/**
 * KeyedMutex serializes concurrent execution for operations on the exact same resource ID.
 * This guarantees that simultaneous updates to the SAME submission run sequentially,
 * preventing race conditions and double-payment.
 */
class KeyedMutex {
  private queues = new Map<string, Promise<void>>();

  public async acquire<T>(key: string, task: () => Promise<T>): Promise<T> {
    const prevTask = this.queues.get(key) || Promise.resolve();

    let release: () => void = () => {};
    const currentTask = new Promise<void>((resolve) => {
      release = resolve;
    });

    this.queues.set(key, prevTask.then(() => currentTask));

    try {
      await prevTask;
      return await task();
    } finally {
      release();
      if (this.queues.get(key) === currentTask) {
        this.queues.delete(key);
      }
    }
  }
}

const submissionMutex = new KeyedMutex();

export class PayoutService {
  /**
   * Sorts the milestone ladder in ascending order of views
   */
  public static sortMilestoneLadder(ladder: IMilestone[]): IMilestone[] {
    return [...ladder].sort((a, b) => a.views - b.views);
  }

  /**
   * Determines the highest milestone crossed for a given view count.
   * "A creator's payout is the amount of the highest milestone their post has crossed"
   */
  public static calculateMilestonePayout(
    ladder: IMilestone[],
    views: number
  ): MilestoneCalculationResult {
    if (!ladder || ladder.length === 0 || views <= 0) {
      return { highestMilestone: null, targetPayout: 0 };
    }

    const sortedLadder = this.sortMilestoneLadder(ladder);
    let highest: IMilestone | null = null;

    for (const milestone of sortedLadder) {
      if (views >= milestone.views) {
        highest = milestone;
      } else {
        // Since ladder is sorted ascending, subsequent milestones won't be reached
        break;
      }
    }

    return {
      highestMilestone: highest,
      targetPayout: highest ? highest.payout : 0
    };
  }

  /**
   * Computes the incremental payout required based on new views and current payout.
   * Guarantees repeated updates never double-pay.
   */
  public static computePayoutIncrement(
    ladder: IMilestone[],
    currentViews: number,
    newViews: number,
    currentPayout: number
  ): PayoutIncrementResult {
    const { highestMilestone, targetPayout } = this.calculateMilestonePayout(ladder, newViews);

    // If target payout is greater than what has already been paid out to this submission,
    // the incremental delta is the difference.
    // If the post has already received >= targetPayout (or views didn't cross a new milestone),
    // delta is 0.
    const payoutDelta = Math.max(0, targetPayout - currentPayout);

    return {
      highestMilestone,
      targetPayout,
      payoutDelta
    };
  }

  /**
   * Atomically claims budget from a campaign to prevent race conditions and overspending.
   * Returns the exact amount allocated (either requested, partial remaining, or 0).
   */
  public static async allocateCampaignBudget(
    campaignId: string,
    requestedAmount: number
  ): Promise<{ allocatedAmount: number; isPartial: boolean; isExhausted: boolean }> {
    if (requestedAmount <= 0) {
      return { allocatedAmount: 0, isPartial: false, isExhausted: false };
    }

    // 1. Try to atomically claim the full requested amount
    const fullClaim = await Campaign.findOneAndUpdate(
      {
        _id: campaignId,
        $expr: {
          $lte: [{ $add: ['$spentBudget', requestedAmount] }, '$totalBudget']
        }
      },
      {
        $inc: { spentBudget: requestedAmount }
      },
      { new: true }
    );

    if (fullClaim) {
      const isExhausted = fullClaim.spentBudget >= fullClaim.totalBudget;
      return {
        allocatedAmount: requestedAmount,
        isPartial: false,
        isExhausted
      };
    }

    // 2. Full amount could not be claimed because totalBudget would be exceeded.
    // Let's check remaining budget and attempt to atomically claim whatever is left.
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const remainingBudget = Math.max(0, campaign.totalBudget - campaign.spentBudget);
    if (remainingBudget <= 0) {
      return { allocatedAmount: 0, isPartial: false, isExhausted: true };
    }

    // Atomically claim the exact remaining budget
    const partialClaim = await Campaign.findOneAndUpdate(
      {
        _id: campaignId,
        spentBudget: campaign.spentBudget, // Optimistic concurrency guard
        $expr: {
          $lte: [{ $add: ['$spentBudget', remainingBudget] }, '$totalBudget']
        }
      },
      {
        $inc: { spentBudget: remainingBudget }
      },
      { new: true }
    );

    if (partialClaim) {
      return {
        allocatedAmount: remainingBudget,
        isPartial: true,
        isExhausted: true
      };
    }

    // If another concurrent request claimed it first, re-check
    const updated = await Campaign.findById(campaignId);
    const finalRemaining = updated ? Math.max(0, updated.totalBudget - updated.spentBudget) : 0;
    return {
      allocatedAmount: 0,
      isPartial: false,
      isExhausted: finalRemaining <= 0
    };
  }

  /**
   * Processes a view update for a submission.
   * Serialized per submissionId to prevent concurrent double-spend on the same post.
   */
  public static async processViewUpdate(
    submissionId: string,
    views: number
  ): Promise<ViewUpdateResult> {
    return submissionMutex.acquire(submissionId, async () => {
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        throw new Error(`Submission with ID ${submissionId} not found`);
      }

      const campaign = await Campaign.findById(submission.campaignId);
      if (!campaign) {
        throw new Error(`Campaign with ID ${submission.campaignId} not found`);
      }

      // Spike Anomaly Detection
      const now = new Date();
      const spikeCheck = SpikeDetectionService.analyzeViewUpdate(
        submission.currentViews,
        views,
        submission.viewHistory,
        now
      );

      // Compute incremental payout based on current submission payout state
      const { highestMilestone, payoutDelta } = this.computePayoutIncrement(
        campaign.milestoneLadder,
        submission.currentViews,
        views,
        submission.currentPayout
      );

      let actualPayoutIncrement = 0;
      let partialPayout = false;
      let budgetExhausted = false;

      if (payoutDelta > 0) {
        // Allocate budget atomically
        const allocation = await this.allocateCampaignBudget(
          campaign._id.toString(),
          payoutDelta
        );
        actualPayoutIncrement = allocation.allocatedAmount;
        partialPayout = allocation.isPartial;
        budgetExhausted = allocation.isExhausted;
      }

      // Update submission
      submission.currentViews = views;
      submission.currentPayout += actualPayoutIncrement;
      if (highestMilestone) {
        submission.highestMilestoneReached = highestMilestone;
      }

      if (spikeCheck.isSpike) {
        submission.flaggedForSpike = true;
        submission.spikeReason = spikeCheck.reason;
        submission.status = 'FLAGGED';
      }

      // Record view history entry
      submission.viewHistory.push({
        views,
        payoutIncrement: actualPayoutIncrement,
        cumulativePayout: submission.currentPayout,
        timestamp: now,
        flagged: spikeCheck.isSpike,
        spikeReason: spikeCheck.reason
      });

      await submission.save();

      // Invalidate campaign cache since spentBudget has changed
      if (actualPayoutIncrement > 0) {
        await CacheService.invalidateCampaignCache();
      }

      return {
        submission,
        payoutIncrement: actualPayoutIncrement,
        highestMilestone,
        budgetExhausted,
        partialPayout,
        flaggedForSpike: spikeCheck.isSpike,
        spikeReason: spikeCheck.reason
      };
    });
  }
}
