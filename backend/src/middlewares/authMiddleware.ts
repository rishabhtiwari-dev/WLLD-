import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthUserPayload, UserRole } from '../types';

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication token required' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'memed-secret-key-development-2025';

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

export const requireRole = (role: UserRole | UserRole[]) => {
  const allowedRoles = Array.isArray(role) ? role : [role];

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Only users with role [${allowedRoles.join(', ')}] can access this resource`
      });
      return;
    }

    next();
  };
};
