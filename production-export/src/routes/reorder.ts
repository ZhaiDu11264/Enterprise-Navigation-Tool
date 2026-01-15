import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { LinkService } from '../models/WebsiteLink';
import { GroupService } from '../models/Group';
import { authenticateToken } from '../middleware/auth';
import { LinkOrder } from '../models/interfaces';
import { logAudit } from '../utils/audit';

const router = Router();

// Helper function to get request ID
const getRequestId = (req: Request): string => {
  const requestId = req.headers['x-request-id'];
  return (typeof requestId === 'string' ? requestId : 'unknown');
};

// All reorder routes require authentication
router.use(authenticateToken);

/**
 * PUT /api/reorder/batch
 * Batch reordering operation for both links and groups
 * Supports complex drag-and-drop scenarios including moving links between groups
 */
router.put('/batch', [
  body('operations')
    .isArray()
    .withMessage('Operations must be an array'),
  body('operations.*.type')
    .isIn(['link', 'group'])
    .withMessage('Operation type must be either "link" or "group"'),
  body('operations.*.id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  body('operations.*.sortOrder')
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('operations.*.groupId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Group ID must be a positive integer')
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

    const { operations } = req.body;

    if (!Array.isArray(operations) || operations.length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Operations array cannot be empty',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    // Separate link and group operations
    const linkOperations: LinkOrder[] = [];
    const groupOperations: { id: number; sortOrder: number }[] = [];

    for (const operation of operations) {
      if (operation.type === 'link') {
        linkOperations.push({
          id: operation.id,
          sortOrder: operation.sortOrder,
          groupId: operation.groupId
        });
      } else if (operation.type === 'group') {
        groupOperations.push({
          id: operation.id,
          sortOrder: operation.sortOrder
        });
      }
    }

    // Execute operations in sequence to maintain consistency
    if (groupOperations.length > 0) {
      await GroupService.reorderGroups(req.user.userId, groupOperations);
    }

    if (linkOperations.length > 0) {
      await LinkService.reorderLinks(req.user.userId, linkOperations);
    }

    await logAudit(req, {
      userId: req.user.userId,
      action: 'reorder.batch',
      description: `Batch reorder: ${linkOperations.length} links, ${groupOperations.length} groups`
    });

    res.status(200).json({
      success: true,
      message: 'Batch reordering completed successfully',
      data: {
        processedOperations: operations.length,
        linkOperations: linkOperations.length,
        groupOperations: groupOperations.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch reorder error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        res.status(404).json({
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId: getRequestId(req)
          }
        });
        return;
      }
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to execute batch reordering',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

/**
 * PUT /api/reorder/links
 * Reorder multiple links, optionally moving them between groups
 */
router.put('/links', [
  body('linkOrders')
    .isArray()
    .withMessage('Link orders must be an array'),
  body('linkOrders.*.id')
    .isInt({ min: 1 })
    .withMessage('Link ID must be a positive integer'),
  body('linkOrders.*.sortOrder')
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('linkOrders.*.groupId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Group ID must be a positive integer')
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

    const { linkOrders } = req.body;

    if (!Array.isArray(linkOrders) || linkOrders.length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Link orders array cannot be empty',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    await LinkService.reorderLinks(req.user.userId, linkOrders as LinkOrder[]);

    await logAudit(req, {
      userId: req.user.userId,
      action: 'reorder.links',
      description: `Reordered ${linkOrders.length} links`
    });

    res.status(200).json({
      success: true,
      message: 'Links reordered successfully',
      data: {
        processedLinks: linkOrders.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reorder links error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        res.status(404).json({
          error: {
            code: 'LINK_NOT_FOUND',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId: getRequestId(req)
          }
        });
        return;
      }
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reorder links',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

/**
 * PUT /api/reorder/groups
 * Reorder multiple groups
 */
router.put('/groups', [
  body('groupOrders')
    .isArray()
    .withMessage('Group orders must be an array'),
  body('groupOrders.*.id')
    .isInt({ min: 1 })
    .withMessage('Group ID must be a positive integer'),
  body('groupOrders.*.sortOrder')
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
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

    const { groupOrders } = req.body;

    if (!Array.isArray(groupOrders) || groupOrders.length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Group orders array cannot be empty',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    await GroupService.reorderGroups(req.user.userId, groupOrders);

    await logAudit(req, {
      userId: req.user.userId,
      action: 'reorder.groups',
      description: `Reordered ${groupOrders.length} groups`
    });

    res.status(200).json({
      success: true,
      message: 'Groups reordered successfully',
      data: {
        processedGroups: groupOrders.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reorder groups error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        res.status(404).json({
          error: {
            code: 'GROUP_NOT_FOUND',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId: getRequestId(req)
          }
        });
        return;
      }
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reorder groups',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

export default router;
