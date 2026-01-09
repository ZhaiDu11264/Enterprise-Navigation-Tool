import { Router, Request, Response } from 'express';
import { ConfigurationService } from '../models/DefaultConfiguration';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all config routes
router.use(authenticateToken);

/**
 * GET /api/config/status
 * Get current configuration status for sync checking (authenticated users)
 */
router.get('/status', async (req: Request, res: Response): Promise<void> => {
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
 * POST /api/config/refresh
 * Force refresh user's configuration from active default config
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
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

    // Apply active configuration to user with merge strategy
    await ConfigurationService.applyToUser(userId, activeConfig.id, 'merge');

    res.status(200).json({
      success: true,
      message: 'Configuration refreshed successfully',
      data: {
        configurationId: activeConfig.id,
        version: activeConfig.version
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Refresh configuration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to refresh configuration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

export default router;