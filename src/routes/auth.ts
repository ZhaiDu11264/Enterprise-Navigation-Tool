import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserService } from '../models/User';
import { ConfigurationService } from '../models/DefaultConfiguration';
import { JWTService } from '../utils/jwt';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/login
 * User authentication endpoint
 */
router.post('/login', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const { username, password } = req.body;

    // Authenticate user
    const authResult = await UserService.authenticate(username, password);

    if (!authResult.success || !authResult.user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: authResult.message || 'Invalid credentials',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Generate JWT token
    const tokenResult = JWTService.generateToken(authResult.user);

    if (!tokenResult.success || !tokenResult.token) {
      res.status(500).json({
        error: {
          code: 'TOKEN_GENERATION_FAILED',
          message: 'Failed to generate authentication token',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: authResult.user.id,
          username: authResult.user.username,
          email: authResult.user.email,
          role: authResult.user.role,
          createdAt: authResult.user.createdAt,
          lastLoginAt: authResult.user.lastLoginAt
        },
        token: tokenResult.token,
        expiresIn: '24h'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Login failed due to server error',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/auth/logout
 * User logout endpoint (client-side token invalidation)
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // In a JWT-based system, logout is primarily handled client-side
    // The client should remove the token from storage
    // Here we just confirm the logout action
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Logout failed due to server error',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
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

    // Get fresh user data from database
    const user = await UserService.getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user information',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const currentToken = JWTService.extractTokenFromHeader(authHeader);

    if (!currentToken) {
      res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Current token is required for refresh',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const refreshResult = JWTService.refreshToken(currentToken);

    if (!refreshResult.success || !refreshResult.token) {
      res.status(401).json({
        error: {
          code: 'TOKEN_REFRESH_FAILED',
          message: refreshResult.message || 'Failed to refresh token',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        token: refreshResult.token,
        expiresIn: '24h'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Token refresh failed due to server error',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/auth/register
 * User registration endpoint (for development/admin use)
 */
router.post('/register', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"')
], async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const { username, email, password, role = 'user' } = req.body;

    // Check if username already exists
    const usernameExists = await UserService.usernameExists(username);
    if (usernameExists) {
      res.status(409).json({
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username already exists',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Check if email already exists
    const emailExists = await UserService.emailExists(email);
    if (emailExists) {
      res.status(409).json({
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already exists',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Create user
    const newUser = await UserService.createUser({
      username,
      email,
      password,
      role
    });

    // Apply default configuration to new user
    try {
      await ConfigurationService.applyActiveConfigurationToUser(newUser.id);
    } catch (configError) {
      console.warn('Failed to apply default configuration to new user:', configError);
      // Don't fail user creation if default config application fails
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      },
      message: 'User created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Registration failed due to server error',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

export default router;