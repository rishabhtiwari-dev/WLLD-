import { Request, Response } from 'express';
import { z } from 'zod';
import { Campaign } from '../models/Campaign';
import { Submission } from '../models/Submission';
import { AuthRequest, IMilestone } from '../types';
import { CacheService } from '../services/cacheService';

const milestoneItemSchema = z.object({
  views: z.number().int().positive('Views threshold must be a positive integer'),
  payout: z.number().nonnegative('Payout must be non-negative')
});

export const createCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters'),
  platform: z.enum(['Instagram', 'YouTube'], {
    errorMap: () => ({ message: "Platform must be either 'Instagram' or 'YouTube'" })
  }),
  totalBudget: z.number().positive('Total budget must be greater than ₹0'),
  milestoneLadder: z
    .array(milestoneItemSchema)
    .min(1, 'At least one milestone is required')
    .refine(
      (ladder) => {
        // Ensure strictly increasing view thresholds and payouts
        for (let i = 1; i < ladder.length; i++) {
          if (ladder[i].views <= ladder[i - 1].views || ladder[i].payout <= ladder[i - 1].payout) {
            return false;
          }
        }
        return true;
      },
      {
        message: 'Milestone ladder must have strictly increasing view thresholds and payouts'
      }
    )
});

export const createCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, platform, totalBudget, milestoneLadder } = req.body;
    const brandId = req.user?.userId;

    // Sort ladder explicitly before saving
    const sortedLadder = [...milestoneLadder].sort((a: IMilestone, b: IMilestone) => a.views - b.views);

    const campaign = await Campaign.create({
      name,
      platform,
      totalBudget,
      spentBudget: 0,
      milestoneLadder: sortedLadder,
      brandId,
      status: 'ACTIVE'
    });

    // Invalidate Redis cache
    await CacheService.invalidateCampaignCache();

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isBrand = req.user?.role === 'brand';
    const isMine = req.query.mine === 'true';

    // If Brand requested "mine", fetch specifically for this brand
    if (isBrand && isMine && req.user) {
      const campaigns = await Campaign.find({ brandId: req.user.userId })
        .sort({ createdAt: -1 })
        .lean();

      // Enrich with submission counts
      const enriched = await Promise.all(
        campaigns.map(async (c) => {
          const submissionCount = await Submission.countDocuments({ campaignId: c._id });
          return {
            ...c,
            remainingBudget: Math.max(0, c.totalBudget - c.spentBudget),
            submissionCount
          };
        })
      );

      res.status(200).json({ success: true, data: enriched });
      return;
    }

    // Public / Creator campaign listing (cached with Redis bonus)
    const cacheKey = 'campaign_list:all';
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        source: 'cache',
        data: cachedData
      });
      return;
    }

    const campaigns = await Campaign.find({ status: 'ACTIVE' })
      .populate('brandId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      campaigns.map(async (c) => {
        const submissionCount = await Submission.countDocuments({ campaignId: c._id });
        return {
          ...c,
          remainingBudget: Math.max(0, c.totalBudget - c.spentBudget),
          submissionCount
        };
      })
    );

    // Cache for 60 seconds
    await CacheService.set(cacheKey, enriched, 60);

    res.status(200).json({
      success: true,
      source: 'database',
      data: enriched
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id).populate('brandId', 'name email').lean();
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    const submissions = await Submission.find({ campaignId: id })
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...campaign,
        remainingBudget: Math.max(0, campaign.totalBudget - campaign.spentBudget),
        submissions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

