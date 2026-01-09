import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../utils/jwt';
import { UserService } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const verifyResult = JWTService.verifyToken(token);

    if (!verifyResult.success || !verifyResult.payload) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: verifyResult.message || 'Invalid or expired token',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Verify user still exists and is active
    const user = await UserService.getUserById(verifyResult.payload.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found or inactive',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Attach user payload to request
    req.user = verifyResult.payload;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    const verifyResult = JWTService.verifyToken(token);

    if (verifyResult.success && verifyResult.payload) {
      // Verify user still exists and is active
      const user = await UserService.getUserById(verifyResult.payload.userId);
      if (user && user.isActive) {
        req.user = verifyResult.payload;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue without user on error
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (requiredRole: 'user' | 'admin') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Admin role can access everything
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Check if user has required role
    if (req.user.role !== requiredRole) {
      res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `${requiredRole} role required`,
          details: {
            userRole: req.user.role,
            requiredRole: requiredRole
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * User or admin middleware (authenticated users)
 */
export const requireUser = requireRole('user');