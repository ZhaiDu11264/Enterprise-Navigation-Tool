import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { LinkService } from '../models/WebsiteLink';

const router = Router();

// Apply authentication middleware to all search routes
router.use(authenticateToken);

// Search links endpoint
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { q: query, limit } = req.query;

    // Validate search query
    if (!query || typeof query !== 'string') {
      res.status(400).json({
        error: {
          code: 'INVALID_QUERY',
          message: 'Search query is required and must be a string',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Validate query length
    if (query.trim().length === 0) {
      res.status(400).json({
        error: {
          code: 'EMPTY_QUERY',
          message: 'Search query cannot be empty',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    if (query.length > 100) {
      res.status(400).json({
        error: {
          code: 'QUERY_TOO_LONG',
          message: 'Search query cannot exceed 100 characters',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
      return;
    }

    // Parse limit parameter
    let searchLimit = 50; // Default limit
    if (limit && typeof limit === 'string') {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
        searchLimit = parsedLimit;
      }
    }

    // Perform search
    const results = await LinkService.searchLinks(userId, query.trim());
    
    // Apply limit to results
    const limitedResults = results.slice(0, searchLimit);

    res.json({
      query: query.trim(),
      results: limitedResults,
      totalCount: results.length,
      returnedCount: limitedResults.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: {
        code: 'SEARCH_ERROR',
        message: 'An error occurred while searching',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

// Get recent links endpoint
router.get('/recent', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { limit } = req.query;

    // Parse limit parameter
    let searchLimit = 10; // Default limit for recent links
    if (limit && typeof limit === 'string') {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 50) {
        searchLimit = parsedLimit;
      }
    }

    const recentLinks = await LinkService.getRecentLinks(userId, searchLimit);

    res.json({
      recent: recentLinks,
      count: recentLinks.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recent links error:', error);
    res.status(500).json({
      error: {
        code: 'RECENT_LINKS_ERROR',
        message: 'An error occurred while fetching recent links',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

// Get favorite links endpoint
router.get('/favorites', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const favoriteLinks = await LinkService.getFavoriteLinks(userId);

    res.json({
      favorites: favoriteLinks,
      count: favoriteLinks.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Favorite links error:', error);
    res.status(500).json({
      error: {
        code: 'FAVORITE_LINKS_ERROR',
        message: 'An error occurred while fetching favorite links',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
});

export default router;
