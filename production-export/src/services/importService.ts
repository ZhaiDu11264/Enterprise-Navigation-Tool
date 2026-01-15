import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import { GroupService } from '../models/Group';
import { LinkService } from '../models/WebsiteLink';
import { CreateLinkRequest, CreateGroupRequest } from '../models/interfaces';

export interface ImportRow {
  name: string;
  url: string;
  description?: string;
  groupName: string;
  iconUrl?: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  errors: ImportError[];
  createdGroups: string[];
  createdLinks: number;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export class ImportService {
  // Validate URL format
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate required fields
  private static validateRow(row: any, rowIndex: number): ImportError[] {
    const errors: ImportError[] = [];
    
    if (!row.name || typeof row.name !== 'string' || row.name.trim().length === 0) {
      errors.push({
        row: rowIndex,
        field: 'name',
        message: 'Name is required and must be a non-empty string',
        data: row
      });
    }
    
    if (!row.url || typeof row.url !== 'string' || row.url.trim().length === 0) {
      errors.push({
        row: rowIndex,
        field: 'url',
        message: 'URL is required and must be a non-empty string',
        data: row
      });
    } else if (!this.isValidUrl(row.url.trim())) {
      errors.push({
        row: rowIndex,
        field: 'url',
        message: 'URL must be a valid URL format',
        data: row
      });
    }
    
    if (!row.groupName || typeof row.groupName !== 'string' || row.groupName.trim().length === 0) {
      errors.push({
        row: rowIndex,
        field: 'groupName',
        message: 'Group name is required and must be a non-empty string',
        data: row
      });
    }
    
    return errors;
  }

  // Parse CSV data
  private static async parseCsv(buffer: Buffer): Promise<ImportRow[]> {
    return new Promise((resolve, reject) => {
      const results: ImportRow[] = [];
      const stream = Readable.from(buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => {
          // Normalize column names (case-insensitive)
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
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Parse Excel data
  private static parseExcel(buffer: Buffer): ImportRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    
    if (!sheetName) {
      throw new Error('Excel file must contain at least one worksheet');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    return jsonData.map((row: any) => {
      // Normalize column names (case-insensitive)
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
  }

  // Import data from file
  static async importFromFile(
    userId: number,
    fileBuffer: Buffer,
    fileName: string,
    validateUrls: boolean = false
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successfulImports: 0,
      errors: [],
      createdGroups: [],
      createdLinks: 0
    };

    try {
      // Parse file based on extension
      let rows: ImportRow[];
      const fileExtension = fileName.toLowerCase().split('.').pop();
      
      if (fileExtension === 'csv') {
        rows = await this.parseCsv(fileBuffer);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        rows = await this.parseExcel(fileBuffer);
      } else {
        throw new Error('Unsupported file format. Only CSV and Excel files are supported.');
      }

      result.totalRows = rows.length;

      if (rows.length === 0) {
        result.errors.push({
          row: 0,
          message: 'File contains no data rows'
        });
        return result;
      }

      // Validate all rows first
      const allErrors: ImportError[] = [];
      rows.forEach((row, index) => {
        const rowErrors = this.validateRow(row, index + 1);
        allErrors.push(...rowErrors);
      });

      // If there are validation errors, return them
      if (allErrors.length > 0) {
        result.errors = allErrors;
        return result;
      }

      // URL connectivity check if requested
      if (validateUrls) {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row) {
            try {
              // Simple connectivity check with timeout
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              
              const response = await fetch(row.url, {
                method: 'HEAD',
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              
              if (!response.ok) {
                result.errors.push({
                  row: i + 1,
                  field: 'url',
                  message: `URL returned status ${response.status}: ${response.statusText}`,
                  data: row
                });
              }
            } catch (error) {
              result.errors.push({
                row: i + 1,
                field: 'url',
                message: `URL connectivity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                data: row
              });
            }
          }
        }
      }

      // Get or create groups
      const groupMap = new Map<string, number>();
      const existingGroups = await GroupService.getUserGroups(userId);
      
      // Map existing groups
      existingGroups.forEach(group => {
        groupMap.set(group.name.toLowerCase(), group.id);
      });

      // Create new groups as needed
      const uniqueGroupNames = [...new Set(rows.map(row => row.groupName))];
      for (const groupName of uniqueGroupNames) {
        if (!groupMap.has(groupName.toLowerCase())) {
          try {
            const newGroup = await GroupService.createGroup(userId, {
              name: groupName,
              description: `Imported group: ${groupName}`
            });
            groupMap.set(groupName.toLowerCase(), newGroup.id);
            result.createdGroups.push(groupName);
          } catch (error) {
            result.errors.push({
              row: 0,
              field: 'groupName',
              message: `Failed to create group "${groupName}": ${error instanceof Error ? error.message : 'Unknown error'}`
            });
          }
        }
      }

      // Import links
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row) {
          const groupId = groupMap.get(row.groupName.toLowerCase());
          
          if (!groupId) {
            result.errors.push({
              row: i + 1,
              field: 'groupName',
              message: `Group "${row.groupName}" could not be created or found`,
              data: row
            });
            continue;
          }

          try {
            const linkData: CreateLinkRequest = {
              name: row.name,
              url: row.url,
              description: row.description,
              iconUrl: row.iconUrl,
              groupId: groupId
            };

            await LinkService.createLink(userId, linkData);
            result.successfulImports++;
            result.createdLinks++;
          } catch (error) {
            result.errors.push({
              row: i + 1,
              message: `Failed to create link: ${error instanceof Error ? error.message : 'Unknown error'}`,
              data: row
            });
          }
        }
      }

      result.success = result.successfulImports > 0;
      return result;

    } catch (error) {
      result.errors.push({
        row: 0,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return result;
    }
  }

  // Batch import with transaction-like behavior
  static async batchImport(
    userId: number,
    rows: ImportRow[],
    validateUrls: boolean = false
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: rows.length,
      successfulImports: 0,
      errors: [],
      createdGroups: [],
      createdLinks: 0
    };

    // Validate all rows first
    const allErrors: ImportError[] = [];
    rows.forEach((row, index) => {
      const rowErrors = this.validateRow(row, index + 1);
      allErrors.push(...rowErrors);
    });

    if (allErrors.length > 0) {
      result.errors = allErrors;
      return result;
    }

    // URL validation if requested
    if (validateUrls) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row && !this.isValidUrl(row.url)) {
          result.errors.push({
            row: i + 1,
            field: 'url',
            message: 'Invalid URL format',
            data: row
          });
        }
      }
    }

    if (result.errors.length > 0) {
      return result;
    }

    // Process imports
    try {
      // Get or create groups
      const groupMap = new Map<string, number>();
      const existingGroups = await GroupService.getUserGroups(userId);
      
      existingGroups.forEach(group => {
        groupMap.set(group.name.toLowerCase(), group.id);
      });

      // Create new groups
      const uniqueGroupNames = [...new Set(rows.map(row => row.groupName))];
      for (const groupName of uniqueGroupNames) {
        if (!groupMap.has(groupName.toLowerCase())) {
          const newGroup = await GroupService.createGroup(userId, {
            name: groupName,
            description: `Imported group: ${groupName}`
          });
          groupMap.set(groupName.toLowerCase(), newGroup.id);
          result.createdGroups.push(groupName);
        }
      }

      // Create links
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row) {
          const groupId = groupMap.get(row.groupName.toLowerCase());
          
          if (!groupId) {
            result.errors.push({
              row: i + 1,
              field: 'groupName',
              message: `Group "${row.groupName}" not found`,
              data: row
            });
            continue;
          }

          try {
            const linkData: CreateLinkRequest = {
              name: row.name,
              url: row.url,
              description: row.description,
              iconUrl: row.iconUrl,
              groupId: groupId
            };

            await LinkService.createLink(userId, linkData);
            result.successfulImports++;
            result.createdLinks++;
          } catch (error) {
            result.errors.push({
              row: i + 1,
              message: `Failed to create link: ${error instanceof Error ? error.message : 'Unknown error'}`,
              data: row
            });
          }
        }
      }

      result.success = result.successfulImports > 0;
      return result;

    } catch (error) {
      result.errors.push({
        row: 0,
        message: `Batch import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return result;
    }
  }
}