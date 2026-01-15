import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { LinkService } from '../models/WebsiteLink';
import { ExportService } from '../services/exportService';
import { logAudit } from '../utils/audit';

const router = Router();

// Batch delete links
router.post('/links/delete',
  authenticateToken,
  [
    body('linkIds')
      .isArray({ min: 1 })
      .withMessage('linkIds must be a non-empty array'),
    body('linkIds.*')
      .isInt({ min: 1 })
      .withMessage('Each linkId must be a positive integer'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.userId;
      const { linkIds } = req.body;

      let successCount = 0;
      const errors_list: string[] = [];

      for (const linkId of linkIds) {
        try {
          await LinkService.deleteLink(userId, linkId);
          successCount++;
        } catch (error) {
          errors_list.push(`Failed to delete link ${linkId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await logAudit(req, {
        userId,
        action: 'batch.links.delete',
        description: `Batch deleted ${successCount} links`
      });

      return res.status(200).json({
        message: 'Batch delete completed',
        data: {
          success: true,
          affectedCount: successCount,
          errors: errors_list
        }
      });

    } catch (error) {
      console.error('Batch delete error:', error);
      return res.status(500).json({
        error: 'Internal server error during batch delete',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Batch move links to different group
router.post('/links/move',
  authenticateToken,
  [
    body('linkIds')
      .isArray({ min: 1 })
      .withMessage('linkIds must be a non-empty array'),
    body('linkIds.*')
      .isInt({ min: 1 })
      .withMessage('Each linkId must be a positive integer'),
    body('targetGroupId')
      .isInt({ min: 1 })
      .withMessage('targetGroupId must be a positive integer'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.userId;
      const { linkIds, targetGroupId } = req.body;

      let successCount = 0;
      const errors_list: string[] = [];

      for (const linkId of linkIds) {
        try {
          await LinkService.updateLink(userId, linkId, { groupId: targetGroupId });
          successCount++;
        } catch (error) {
          errors_list.push(`Failed to move link ${linkId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await logAudit(req, {
        userId,
        action: 'batch.links.move',
        description: `Batch moved ${successCount} links to group ${targetGroupId}`
      });

      return res.status(200).json({
        message: 'Batch move completed',
        data: {
          success: true,
          affectedCount: successCount,
          errors: errors_list
        }
      });

    } catch (error) {
      console.error('Batch move error:', error);
      return res.status(500).json({
        error: 'Internal server error during batch move',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Batch edit links
router.post('/links/edit',
  authenticateToken,
  [
    body('linkIds')
      .isArray({ min: 1 })
      .withMessage('linkIds must be a non-empty array'),
    body('linkIds.*')
      .isInt({ min: 1 })
      .withMessage('Each linkId must be a positive integer'),
    body('updates')
      .isObject()
      .withMessage('updates must be an object'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.userId;
      const { linkIds, updates } = req.body;

      // Filter allowed update fields
      const allowedFields = ['name', 'url', 'description', 'iconUrl', 'groupId', 'isFavorite'];
      const filteredUpdates: any = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({
          error: 'No valid update fields provided'
        });
      }

      let successCount = 0;
      const errors_list: string[] = [];

      for (const linkId of linkIds) {
        try {
          await LinkService.updateLink(userId, linkId, filteredUpdates);
          successCount++;
        } catch (error) {
          errors_list.push(`Failed to update link ${linkId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await logAudit(req, {
        userId,
        action: 'batch.links.edit',
        description: `Batch edited ${successCount} links`
      });

      return res.status(200).json({
        message: 'Batch edit completed',
        data: {
          success: true,
          affectedCount: successCount,
          errors: errors_list
        }
      });

    } catch (error) {
      console.error('Batch edit error:', error);
      return res.status(500).json({
        error: 'Internal server error during batch edit',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Batch toggle favorite
router.post('/links/favorite',
  authenticateToken,
  [
    body('linkIds')
      .isArray({ min: 1 })
      .withMessage('linkIds must be a non-empty array'),
    body('linkIds.*')
      .isInt({ min: 1 })
      .withMessage('Each linkId must be a positive integer'),
    body('isFavorite')
      .isBoolean()
      .withMessage('isFavorite must be a boolean'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user!.userId;
      const { linkIds, isFavorite } = req.body;

      let successCount = 0;
      const errors_list: string[] = [];

      for (const linkId of linkIds) {
        try {
          await LinkService.updateLink(userId, linkId, { isFavorite });
          successCount++;
        } catch (error) {
          errors_list.push(`Failed to update favorite status for link ${linkId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await logAudit(req, {
        userId,
        action: 'batch.links.favorite',
        description: `Batch updated favorite for ${successCount} links`
      });

      return res.status(200).json({
        message: 'Batch favorite update completed',
        data: {
          success: true,
          affectedCount: successCount,
          errors: errors_list
        }
      });

    } catch (error) {
      console.error('Batch favorite error:', error);
      return res.status(500).json({
        error: 'Internal server error during batch favorite update',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Batch export selected links
router.post('/export',
  authenticateToken,
  [
    body('linkIds')
      .isArray({ min: 1 })
      .withMessage('linkIds must be a non-empty array'),
    body('linkIds.*')
      .isInt({ min: 1 })
      .withMessage('Each linkId must be a positive integer'),
    body('format')
      .isIn(['csv', 'xlsx'])
      .withMessage('Format must be either csv or xlsx'),
    body('includeMetadata')
      .optional()
      .isBoolean()
      .withMessage('includeMetadata must be a boolean'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const userId = req.user!.userId;
      const { linkIds, format, includeMetadata = false } = req.body;

      // Get selected links with group information
      const userLinks = await LinkService.getLinksWithGroups(userId);
      const selectedLinks = userLinks.filter(link => linkIds.includes(link.id));

      if (selectedLinks.length === 0) {
        res.status(404).json({
          error: 'No valid links found for export'
        });
        return;
      }

      // Create export data
      const exportData = selectedLinks.map(link => ({
        name: link.name,
        url: link.url,
        description: link.description || '',
        groupName: (link as any).groupName || 'Ungrouped',
        iconUrl: link.iconUrl || '',
        isFavorite: link.isFavorite,
        accessCount: includeMetadata ? link.accessCount : 0,
        lastAccessedAt: includeMetadata 
          ? (link.lastAccessedAt ? link.lastAccessedAt.toString() : '')
          : '',
        createdAt: includeMetadata 
          ? link.createdAt.toString()
          : ''
      }));

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `batch-export-${timestamp}.${format}`;

      // Set response headers
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', format === 'csv' 
        ? 'text/csv' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      if (format === 'csv') {
        // Generate CSV
        const headers = ['Name', 'URL', 'Description', 'Group', 'Icon URL'];
        if (includeMetadata) {
          headers.push('Is Favorite', 'Access Count', 'Last Accessed', 'Created At');
        }

        const csvLines = [headers.join(',')];
        
        exportData.forEach(item => {
          const row = [
            `"${item.name.replace(/"/g, '""')}"`,
            `"${item.url.replace(/"/g, '""')}"`,
            `"${item.description.replace(/"/g, '""')}"`,
            `"${item.groupName.replace(/"/g, '""')}"`,
            `"${item.iconUrl.replace(/"/g, '""')}"`
          ];

          if (includeMetadata) {
            row.push(
              item.isFavorite ? 'Yes' : 'No',
              item.accessCount.toString(),
              `"${item.lastAccessedAt.replace(/"/g, '""')}"`,
              `"${item.createdAt.replace(/"/g, '""')}"`
            );
          }

          csvLines.push(row.join(','));
        });

        res.send(csvLines.join('\n'));
      } else {
        // Generate Excel
        const XLSX = await import('xlsx');
        
        const excelData = exportData.map(item => {
          const row: any = {
            Name: item.name,
            URL: item.url,
            Description: item.description,
            Group: item.groupName,
            'Icon URL': item.iconUrl
          };

          if (includeMetadata) {
            row['Is Favorite'] = item.isFavorite ? 'Yes' : 'No';
            row['Access Count'] = item.accessCount;
            row['Last Accessed'] = item.lastAccessedAt;
            row['Created At'] = item.createdAt;
          }

          return row;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Auto-size columns
        const columnWidths = Object.keys(excelData[0] || {}).map(key => ({
          wch: Math.max(key.length, 15)
        }));
        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Links');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);
      }

      await logAudit(req, {
        userId,
        action: 'batch.export',
        description: `Batch exported ${linkIds.length} links as ${format}`
      });

    } catch (error) {
      console.error('Batch export error:', error);
      res.status(500).json({
        error: 'Internal server error during batch export',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get batch operation history (placeholder)
router.get('/history',
  authenticateToken,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
  ],
  async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      // This is a placeholder - in a real implementation, you'd store operation history
      const mockHistory = [
        {
          id: 1,
          action: 'batch_delete',
          details: 'Deleted 5 links',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: 2,
          action: 'batch_export',
          details: 'Exported 25 links to Excel',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: 3,
          action: 'batch_move',
          details: 'Moved 8 links to different group',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        }
      ];

      return res.status(200).json({
        message: 'Batch history retrieved successfully',
        data: {
          history: mockHistory.slice(0, limit)
        }
      });

    } catch (error) {
      console.error('Get batch history error:', error);
      return res.status(500).json({
        error: 'Internal server error while retrieving batch history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
