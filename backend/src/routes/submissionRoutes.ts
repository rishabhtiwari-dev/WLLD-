import { Router } from 'express';
import {
  createSubmission,
  getCreatorSubmissions,
  getCreatorEarnings,
  updateSubmissionViews,
  getSubmissionById,
  createSubmissionSchema,
  updateViewsSchema
} from '../controllers/submissionController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

// Creator routes
router.post(
  '/',
  authenticateToken,
  requireRole('creator'),
  validateRequest(createSubmissionSchema),
  createSubmission
);

router.get(
  '/creator',
  authenticateToken,
  requireRole('creator'),
  getCreatorSubmissions
);

router.get(
  '/creator/earnings',
  authenticateToken,
  requireRole('creator'),
  getCreatorEarnings
);

// SIMULATION ENDPOINT: no role check needed (simulates platform view updates)
router.patch(
  '/:id/views',
  validateRequest(updateViewsSchema),
  updateSubmissionViews
);

// Get single submission
router.get('/:id', authenticateToken, getSubmissionById);

export default router;
