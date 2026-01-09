import { Router, Request, Response } from 'express';
import multer from 'multer';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { ImportService, ImportRow } from '../services/importService';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Import from file upload
router.post('/file',
  authenticateToken,
  upload.single('file'),
  [
    query('validateUrls')
      .optional()
      .isBoolean()
      .withMessage('validateUrls must be a boolean'),
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

      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded'
        });
      }

      const userId = req.user!.userId;
      const validateUrls = req.query.validateUrls === 'true';

      const result = await ImportService.importFromFile(
        userId,
        req.file.buffer,
        req.file.originalname,
        validateUrls
      );

      if (result.success) {
        return res.status(200).json({
          message: 'Import completed successfully',
          result: {
            totalRows: result.totalRows,
            successfulImports: result.successfulImports,
            createdGroups: result.createdGroups,
            createdLinks: result.createdLinks,
            errors: result.errors
          }
        });
      } else {
        return res.status(400).json({
          error: 'Import failed',
          result: {
            totalRows: result.totalRows,
            successfulImports: result.successfulImports,
            errors: result.errors
          }
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      return res.status(500).json({
        error: 'Internal server error during import',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Batch import from JSON data
router.post('/batch',
  authenticateToken,
  [
    body('data')
      .isArray({ min: 1 })
      .withMessage('Data must be a non-empty array'),
    body('data.*.name')
      .notEmpty()
      .withMessage('Each item must have a name'),
    body('data.*.url')
      .isURL()
      .withMessage('Each item must have a valid URL'),
    body('data.*.groupName')
      .notEmpty()
      .withMessage('Each item must have a group name'),
    body('data.*.description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('data.*.iconUrl')
      .optional()
      .isURL()
      .withMessage('Icon URL must be a valid URL'),
    body('validateUrls')
      .optional()
      .isBoolean()
      .withMessage('validateUrls must be a boolean'),
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
      const { data, validateUrls = false } = req.body;

      const importRows: ImportRow[] = data.map((item: any) => ({
        name: item.name.trim(),
        url: item.url.trim(),
        description: item.description?.trim(),
        groupName: item.groupName.trim(),
        iconUrl: item.iconUrl?.trim()
      }));

      const result = await ImportService.batchImport(userId, importRows, validateUrls);

      if (result.success) {
        return res.status(200).json({
          message: 'Batch import completed successfully',
          result: {
            totalRows: result.totalRows,
            successfulImports: result.successfulImports,
            createdGroups: result.createdGroups,
            createdLinks: result.createdLinks,
            errors: result.errors
          }
        });
      } else {
        return res.status(400).json({
          error: 'Batch import failed',
          result: {
            totalRows: result.totalRows,
            successfulImports: result.successfulImports,
            errors: result.errors
          }
        });
      }

    } catch (error) {
      console.error('Batch import error:', error);
      return res.status(500).json({
        error: 'Internal server error during batch import',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Validate import data without importing
router.post('/validate',
  authenticateToken,
  upload.single('file'),
  [
    query('validateUrls')
      .optional()
      .isBoolean()
      .withMessage('validateUrls must be a boolean'),
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

      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded'
        });
      }

      const validateUrls = req.query.validateUrls === 'true';

      // Parse file without importing
      let rows: ImportRow[];
      const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
      
      if (fileExtension === 'csv') {
        const csv = await import('csv-parser');
        const { Readable } = await import('stream');
        
        rows = await new Promise((resolve, reject) => {
          const results: ImportRow[] = [];
          const stream = Readable.from(req.file!.buffer.toString());
          
          stream
            .pipe(csv.default())
            .on('data', (data) => {
              const normalizedData: any = {};
              Object.keys(data).forEach(key => {
                const normalizedKey = key.toLowerCase().trim();
                if (normalizedKey === 'name' || normalizedKey === 'title') {
                  normalizedData.name = data[key];
                } else if (normalizedKey === 'url' || normalizedKey === 'link') {
                  normalizedData.url = data[key];
                } else if (normalizedKey === 'description' || normalizedKey === 'desc') {
                  normalizedData.description = data[key];
                } else if (normalizedKey === 'group' || normalizedKey === 'groupname' || normalizedKey === 'category') {
                  normalizedData.groupName = data[key];
                } else if (normalizedKey === 'icon' || normalizedKey === 'iconurl') {
                  normalizedData.iconUrl = data[key];
                }
              });
              
              results.push({
                name: normalizedData.name?.trim() || '',
                url: normalizedData.url?.trim() || '',
                description: normalizedData.description?.trim() || undefined,
                groupName: normalizedData.groupName?.trim() || '',
                iconUrl: normalizedData.iconUrl?.trim() || undefined
              });
            })
            .on('end', () => resolve(results))
            .on('error', reject);
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        
        if (!sheetName) {
          return res.status(400).json({
            error: 'Excel file must contain at least one worksheet'
          });
        }
        
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          return res.status(400).json({
            error: 'Worksheet not found'
          });
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        rows = jsonData.map((row: any) => {
          const normalizedData: any = {};
          Object.keys(row).forEach(key => {
            const normalizedKey = key.toLowerCase().trim();
            if (normalizedKey === 'name' || normalizedKey === 'title') {
              normalizedData.name = row[key];
            } else if (normalizedKey === 'url' || normalizedKey === 'link') {
              normalizedData.url = row[key];
            } else if (normalizedKey === 'description' || normalizedKey === 'desc') {
              normalizedData.description = row[key];
            } else if (normalizedKey === 'group' || normalizedKey === 'groupname' || normalizedKey === 'category') {
              normalizedData.groupName = row[key];
            } else if (normalizedKey === 'icon' || normalizedKey === 'iconurl') {
              normalizedData.iconUrl = row[key];
            }
          });
          
          return {
            name: normalizedData.name?.toString().trim() || '',
            url: normalizedData.url?.toString().trim() || '',
            description: normalizedData.description?.toString().trim() || undefined,
            groupName: normalizedData.groupName?.toString().trim() || '',
            iconUrl: normalizedData.iconUrl?.toString().trim() || undefined
          };
        });
      } else {
        return res.status(400).json({
          error: 'Unsupported file format. Only CSV and Excel files are supported.'
        });
      }

      // Validate rows
      const validationErrors: any[] = [];
      rows.forEach((row, index) => {
        if (!row.name || row.name.trim().length === 0) {
          validationErrors.push({
            row: index + 1,
            field: 'name',
            message: 'Name is required'
          });
        }
        
        if (!row.url || row.url.trim().length === 0) {
          validationErrors.push({
            row: index + 1,
            field: 'url',
            message: 'URL is required'
          });
        } else {
          try {
            new URL(row.url);
          } catch {
            validationErrors.push({
              row: index + 1,
              field: 'url',
              message: 'Invalid URL format'
            });
          }
        }
        
        if (!row.groupName || row.groupName.trim().length === 0) {
          validationErrors.push({
            row: index + 1,
            field: 'groupName',
            message: 'Group name is required'
          });
        }
      });

      // URL connectivity check if requested
      if (validateUrls && validationErrors.length === 0) {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              
              const response = await fetch(row.url, {
                method: 'HEAD',
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              
              if (!response.ok) {
                validationErrors.push({
                  row: i + 1,
                  field: 'url',
                  message: `URL returned status ${response.status}: ${response.statusText}`
                });
              }
            } catch (error) {
              validationErrors.push({
                row: i + 1,
                field: 'url',
                message: `URL connectivity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
              });
            }
          }
        }
      }

      return res.status(200).json({
        valid: validationErrors.length === 0,
        totalRows: rows.length,
        errors: validationErrors,
        preview: rows.slice(0, 5) // Show first 5 rows as preview
      });

    } catch (error) {
      console.error('Validation error:', error);
      return res.status(500).json({
        error: 'Internal server error during validation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;