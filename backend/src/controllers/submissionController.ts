import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Submission } from '../models/Submission';
import { Campaign } from '../models/Campaign';
import { AuthRequest } from '../types';
import { PayoutService } from '../services/payoutService';

export const createSubmissionSchema = z.object({
  campaignId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid campaign ID format'
  }),
  postUrl: z.string().url('Must be a valid post URL (e.g., https://instagram.com/p/...)')
});

export const updateViewsSchema = z.object({
  views: z.number().int().nonnegative('Views count must be a non-negative integer')
});

export const createSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { campaignId, postUrl } = req.body;
    const creatorId = req.user?.userId;

    if (!creatorId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    if (campaign.status !== 'ACTIVE') {
      res.status(400).json({ success: false, message: 'This campaign is no longer active' });
      return;
    }

    // Check if post already submitted for this campaign
    const existing = await Submission.findOne({ campaignId, postUrl: postUrl.trim() });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'This post URL has already been submitted for this campaign'
      });
      return;
    }

    const submission = await Submission.create({
      campaignId,
      creatorId,
      postUrl: postUrl.trim(),
      platform: campaign.platform,
      currentViews: 0,
      currentPayout: 0,
      highestMilestoneReached: null,
      viewHistory: [
        {
          views: 0,
          payoutIncrement: 0,
          cumulativePayout: 0,
          timestamp: new Date()
        }
      ],
      status: 'APPROVED'
    });

    res.status(201).json({
      success: true,
      message: 'Post submitted successfully',
      data: submission
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCreatorSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.userId;

    const submissions = await Submission.find({ creatorId })
      .populate('campaignId', 'name platform totalBudget spentBudget milestoneLadder status')
      .sort({ createdAt: -1 })
      .lean();

    const enriched = submissions.map((s) => {
      if (s.campaignId && typeof s.campaignId === 'object') {
        const c = s.campaignId as any;
        c.remainingBudget = Math.max(0, (c.totalBudget || 0) - (c.spentBudget || 0));
      }
      return s;
    });

    res.status(200).json({
      success: true,
      data: enriched
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCreatorEarnings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.userId;

    const submissions = await Submission.find({ creatorId }).lean();

    const totalEarnings = submissions.reduce((sum, s) => sum + s.currentPayout, 0);
    const totalViews = submissions.reduce((sum, s) => sum + s.currentViews, 0);
    const totalSubmissions = submissions.length;

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        totalViews,
        totalSubmissions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubmissionViews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { views } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid submission ID' });
      return;
    }

    const result = await PayoutService.processViewUpdate(id, views);

    res.status(200).json({
      success: true,
      message: 'Views updated successfully',
      data: {
        submission: result.submission,
        payoutIncrement: result.payoutIncrement,
        highestMilestone: result.highestMilestone,
        budgetExhausted: result.budgetExhausted,
        partialPayout: result.partialPayout,
        flaggedForSpike: result.flaggedForSpike,
        spikeReason: result.spikeReason
      }
    });
  } catch (error: any) {
    const status = error.message?.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid submission ID' });
      return;
    }

    const submission = await Submission.findById(id)
      .populate('campaignId', 'name platform totalBudget spentBudget milestoneLadder')
      .populate('creatorId', 'name email')
      .lean();

    if (!submission) {
      res.status(404).json({ success: false, message: 'Submission not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

