import { Router, Request, Response } from 'express';
import { query, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { NotificationService } from '../models/Notification';

const router = Router();

const getRequestId = (req: Request): string => {
  const requestId = req.headers['x-request-id'];
  return typeof requestId === 'string' ? requestId : 'unknown';
};

router.use(authenticateToken);

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
router.get('/', [
  query('unread')
    .optional()
    .isBoolean()
    .withMessage('unread must be a boolean')
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
          requestId: getRequestId(req)
        }
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    const unreadOnly = req.query.unread === 'true';
    const notifications = await NotificationService.listUserNotifications(req.user.userId, unreadOnly);

    res.status(200).json({
      success: true,
      data: { notifications },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve notifications',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

/**
 * POST /api/notifications/:id/read
 * Mark notification as read
 */
router.post('/:id/read', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Notification ID must be a positive integer')
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
          requestId: getRequestId(req)
        }
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    const notificationId = parseInt(req.params.id!, 10);
    await NotificationService.markAsRead(req.user.userId, notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update notification',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification for the current user
 */
router.delete('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Notification ID must be a positive integer')
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
          requestId: getRequestId(req)
        }
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    const notificationId = parseInt(req.params.id!, 10);
    await NotificationService.deleteForUser(req.user.userId, notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete notification',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

/**
 * DELETE /api/notifications
 * Clear all notifications for the current user
 */
router.delete('/', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    await NotificationService.clearForUser(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Notifications cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to clear notifications',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

export default router;
