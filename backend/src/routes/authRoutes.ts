import { Router } from 'express';
import { register, login, getMe, registerSchema, loginSchema } from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticateToken, getMe);

export default router;
