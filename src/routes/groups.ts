import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { GroupService } from '../models/Group';
import { ConfigurationService } from '../models/DefaultConfiguration';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Helper function to get request ID
const getRequestId = (req: Request): string => {
  const requestId = req.headers['x-request-id'];
  return (typeof requestId === 'string' ? requestId : 'unknown');
};

// All group routes require authentication
router.use(authenticateToken);

/**
 * GET /api/groups
 * Get all groups for the authenticated user
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
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

    let groups = await GroupService.getUserGroups(req.user!.userId);
    const hasSystemGroup = groups.some(group => group.isSystemGroup);

    if (!hasSystemGroup) {
      const activeConfig = await ConfigurationService.getActiveConfiguration();
      if (activeConfig) {
        await ConfigurationService.applyToUser(req.user!.userId, activeConfig.id, 'merge');
        groups = await GroupService.getUserGroups(req.user!.userId);
      }
    }

    res.status(200).json({
      success: true,
      data: { groups },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve groups',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

/**
 * GET /api/groups/:id
 * Get a specific group by ID
 */
router.get('/:id', [
  param('id')
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

    const groupId = parseInt(req.params.id!);
    const existingGroup = await GroupService.getGroupById(groupId);
    if (existingGroup && existingGroup.isSystemGroup && req.user.role !== 'admin') {
      res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only administrators can edit system groups',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }
    
    // Check if user owns the group
    const userOwnsGroup = await GroupService.userOwnsGroup(req.user!.userId, groupId);
    if (!userOwnsGroup) {
      res.status(404).json({
        error: {
          code: 'GROUP_NOT_FOUND',
          message: 'Group not found or access denied',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    const group = await GroupService.getGroupById(groupId);
    if (!group) {
      res.status(404).json({
        error: {
          code: 'GROUP_NOT_FOUND',
          message: 'Group not found',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { group },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve group',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

/**
 * POST /api/groups
 * Create a new group
 */
router.post('/', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Group name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('sortOrder')
    .optional()
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

    const { name, description, sortOrder } = req.body;

    // Check if group name already exists for this user
    const existingGroup = await GroupService.getGroupByName(req.user!.userId, name);
    if (existingGroup) {
      res.status(409).json({
        error: {
          code: 'GROUP_NAME_EXISTS',
          message: 'A group with this name already exists',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    const newGroup = await GroupService.createGroup(req.user!.userId, {
      name,
      description,
      sortOrder
    });

    res.status(201).json({
      success: true,
      data: { group: newGroup },
      message: 'Group created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create group',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

/**
 * PUT /api/groups/:id
 * Update an existing group
 */
router.put('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Group ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Group name cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Group name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('sortOrder')
    .optional()
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

    const groupId = parseInt(req.params.id!);
    const updates = req.body;

    // If name is being updated, check if it already exists for this user
    if (updates.name) {
      const existingGroup = await GroupService.getGroupByName(req.user!.userId, updates.name);
      if (existingGroup && existingGroup.id !== groupId) {
        res.status(409).json({
          error: {
            code: 'GROUP_NAME_EXISTS',
            message: 'A group with this name already exists',
            timestamp: new Date().toISOString(),
            requestId: getRequestId(req)
          }
        });
        return;
      }
    }

    const updatedGroup = await GroupService.updateGroup(groupId, req.user!.userId, updates);

    res.status(200).json({
      success: true,
      data: { group: updatedGroup },
      message: 'Group updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update group error:', error);
    
    if (error instanceof Error && (error.message.includes('not found') || error.message.includes('access denied'))) {
      res.status(404).json({
        error: {
          code: 'GROUP_NOT_FOUND',
          message: 'Group not found or access denied',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update group',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

/**
 * DELETE /api/groups/:id
 * Delete a group (soft delete)
 */
router.delete('/:id', [
  param('id')
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

    const groupId = parseInt(req.params.id!);
    await GroupService.deleteGroup(groupId, req.user!.userId);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete group error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        res.status(404).json({
          error: {
            code: 'GROUP_NOT_FOUND',
            message: 'Group not found or access denied',
            timestamp: new Date().toISOString(),
            requestId: getRequestId(req)
          }
        });
        return;
      }

      if (error.message.includes('Cannot delete system group')) {
        res.status(403).json({
          error: {
            code: 'SYSTEM_GROUP_PROTECTED',
            message: 'Cannot delete system group',
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
        message: 'Failed to delete group',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

// PUT /api/groups/reorder - Reorder groups for the authenticated user
router.put('/reorder', [
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

    res.status(200).json({
      success: true,
      message: 'Groups reordered successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reorder groups error:', error);
    
    if (error instanceof Error && (error.message.includes('not found') || error.message.includes('access denied'))) {
      res.status(404).json({
        error: {
          code: 'GROUP_NOT_FOUND',
          message: 'One or more groups not found or access denied',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
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
