import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware to require authentication
 * Verifies JWT token from Authorization header
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        error: 'Invalid or expired token. Please log in again.',
      });
    }

    // Attach user ID to request object
    req.userId = payload.userId;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed. Please log in again.',
    });
  }
}

/**
 * Optional middleware - attaches userId if token present, but doesn't require it
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);

      if (payload) {
        req.userId = payload.userId;
      }
    }

    return next();
  } catch (error) {
    // Continue without authentication
    return next();
  }
}
