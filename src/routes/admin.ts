import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import os from 'os';
import { executeQuery } from '../config/database';
import { UserService } from '../models/User';
import { AuditLogService } from '../models/AuditLog';
import { FeedbackService } from '../models/Feedback';
import { FeedbackQuery, FeedbackStatus, FeedbackType } from '../models/interfaces';
import { NotificationService, NotificationLevel } from '../models/Notification';
import { ConfigurationService } from '../models/DefaultConfiguration';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { syncConfigurationToAllUsers } from '../utils/defaultConfiguration';
import { logAudit } from '../utils/audit';

const router = Router();

// Apply authentication and admin role requirement to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/config/status
 * Get current configuration status for sync checking
 */
router.get('/config/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const activeConfig = await ConfigurationService.getActiveConfiguration();
    
    if (!activeConfig) {
      res.status(200).json({
        success: true,
        data: {
          status: {
            lastUpdated: new Date().toISOString(),
            version: 0,
            isActive: false
          }
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        status: {
          lastUpdated: activeConfig.updatedAt || activeConfig.createdAt,
          version: activeConfig.version,
          isActive: activeConfig.isActive
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get configuration status error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get configuration status',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserService.getAllUsers();

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isActive: user.isActive
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve users',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/admin/users
 * Create new user (admin only)
 */
router.post('/users', [
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
    .withMessage('Password must be at least 6 characters'),
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

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.user.create',
      entityType: 'user',
      entityId: newUser.id,
      description: `Created user "${newUser.username}"`
    });

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
    console.error('Admin create user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user (admin only)
 */
router.put('/users/:id', [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
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

    const userId = parseInt(req.params.id!, 10);
    if (isNaN(userId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Check if user exists
    const existingUser = await UserService.getUserById(userId);
    if (!existingUser) {
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

    // Prevent admin from deactivating themselves
    if (req.user?.userId === userId && req.body.isActive === false) {
      res.status(400).json({
        error: {
          code: 'CANNOT_DEACTIVATE_SELF',
          message: 'Cannot deactivate your own account',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Update user
    const updatedUser = await UserService.updateUser(userId, req.body);

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.user.update',
      entityType: 'user',
      entityId: updatedUser.id,
      description: `Updated user "${updatedUser.username}"`
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          lastLoginAt: updatedUser.lastLoginAt,
          isActive: updatedUser.isActive
        }
      },
      message: 'User updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/admin/users/:id/reset-password
 * Reset user password (admin only)
 */
router.post('/users/:id/reset-password', [
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], async (req: Request, res: Response): Promise<void> => {
  try {
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

    const userId = parseInt(req.params.id!, 10);
    if (isNaN(userId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const user = await UserService.getUserById(userId);
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

    const providedPassword = req.body.password;
    const newPassword = providedPassword || Math.random().toString(36).slice(-10);
    await UserService.updatePassword(userId, newPassword);

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.user.reset_password',
      entityType: 'user',
      entityId: userId,
      description: `Reset password for user "${user.username}"`
    });

    res.status(200).json({
      success: true,
      data: {
        userId,
        temporaryPassword: providedPassword ? undefined : newPassword
      },
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reset password',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/admin/users/:id/reset-profile
 * Reset user profile fields (admin only)
 */
router.post('/users/:id/reset-profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id!, 10);
    if (isNaN(userId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const user = await UserService.getUserById(userId);
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

    const updatedUser = await UserService.updateUser(userId, {
      displayName: user.username,
      avatarUrl: null
    });

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.user.reset_profile',
      entityType: 'user',
      entityId: userId,
      description: `Reset profile for user "${user.username}"`
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          displayName: updatedUser.displayName,
          avatarUrl: updatedUser.avatarUrl
        }
      },
      message: 'User profile reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reset profile error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reset profile',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Deactivate user (admin only)
 */
router.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id!, 10);
    if (isNaN(userId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Prevent admin from banning themselves
    if (req.user?.userId === userId) {
      res.status(400).json({
        error: {
          code: 'CANNOT_DELETE_SELF',
          message: 'Cannot ban your own account',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Check if user exists
    const existingUser = await UserService.getUserById(userId);
    if (!existingUser) {
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

    // Soft delete user
    await UserService.deleteUser(userId);

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.user.ban',
      entityType: 'user',
      entityId: userId,
      description: `Banned user "${existingUser.username}"`
    });

    res.status(200).json({
      success: true,
      message: 'User banned successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to ban user',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/stats
 * Get system statistics (admin only)
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserService.getAllUsers();
    const memory = process.memoryUsage();
    const linkRows = await executeQuery<{ url: string; access_count: number }>(
      'SELECT url, access_count FROM website_links WHERE is_active = true AND access_count > 0'
    );
    const domainAccess: Record<string, number> = {};
    linkRows.forEach((row) => {
      const urlValue = row.url || '';
      let hostname = '';
      try {
        hostname = new URL(urlValue).hostname.replace(/^www\./i, '');
      } catch {
        hostname = urlValue.trim();
      }
      if (!hostname) {
        return;
      }
      domainAccess[hostname] = (domainAccess[hostname] || 0) + (row.access_count || 0);
    });
    const topDomains = Object.entries(domainAccess)
      .map(([host, totalAccess]) => ({ host, totalAccess }))
      .sort((a, b) => b.totalAccess - a.totalAccess)
      .slice(0, 10);
    
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.isActive).length,
      adminUsers: users.filter(user => user.role === 'admin').length,
      regularUsers: users.filter(user => user.role === 'user').length,
      recentLogins: users.filter(user => {
        if (!user.lastLoginAt) return false;
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return user.lastLoginAt > dayAgo;
      }).length,
      topDomains,
      resources: {
        uptimeSeconds: Math.round(process.uptime()),
        memory: {
          rssMb: Math.round(memory.rss / 1024 / 1024),
          heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024)
        },
        system: {
          loadAverage: os.loadavg(),
          totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
          freeMemMb: Math.round(os.freemem() / 1024 / 1024)
        }
      }
    };

    res.status(200).json({
      success: true,
      data: { stats },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve statistics',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/logs
 * Query audit logs (admin only)
 */
router.get('/logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, action, entityType, keyword, from, to, limit, offset } = req.query;
    const parsedUserId = typeof userId === 'string' ? Number(userId) : undefined;
    const parsedLimit = typeof limit === 'string' ? Number(limit) : 50;
    const parsedOffset = typeof offset === 'string' ? Number(offset) : 0;

    const query: {
      userId?: number;
      action?: string;
      entityType?: string;
      keyword?: string;
      from?: string;
      to?: string;
      limit?: number;
      offset?: number;
    } = {};

    if (typeof parsedUserId === 'number' && Number.isFinite(parsedUserId)) {
      query.userId = parsedUserId;
    }
    if (typeof action === 'string') {
      query.action = action;
    }
    if (typeof entityType === 'string') {
      query.entityType = entityType;
    }
    if (typeof keyword === 'string') {
      query.keyword = keyword;
    }
    if (typeof from === 'string') {
      query.from = from;
    }
    if (typeof to === 'string') {
      query.to = to;
    }
    if (Number.isFinite(parsedLimit)) {
      query.limit = parsedLimit;
    }
    if (Number.isFinite(parsedOffset)) {
      query.offset = parsedOffset;
    }

    const result = await AuditLogService.queryLogs(query);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin logs error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve audit logs',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/feedback
 * List user feedback entries (admin only)
 */
router.get('/feedback', [
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('userId must be a positive integer'),
  query('type')
    .optional()
    .isIn(['bug', 'feature', 'ui', 'data', 'other'])
    .withMessage('Invalid feedback type'),
  query('status')
    .optional()
    .isIn(['new', 'reviewed', 'resolved'])
    .withMessage('Invalid feedback status'),
  query('keyword')
    .optional()
    .isLength({ max: 200 })
    .withMessage('keyword is too long'),
  query('from')
    .optional()
    .isISO8601()
    .withMessage('from must be a valid date'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('to must be a valid date'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('limit must be between 1 and 200'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('offset must be zero or positive')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: errors.array(),
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const { userId, type, status, keyword, from, to, limit, offset } = req.query;
    const parsedUserId = typeof userId === 'string' ? Number(userId) : undefined;
    const parsedLimit = typeof limit === 'string' ? Number(limit) : 50;
    const parsedOffset = typeof offset === 'string' ? Number(offset) : 0;

    const feedbackQuery: FeedbackQuery = {
      limit: Number.isFinite(parsedLimit) ? parsedLimit : 50,
      offset: Number.isFinite(parsedOffset) ? parsedOffset : 0
    };

    if (Number.isFinite(parsedUserId)) {
      feedbackQuery.userId = parsedUserId as number;
    }
    if (typeof type === 'string') {
      feedbackQuery.type = type as FeedbackType;
    }
    if (typeof status === 'string') {
      feedbackQuery.status = status as FeedbackStatus;
    }
    if (typeof keyword === 'string') {
      feedbackQuery.keyword = keyword;
    }
    if (typeof from === 'string') {
      feedbackQuery.from = from;
    }
    if (typeof to === 'string') {
      feedbackQuery.to = to;
    }

    const result = await FeedbackService.listFeedback(feedbackQuery);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin feedback list error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve feedback',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/feedback/stats
 * Feedback statistics (admin only)
 */
router.get('/feedback/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await FeedbackService.getStats();
    res.status(200).json({
      success: true,
      data: { stats },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin feedback stats error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve feedback stats',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/admin/notifications
 * Send notification to all users or specific users (admin only)
 */
router.post('/notifications', [
  body('title')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('level')
    .optional()
    .isIn(['info', 'success', 'warning', 'error'])
    .withMessage('Level must be one of info, success, warning, error'),
  body('userIds')
    .optional()
    .isArray()
    .withMessage('userIds must be an array'),
  body('userIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each userId must be a positive integer')
], async (req: Request, res: Response): Promise<void> => {
  try {
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

    const { title, message, level = 'info', userIds } = req.body as {
      title: string;
      message: string;
      level?: NotificationLevel;
      userIds?: number[];
    };

    let targetUserIds: number[] = [];
    if (Array.isArray(userIds) && userIds.length > 0) {
      targetUserIds = userIds.map((id) => Number(id)).filter((id) => Number.isFinite(id));
    } else {
      const users = await UserService.getAllUsers();
      targetUserIds = users.filter(user => user.isActive).map(user => user.id);
    }

    const notification = await NotificationService.createNotification(
      req.user?.userId ?? null,
      title,
      message,
      level,
      targetUserIds
    );

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.notification.send',
      entityType: 'notification',
      entityId: notification.id,
      description: `Sent notification "${notification.title}" to ${targetUserIds.length} users`
    });

    res.status(201).json({
      success: true,
      data: {
        notification,
        recipients: targetUserIds.length
      },
      message: 'Notification sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send notification',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/notifications
 * List recent notifications (admin only)
 */
router.get('/notifications', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const notifications = await NotificationService.listAdminNotifications(
      Number.isFinite(limit) ? limit : 50
    );

    res.status(200).json({
      success: true,
      data: { notifications },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to list notifications',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

// ===== DEFAULT CONFIGURATION MANAGEMENT =====

/**
 * GET /api/admin/config
 * Get all default configurations (admin only)
 */
router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    const configurations = await ConfigurationService.getAllConfigurations();

    res.status(200).json({
      success: true,
      data: {
        configurations: configurations.map(config => ({
          id: config.id,
          name: config.name,
          description: config.description,
          version: config.version,
          isActive: config.isActive,
          createdBy: config.createdBy,
          createdAt: config.createdAt,
          groupCount: config.configData.groups.length,
          linkCount: config.configData.links.length
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get configurations error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve configurations',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/config/active
 * Get the active default configuration (admin only)
 */
router.get('/config/active', async (req: Request, res: Response): Promise<void> => {
  try {
    const activeConfig = await ConfigurationService.getActiveConfiguration();

    if (!activeConfig) {
      res.status(404).json({
        error: {
          code: 'NO_ACTIVE_CONFIG',
          message: 'No active configuration found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { configuration: activeConfig },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get active configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve active configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/config/:id
 * Get specific configuration by ID (admin only)
 */
router.get('/config/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const configId = parseInt(req.params.id!, 10);
    if (isNaN(configId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_CONFIG_ID',
          message: 'Invalid configuration ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const configuration = await ConfigurationService.getConfigurationById(configId);

    if (!configuration) {
      res.status(404).json({
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { configuration },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/admin/config
 * Create new default configuration (admin only)
 */
router.post('/config', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Configuration name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Configuration name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('configData')
    .notEmpty()
    .withMessage('Configuration data is required')
    .isObject()
    .withMessage('Configuration data must be an object'),
  body('configData.groups')
    .isArray()
    .withMessage('Groups must be an array'),
  body('configData.links')
    .isArray()
    .withMessage('Links must be an array')
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

    const { name, description, configData } = req.body;
    const createdBy = req.user!.userId;

    // Validate configuration data structure
    const validation = ConfigurationService.validateConfigurationData(configData);
    if (!validation.valid) {
      res.status(400).json({
        error: {
          code: 'INVALID_CONFIG_DATA',
          message: 'Invalid configuration data',
          details: validation.errors,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Create configuration
    const newConfig = await ConfigurationService.createConfiguration(
      name,
      description || '',
      configData,
      createdBy
    );

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.config.create',
      entityType: 'configuration',
      entityId: newConfig.id,
      description: `Created configuration "${newConfig.name}"`
    });

    res.status(201).json({
      success: true,
      data: { configuration: newConfig },
      message: 'Configuration created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * PUT /api/admin/config/:id
 * Update existing configuration (admin only)
 */
router.put('/config/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Configuration name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('configData')
    .optional()
    .isObject()
    .withMessage('Configuration data must be an object')
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

    const configId = parseInt(req.params.id!, 10);
    if (isNaN(configId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_CONFIG_ID',
          message: 'Invalid configuration ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Check if configuration exists
    const existingConfig = await ConfigurationService.getConfigurationById(configId);
    if (!existingConfig) {
      res.status(404).json({
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const { name, description, configData } = req.body;

    // Validate configuration data if provided
    if (configData) {
      const validation = ConfigurationService.validateConfigurationData(configData);
      if (!validation.valid) {
        res.status(400).json({
          error: {
            code: 'INVALID_CONFIG_DATA',
            message: 'Invalid configuration data',
            details: validation.errors,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }
    }

    // Update configuration
    const updatedConfig = await ConfigurationService.updateConfiguration(
      configId,
      name || existingConfig.name,
      description !== undefined ? description : existingConfig.description || '',
      configData || existingConfig.configData
    );

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.config.update',
      entityType: 'configuration',
      entityId: updatedConfig.id,
      description: `Updated configuration "${updatedConfig.name}"`
    });

    res.status(200).json({
      success: true,
      data: { configuration: updatedConfig },
      message: 'Configuration updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/admin/config/:id/activate
 * Activate a configuration (admin only)
 */
router.post('/config/:id/activate', async (req: Request, res: Response): Promise<void> => {
  try {
    const configId = parseInt(req.params.id!, 10);
    if (isNaN(configId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_CONFIG_ID',
          message: 'Invalid configuration ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Check if configuration exists
    const configuration = await ConfigurationService.getConfigurationById(configId);
    if (!configuration) {
      res.status(404).json({
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Activate configuration
    await ConfigurationService.activateConfiguration(configId);
    await syncConfigurationToAllUsers(configId, 'merge');

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.config.activate',
      entityType: 'configuration',
      entityId: configId,
      description: `Activated configuration "${configuration.name}"`
    });

    res.status(200).json({
      success: true,
      message: 'Configuration activated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Activate configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to activate configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * DELETE /api/admin/config/:id
 * Delete configuration (admin only)
 */
router.delete('/config/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const configId = parseInt(req.params.id!, 10);
    if (isNaN(configId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_CONFIG_ID',
          message: 'Invalid configuration ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Delete configuration
    await ConfigurationService.deleteConfiguration(configId);

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.config.delete',
      entityType: 'configuration',
      entityId: configId,
      description: 'Deleted configuration'
    });

    res.status(200).json({
      success: true,
      message: 'Configuration deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Cannot delete the active configuration') {
      res.status(400).json({
        error: {
          code: 'CANNOT_DELETE_ACTIVE',
          message: 'Cannot delete the active configuration',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    if (error instanceof Error && error.message === 'Configuration not found') {
      res.status(404).json({
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    console.error('Delete configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/admin/config/from-user/:userId
 * Create configuration from user's current setup (admin only)
 */
router.post('/config/from-user/:userId', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Configuration name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Configuration name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
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

    const userId = parseInt(req.params.userId!, 10);
    if (isNaN(userId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Check if user exists
    const user = await UserService.getUserById(userId);
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

    const { name, description } = req.body;
    const createdBy = req.user!.userId;

    // Create configuration from user's setup
    const newConfig = await ConfigurationService.createFromUser(
      userId,
      name,
      description || '',
      createdBy
    );

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.config.create_from_user',
      entityType: 'configuration',
      entityId: newConfig.id,
      description: `Created configuration from user "${user.username}"`
    });

    res.status(201).json({
      success: true,
      data: { configuration: newConfig },
      message: 'Configuration created from user setup successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create configuration from user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create configuration from user setup',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/config/:id/stats
 * Get configuration statistics (admin only)
 */
router.get('/config/:id/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const configId = parseInt(req.params.id!, 10);
    if (isNaN(configId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_CONFIG_ID',
          message: 'Invalid configuration ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    const stats = await ConfigurationService.getConfigurationStats(configId);

    res.status(200).json({
      success: true,
      data: { stats },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Configuration not found') {
      res.status(404).json({
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    console.error('Get configuration stats error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve configuration statistics',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

// ===== CONFIGURATION PUBLISHING SYSTEM =====

/**
 * POST /api/admin/config/publish
 * Publish configuration changes to users (admin only)
 */
router.post('/config/publish', [
  body('configId')
    .notEmpty()
    .withMessage('Configuration ID is required')
    .isInt({ min: 1 })
    .withMessage('Configuration ID must be a positive integer'),
  body('strategy')
    .notEmpty()
    .withMessage('Strategy is required')
    .isIn(['reset', 'merge'])
    .withMessage('Strategy must be either "reset" or "merge"'),
  body('userIds')
    .optional()
    .isArray()
    .withMessage('User IDs must be an array'),
  body('userIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each user ID must be a positive integer'),
  body('notifyUsers')
    .optional()
    .isBoolean()
    .withMessage('Notify users must be a boolean')
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

    const { configId, strategy, userIds, notifyUsers = true } = req.body;

    // Check if configuration exists
    const configuration = await ConfigurationService.getConfigurationById(configId);
    if (!configuration) {
      res.status(404).json({
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Get target users
    let targetUsers;
    if (userIds && userIds.length > 0) {
      // Apply to specific users
      targetUsers = [];
      for (const userId of userIds) {
        const user = await UserService.getUserById(userId);
        if (user && user.isActive) {
          targetUsers.push(user);
        }
      }
    } else {
      // Apply to all active users
      const allUsers = await UserService.getAllUsers();
      targetUsers = allUsers.filter(user => user.isActive);
    }

    // Apply configuration to each user
    const results = [];
    for (const user of targetUsers) {
      try {
        await ConfigurationService.applyToUser(user.id, configId, strategy);
        results.push({
          userId: user.id,
          username: user.username,
          success: true
        });
      } catch (error) {
        console.error(`Failed to apply configuration to user ${user.id}:`, error);
        results.push({
          userId: user.id,
          username: user.username,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Increment configuration version to trigger sync notifications
    if (results.some(r => r.success)) {
      try {
        await ConfigurationService.incrementVersion(configId);
      } catch (error) {
        console.warn('Failed to increment configuration version:', error);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.config.publish',
      entityType: 'configuration',
      entityId: configId,
      description: `Published configuration to ${successCount} users`
    });

    res.status(200).json({
      success: true,
      data: {
        configurationId: configId,
        strategy,
        totalUsers: targetUsers.length,
        successCount,
        failureCount,
        results
      },
      message: `Configuration published to ${successCount} users successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Publish configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to publish configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/admin/users/:id/reset
 * Reset user to default configuration (admin only)
 */
router.post('/users/:id/reset', [
  body('configId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Configuration ID must be a positive integer'),
  body('strategy')
    .optional()
    .isIn(['reset', 'merge'])
    .withMessage('Strategy must be either "reset" or "merge"')
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

    const userId = parseInt(req.params.id!, 10);
    if (isNaN(userId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Check if user exists
    const user = await UserService.getUserById(userId);
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

    const { configId, strategy = 'reset' } = req.body;

    let targetConfigId = configId;
    if (!targetConfigId) {
      // Use active configuration if none specified
      const activeConfig = await ConfigurationService.getActiveConfiguration();
      if (!activeConfig) {
        res.status(400).json({
          error: {
            code: 'NO_ACTIVE_CONFIG',
            message: 'No active configuration found and no configuration ID specified',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }
      targetConfigId = activeConfig.id;
    }

    // Check if specified configuration exists
    const configuration = await ConfigurationService.getConfigurationById(targetConfigId);
    if (!configuration) {
      res.status(404).json({
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Apply configuration to user
    await ConfigurationService.applyToUser(userId, targetConfigId, strategy);

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.user.reset_config',
      entityType: 'user',
      entityId: userId,
      description: `Reset configuration for user "${user.username}"`
    });

    res.status(200).json({
      success: true,
      data: {
        userId,
        username: user.username,
        configurationId: targetConfigId,
        configurationName: configuration.name,
        strategy
      },
      message: `User configuration ${strategy === 'reset' ? 'reset' : 'synced'} successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reset user configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reset user configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * POST /api/admin/users/:id/sync
 * Sync user with default configuration (incremental merge) (admin only)
 */
router.post('/users/:id/sync', [
  body('configId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Configuration ID must be a positive integer')
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

    const userId = parseInt(req.params.id!, 10);
    if (isNaN(userId)) {
      res.status(400).json({
        error: {
          code: 'INVALID_USER_ID',
          message: 'Invalid user ID',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Check if user exists
    const user = await UserService.getUserById(userId);
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

    const { configId } = req.body;

    let targetConfigId = configId;
    if (!targetConfigId) {
      // Use active configuration if none specified
      const activeConfig = await ConfigurationService.getActiveConfiguration();
      if (!activeConfig) {
        res.status(400).json({
          error: {
            code: 'NO_ACTIVE_CONFIG',
            message: 'No active configuration found and no configuration ID specified',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }
      targetConfigId = activeConfig.id;
    }

    // Check if specified configuration exists
    const configuration = await ConfigurationService.getConfigurationById(targetConfigId);
    if (!configuration) {
      res.status(404).json({
        error: {
          code: 'CONFIG_NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Apply configuration to user with merge strategy
    await ConfigurationService.applyToUser(userId, targetConfigId, 'merge');

    await logAudit(req, {
      userId: req.user!.userId,
      action: 'admin.user.sync_config',
      entityType: 'user',
      entityId: userId,
      description: `Synced configuration for user "${user.username}"`
    });

    res.status(200).json({
      success: true,
      data: {
        userId,
        username: user.username,
        configurationId: targetConfigId,
        configurationName: configuration.name,
        strategy: 'merge'
      },
      message: 'User configuration synced successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync user configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to sync user configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

/**
 * GET /api/admin/config/notifications
 * Get configuration change notifications (admin only)
 */
router.get('/config/notifications', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get recent configuration changes (last 30 days)
    const configurations = await ConfigurationService.getAllConfigurations();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentChanges = configurations
      .filter(config => config.createdAt > thirtyDaysAgo)
      .map(config => ({
        id: config.id,
        name: config.name,
        version: config.version,
        isActive: config.isActive,
        createdBy: config.createdBy,
        createdAt: config.createdAt,
        changeType: config.isActive ? 'activated' : 'created'
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.status(200).json({
      success: true,
      data: {
        notifications: recentChanges,
        count: recentChanges.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get configuration notifications error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve configuration notifications',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

export default router;
