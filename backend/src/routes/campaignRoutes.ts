import { Router } from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  createCampaignSchema
} from '../controllers/campaignController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

// Brand creates a campaign
router.post(
  '/',
  authenticateToken,
  requireRole('brand'),
  validateRequest(createCampaignSchema),
  createCampaign
);

// List campaigns (supports ?mine=true for brand)
router.get('/', authenticateToken, getCampaigns);

// Get single campaign details with submissions
router.get('/:id', authenticateToken, getCampaignById);

export default router;
