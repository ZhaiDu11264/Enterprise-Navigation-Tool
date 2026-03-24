import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { GroupService } from '../models/Group';
import { ConfigurationService } from '../models/DefaultConfiguration';
import { authenticateToken } from '../middleware/auth';
import { logAudit } from '../utils/audit';

const router = Router();
const syncDefaultConfigForAdmin = async (userId: number, reason: string) => {
  try {
    await ConfigurationService.rebuildFromAdmin(userId, reason);
  } catch (error) {
    console.error('Auto rebuild default configuration failed:', error);
  }
};
const lockedGroupNames = new Set(['内部办公', '农投AI创意事业部', '热门推荐']);

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

    // Always sync from active default configuration so system groups come from admin config
    const activeConfig = await ConfigurationService.getActiveConfiguration();
    if (activeConfig) {
      await ConfigurationService.applyToUser(req.user!.userId, activeConfig.id, 'sync');
    }

    const groups = await GroupService.getUserGroups(req.user!.userId);

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
  body('isSystemGroup')
    .optional()
    .isBoolean()
    .withMessage('isSystemGroup must be a boolean'),
  body('isDeletable')
    .optional()
    .isBoolean()
    .withMessage('isDeletable must be a boolean'),
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

    const { name, description, sortOrder, isSystemGroup: requestedSystemGroup, isDeletable: requestedDeletable } = req.body;

    if (req.user.role !== 'admin' && lockedGroupNames.has(name)) {
      res.status(403).json({
        error: {
          code: 'GROUP_NAME_LOCKED',
          message: 'This group is managed by the administrator',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }


    if (requestedSystemGroup && req.user.role !== 'admin') {
      res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only administrators can create system groups',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    const isSystemGroup = req.user.role === 'admin' && Boolean(requestedSystemGroup);
    const isDeletable = isSystemGroup ? false : (requestedDeletable !== undefined ? Boolean(requestedDeletable) : true);

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
      sortOrder,
      isSystemGroup,
      isDeletable
    });

    await logAudit(req, {
      userId: req.user.userId,
      action: 'group.create',
      entityType: 'group',
      entityId: newGroup.id,
      description: `Created group "${newGroup.name}"`
    });

    if (req.user.role === 'admin') {
      await syncDefaultConfigForAdmin(req.user.userId, 'Auto rebuild after group.create');
    }

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

    const existingGroup = await GroupService.getGroupById(groupId);
    if (!existingGroup) {
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

    if (existingGroup.isSystemGroup && req.user!.role !== 'admin') {
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

    if (req.user!.role !== 'admin' && lockedGroupNames.has(existingGroup.name)) {
      res.status(403).json({
        error: {
          code: 'GROUP_LOCKED',
          message: 'This group is managed by the administrator',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    // If name is being updated, check if it already exists for this user
    if (updates.name) {
      if (req.user!.role !== 'admin' && lockedGroupNames.has(updates.name)) {
        res.status(403).json({
          error: {
            code: 'GROUP_NAME_LOCKED',
            message: 'This group is managed by the administrator',
            timestamp: new Date().toISOString(),
            requestId: getRequestId(req)
          }
        });
        return;
      }
      const duplicateGroup = await GroupService.getGroupByName(req.user!.userId, updates.name);
      if (duplicateGroup && duplicateGroup.id !== groupId) {
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
    if (updatedGroup.isSystemGroup) {
      await GroupService.autoSyncToDefaultConfig(req.user!.userId, updatedGroup);
    }

    await logAudit(req, {
      userId: req.user.userId,
      action: 'group.update',
      entityType: 'group',
      entityId: updatedGroup.id,
      description: `Updated group "${updatedGroup.name}"`
    });

    if (req.user.role === 'admin') {
      await syncDefaultConfigForAdmin(req.user.userId, 'Auto rebuild after group.update');
    }

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
    const group = await GroupService.getGroupById(groupId);
    if (!group) {
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

    if (group.isSystemGroup && req.user!.role !== 'admin') {
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

    if (req.user!.role !== 'admin' && lockedGroupNames.has(group.name)) {
      res.status(403).json({
        error: {
          code: 'GROUP_LOCKED',
          message: 'This group is managed by the administrator',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    await GroupService.deleteGroup(groupId, req.user!.userId, { allowSystemDelete: req.user!.role === 'admin' });
    if (group.isSystemGroup && req.user!.role === 'admin') {
      await GroupService.removeSystemGroupFromDefaultConfig(req.user!.userId, group.name);
    }

    await logAudit(req, {
      userId: req.user.userId,
      action: 'group.delete',
      entityType: 'group',
      entityId: groupId,
      description: 'Deleted group'
    });

    if (req.user.role === 'admin') {
      await syncDefaultConfigForAdmin(req.user.userId, 'Auto rebuild after group.delete');
    }

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

    if (req.user.role !== 'admin') {
      for (const order of groupOrders) {
        const group = await GroupService.getGroupById(order.id);
        if (group && lockedGroupNames.has(group.name)) {
          res.status(403).json({
            error: {
              code: 'GROUP_LOCKED',
              message: 'This group is managed by the administrator',
              timestamp: new Date().toISOString(),
              requestId: getRequestId(req)
            }
          });
          return;
        }
      }
    }

    await GroupService.reorderGroups(req.user.userId, groupOrders);

    await logAudit(req, {
      userId: req.user.userId,
      action: 'group.reorder',
      entityType: 'group',
      description: `Reordered ${groupOrders.length} groups`
    });

    if (req.user.role === 'admin') {
      await syncDefaultConfigForAdmin(req.user.userId, 'Auto rebuild after group.reorder');
    }

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
