import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { ExportService } from '../services/exportService';
import * as fs from 'fs';
import * as path from 'path';
import { logAudit } from '../utils/audit';

const router = Router();

// Export all user data
router.get('/',
  authenticateToken,
  [
    query('format')
      .isIn(['csv', 'xlsx'])
      .withMessage('Format must be either csv or xlsx'),
    query('includeMetadata')
      .optional()
      .isBoolean()
      .withMessage('includeMetadata must be a boolean'),
    query('groupIds')
      .optional()
      .custom((value) => {
        if (typeof value === 'string') {
          const ids = value.split(',').map(id => parseInt(id.trim()));
          return ids.every(id => !isNaN(id) && id > 0);
        }
        return false;
      })
      .withMessage('groupIds must be a comma-separated list of positive integers'),
    query('favoriteOnly')
      .optional()
      .isBoolean()
      .withMessage('favoriteOnly must be a boolean'),
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
      const format = req.query.format as 'csv' | 'xlsx';
      const includeMetadata = req.query.includeMetadata === 'true';
      const favoriteOnly = req.query.favoriteOnly === 'true';
      
      let groupFilter: number[] | undefined;
      if (req.query.groupIds) {
        groupFilter = (req.query.groupIds as string)
          .split(',')
          .map(id => parseInt(id.trim()));
      }

      const result = await ExportService.exportUserData(userId, {
        format,
        includeMetadata,
        ...(groupFilter && { groupFilter }),
        favoriteOnly
      });

      if (!result.success) {
        res.status(400).json({
          error: result.error || 'Export failed'
        });
        return;
      }

      // Send file as download
      const filePath = result.filePath!;
      const fileName = result.fileName!;

      await logAudit(req, {
        userId,
        action: 'export.user',
        description: `Exported data as ${format}`
      });

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', format === 'csv' 
        ? 'text/csv' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Clean up temp file after sending
      fileStream.on('end', () => {
        ExportService.cleanupTempFile(filePath);
      });

      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        ExportService.cleanupTempFile(filePath);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Failed to send export file'
          });
        }
      });

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({
        error: 'Internal server error during export',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Export specific groups
router.get('/groups',
  authenticateToken,
  [
    query('format')
      .isIn(['csv', 'xlsx'])
      .withMessage('Format must be either csv or xlsx'),
    query('groupIds')
      .notEmpty()
      .custom((value) => {
        if (typeof value === 'string') {
          const ids = value.split(',').map(id => parseInt(id.trim()));
          return ids.every(id => !isNaN(id) && id > 0);
        }
        return false;
      })
      .withMessage('groupIds must be a comma-separated list of positive integers'),
    query('includeMetadata')
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
      const format = req.query.format as 'csv' | 'xlsx';
      const includeMetadata = req.query.includeMetadata === 'true';
      const groupIds = (req.query.groupIds as string)
        .split(',')
        .map(id => parseInt(id.trim()));

      const result = await ExportService.exportGroups(userId, groupIds, format, includeMetadata);

      if (!result.success) {
        res.status(400).json({
          error: result.error || 'Export failed'
        });
        return;
      }

      // Send file as download
      const filePath = result.filePath!;
      const fileName = result.fileName!;

      await logAudit(req, {
        userId,
        action: 'export.groups',
        description: `Exported ${groupIds.length} groups as ${format}`
      });

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', format === 'csv' 
        ? 'text/csv' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Clean up temp file after sending
      fileStream.on('end', () => {
        ExportService.cleanupTempFile(filePath);
      });

      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        ExportService.cleanupTempFile(filePath);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Failed to send export file'
          });
        }
      });

    } catch (error) {
      console.error('Export groups error:', error);
      res.status(500).json({
        error: 'Internal server error during export',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Export favorites only
router.get('/favorites',
  authenticateToken,
  [
    query('format')
      .isIn(['csv', 'xlsx'])
      .withMessage('Format must be either csv or xlsx'),
    query('includeMetadata')
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
      const format = req.query.format as 'csv' | 'xlsx';
      const includeMetadata = req.query.includeMetadata === 'true';

      const result = await ExportService.exportFavorites(userId, format, includeMetadata);

      if (!result.success) {
        res.status(400).json({
          error: result.error || 'Export failed'
        });
        return;
      }

      // Send file as download
      const filePath = result.filePath!;
      const fileName = result.fileName!;

      await logAudit(req, {
        userId,
        action: 'export.favorites',
        description: `Exported favorites as ${format}`
      });

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', format === 'csv' 
        ? 'text/csv' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Clean up temp file after sending
      fileStream.on('end', () => {
        ExportService.cleanupTempFile(filePath);
      });

      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        ExportService.cleanupTempFile(filePath);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Failed to send export file'
          });
        }
      });

    } catch (error) {
      console.error('Export favorites error:', error);
      res.status(500).json({
        error: 'Internal server error during export',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get import template
router.get('/template',
  authenticateToken,
  [
    query('format')
      .isIn(['csv', 'xlsx'])
      .withMessage('Format must be either csv or xlsx'),
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

      const format = req.query.format as 'csv' | 'xlsx';

      const result = await ExportService.getImportTemplate(format);

      if (!result.success) {
        res.status(400).json({
          error: result.error || 'Template generation failed'
        });
        return;
      }

      // Send file as download
      const filePath = result.filePath!;
      const fileName = result.fileName!;

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', format === 'csv' 
        ? 'text/csv' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Clean up temp file after sending
      fileStream.on('end', () => {
        ExportService.cleanupTempFile(filePath);
      });

      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        ExportService.cleanupTempFile(filePath);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Failed to send template file'
          });
        }
      });

    } catch (error) {
      console.error('Template generation error:', error);
      res.status(500).json({
        error: 'Internal server error during template generation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
