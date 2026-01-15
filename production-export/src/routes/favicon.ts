import express, { Request, Response } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { faviconService } from '../services/faviconService';
import config from '../config/environment';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/x-icon'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPEG, GIF, SVG, and ICO files are allowed.'));
    }
  }
});

/**
 * POST /api/favicon/extract
 * Extract favicon from a given URL
 */
router.post('/extract',
  authenticateToken,
  [
    body('url')
      .isURL({ protocols: ['http', 'https'] })
      .withMessage('Valid URL is required')
      .trim()
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

      const { url } = req.body;
      const faviconUrl = await faviconService.extractFavicon(url);

      res.json({
        success: true,
        data: {
          url,
          faviconUrl,
          cached: faviconUrl !== faviconService.getDefaultIcon(),
          success: faviconUrl !== faviconService.getDefaultIcon()
        }
      });
    } catch (error) {
      console.error('Error in favicon extraction:', error);
      res.status(500).json({
        error: {
          code: 'FAVICON_EXTRACTION_ERROR',
          message: 'Failed to extract favicon',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }
);

/**
 * POST /api/favicon/upload
 * Upload custom favicon file
 */
router.post('/upload',
  authenticateToken,
  upload.single('icon'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: {
            code: 'NO_FILE_PROVIDED',
            message: 'No icon file provided',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const iconUrl = await faviconService.uploadCustomIcon(req.file);

      res.json({
        success: true,
        data: {
          iconUrl,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('Error in favicon upload:', error);
      
      let statusCode = 500;
      let errorCode = 'FAVICON_UPLOAD_ERROR';
      let message = 'Failed to upload favicon';

      if (error instanceof Error) {
        if (error.message.includes('Invalid file type')) {
          statusCode = 400;
          errorCode = 'INVALID_FILE_TYPE';
          message = error.message;
        } else if (error.message.includes('File too large')) {
          statusCode = 413;
          errorCode = 'FILE_TOO_LARGE';
          message = 'File size exceeds maximum limit';
        }
      }

      res.status(statusCode).json({
        error: {
          code: errorCode,
          message,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }
);

/**
 * GET /api/favicon/domain/:domain
 * Get favicon URL for a specific domain
 */
router.get('/domain/:domain',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { domain } = req.params;
      
      if (!domain || domain.trim() === '') {
        res.status(400).json({
          error: {
            code: 'INVALID_DOMAIN',
            message: 'Domain parameter is required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const faviconUrl = await faviconService.getFaviconUrl(domain);

      res.json({
        success: true,
        data: {
          domain,
          faviconUrl,
          isDefault: faviconUrl === faviconService.getDefaultIcon()
        }
      });
    } catch (error) {
      console.error('Error getting favicon for domain:', error);
      res.status(500).json({
        error: {
          code: 'FAVICON_LOOKUP_ERROR',
          message: 'Failed to get favicon for domain',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }
);

/**
 * GET /api/favicon/default
 * Get default favicon URL
 */
router.get('/default', (req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      faviconUrl: faviconService.getDefaultIcon()
    }
  });
});

/**
 * DELETE /api/favicon/cache/:domain
 * Clear cached favicon for a domain (admin only)
 */
router.delete('/cache/:domain',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admin role required for cache management',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const { domain } = req.params;
      
      if (!domain || domain.trim() === '') {
        res.status(400).json({
          error: {
            code: 'INVALID_DOMAIN',
            message: 'Domain parameter is required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Clear cache entry for the domain
      const pool = (await import('../config/database')).default;
      await pool.execute('DELETE FROM favicon_cache WHERE domain = ?', [domain]);

      res.json({
        success: true,
        data: {
          domain,
          message: 'Cache cleared successfully'
        }
      });
    } catch (error) {
      console.error('Error clearing favicon cache:', error);
      res.status(500).json({
        error: {
          code: 'CACHE_CLEAR_ERROR',
          message: 'Failed to clear favicon cache',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }
);

/**
 * POST /api/favicon/cache/cleanup
 * Clean up expired cache entries (admin only)
 */
router.post('/cache/cleanup',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admin role required for cache management',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      await faviconService.cleanupExpiredCache();

      res.json({
        success: true,
        data: {
          message: 'Expired cache entries cleaned up successfully'
        }
      });
    } catch (error) {
      console.error('Error cleaning up favicon cache:', error);
      res.status(500).json({
        error: {
          code: 'CACHE_CLEANUP_ERROR',
          message: 'Failed to clean up favicon cache',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }
);

export default router;
