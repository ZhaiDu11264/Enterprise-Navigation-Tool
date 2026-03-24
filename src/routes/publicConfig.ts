import { Router, Request, Response } from 'express';
import { ConfigurationService } from '../models/DefaultConfiguration';

const router = Router();

/**
 * GET /api/public/config
 * Get active default configuration for unauthenticated users
 */
router.get('/config', async (_req: Request, res: Response): Promise<void> => {
  try {
    const activeConfig = await ConfigurationService.getActiveConfiguration();
    if (!activeConfig) {
      res.status(200).json({
        success: true,
        data: { groups: [], links: [] },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        groups: activeConfig.configData.groups,
        links: activeConfig.configData.links
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Public config error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to load public configuration',
        timestamp: new Date().toISOString(),
        requestId: 'public'
      }
    });
  }
});

export default router;
