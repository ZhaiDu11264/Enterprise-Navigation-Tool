import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { FeedbackService } from '../models/Feedback';
import { logAudit } from '../utils/audit';

const router = Router();

/**
 * POST /api/feedback
 * Create user feedback entry
 */
router.post('/',
  authenticateToken,
  [
    body('type')
      .isIn(['bug', 'feature', 'ui', 'data', 'other'])
      .withMessage('Invalid feedback type'),
    body('message')
      .trim()
      .isLength({ min: 5, max: 2000 })
      .withMessage('Message must be between 5 and 2000 characters')
  ],
  async (req: Request, res: Response): Promise<void> => {
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

      const userId = req.user!.userId;
      const { type, message } = req.body as { type: string; message: string };

      const feedback = await FeedbackService.createFeedback(userId, type as any, message.trim());

      await logAudit(req, {
        userId,
        action: 'feedback.create',
        entityType: 'feedback',
        entityId: feedback.id,
        description: `Submitted feedback (${feedback.type})`
      });

      res.status(201).json({
        success: true,
        data: { feedback },
        message: 'Feedback submitted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Feedback create error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit feedback',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }
);

export default router;
