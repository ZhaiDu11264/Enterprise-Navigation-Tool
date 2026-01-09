import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { LinkService } from '../models/WebsiteLink';
import { ConfigurationService } from '../models/DefaultConfiguration';

const router = Router();

const getRequestId = (req: Request): string => {
  const requestId = req.headers['x-request-id'];
  return typeof requestId === 'string' ? requestId : 'unknown';
};

router.use(authenticateToken);

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

    let links = await LinkService.getUserLinks(req.user.userId);
    const hasSystemLink = links.some(link => link.isSystemLink);

    if (!hasSystemLink) {
      const activeConfig = await ConfigurationService.getActiveConfiguration();
      if (activeConfig) {
        await ConfigurationService.applyToUser(req.user.userId, activeConfig.id, 'merge');
        links = await LinkService.getUserLinks(req.user.userId);
      }
    }

    res.status(200).json({
      success: true,
      data: { links },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve links',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

router.post('/', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Link name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Link name must be between 1 and 200 characters'),
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({ require_protocol: true })
    .withMessage('Valid URL with protocol (http/https) is required'),
  body('groupId')
    .isInt({ min: 1 })
    .withMessage('Group ID must be a positive integer'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('iconUrl')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Icon URL must not exceed 500 characters'),
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

    const { name, url, description, iconUrl, groupId, sortOrder } = req.body;

    const link = await LinkService.createLink(req.user.userId, {
      name,
      url,
      description,
      iconUrl,
      groupId: parseInt(groupId, 10),
      sortOrder
    });

    res.status(201).json({
      success: true,
      data: { link },
      message: 'Link created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to create link';
    const code = message.includes('Group not found') ? 'GROUP_NOT_FOUND' : 'INTERNAL_ERROR';

    console.error('Create link error:', error);
    res.status(code === 'GROUP_NOT_FOUND' ? 404 : 500).json({
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

router.put('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Link ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Link name cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Link name must be between 1 and 200 characters'),
  body('url')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('URL cannot be empty')
    .isURL({ require_protocol: true })
    .withMessage('Valid URL with protocol (http/https) is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('iconUrl')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Icon URL must not exceed 500 characters'),
  body('groupId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Group ID must be a positive integer'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean')
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

    const linkId = parseInt(req.params.id!, 10);
    const existingLink = await LinkService.getLinkById(linkId);
    if (!existingLink) {
      res.status(404).json({
        error: {
          code: 'LINK_NOT_FOUND',
          message: 'Link not found',
          timestamp: new Date().toISOString(),
          requestId: getRequestId(req)
        }
      });
      return;
    }

    const updates: any = {};
    const allowed = ['name', 'url', 'description', 'iconUrl', 'groupId', 'sortOrder', 'isFavorite'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (existingLink.isSystemLink && req.user.role !== 'admin') {
      const allowedUserFields = ['isFavorite'];
      const attemptedFields = Object.keys(updates);
      const forbiddenFields = attemptedFields.filter(field => !allowedUserFields.includes(field));

      if (forbiddenFields.length > 0) {
        res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Only administrators can edit system links',
            timestamp: new Date().toISOString(),
            requestId: getRequestId(req)
          }
        });
        return;
      }
    }

    const link = await LinkService.updateLink(linkId, req.user.userId, updates);

    res.status(200).json({
      success: true,
      data: { link },
      message: 'Link updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to update link';
    const code = message.includes('not found')
      ? 'LINK_NOT_FOUND'
      : message.includes('Target group')
        ? 'GROUP_NOT_FOUND'
        : 'INTERNAL_ERROR';

    console.error('Update link error:', error);
    res.status(code === 'LINK_NOT_FOUND' ? 404 : code === 'GROUP_NOT_FOUND' ? 404 : 500).json({
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

router.delete('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Link ID must be a positive integer')
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

    const linkId = parseInt(req.params.id!, 10);
    const allowSystemDelete = req.user.role === 'admin';
    await LinkService.deleteLink(linkId, req.user.userId, allowSystemDelete);

    res.status(200).json({
      success: true,
      message: 'Link deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to delete link';
    const code = message.includes('not found') ? 'LINK_NOT_FOUND' : 'INTERNAL_ERROR';

    console.error('Delete link error:', error);
    res.status(code === 'LINK_NOT_FOUND' ? 404 : 500).json({
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

router.post('/:id/access', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Link ID must be a positive integer')
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

    const linkId = parseInt(req.params.id!, 10);
    await LinkService.recordAccess(linkId, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Access recorded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Record access error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to record access',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

router.get('/favorites', async (req: Request, res: Response): Promise<void> => {
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

    const links = await LinkService.getFavoriteLinks(req.user.userId);
    res.status(200).json({
      success: true,
      data: { links },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get favorite links error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve favorite links',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

router.get('/recent', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
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

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const links = await LinkService.getRecentLinks(req.user.userId, limit);

    res.status(200).json({
      success: true,
      data: { links, count: links.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get recent links error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve recent links',
        timestamp: new Date().toISOString(),
        requestId: getRequestId(req)
      }
    });
  }
});

export default router;
