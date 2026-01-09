import * as XLSX from 'xlsx';
import { LinkService } from '../models/WebsiteLink';
import { GroupService } from '../models/Group';
import { WebsiteLink, Group } from '../models/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ExportData {
  name: string;
  url: string;
  description: string;
  groupName: string;
  iconUrl: string;
  isFavorite: boolean;
  accessCount: number;
  lastAccessedAt: string;
  createdAt: string;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  includeMetadata?: boolean;
  groupFilter?: number[]; // Filter by specific group IDs
  favoriteOnly?: boolean;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  recordCount: number;
  error?: string;
}

export class ExportService {
  private static readonly TEMP_DIR = path.join(process.cwd(), 'temp');

  // Ensure temp directory exists
  private static ensureTempDir(): void {
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }
  }

  // Get export data for user
  private static async getExportData(
    userId: number,
    options: ExportOptions
  ): Promise<ExportData[]> {
    // Get user's links with group information
    const linksWithGroups = await LinkService.getLinksWithGroups(userId);
    
    // Apply filters
    let filteredLinks = linksWithGroups;
    
    if (options.groupFilter && options.groupFilter.length > 0) {
      filteredLinks = filteredLinks.filter(link => 
        options.groupFilter!.includes(link.groupId)
      );
    }
    
    if (options.favoriteOnly) {
      filteredLinks = filteredLinks.filter(link => link.isFavorite);
    }

    // Convert to export format
    return filteredLinks.map(link => ({
      name: link.name,
      url: link.url,
      description: link.description || '',
      groupName: link.groupName,
      iconUrl: link.iconUrl || '',
      isFavorite: link.isFavorite,
      accessCount: options.includeMetadata ? link.accessCount : 0,
      lastAccessedAt: options.includeMetadata 
        ? (link.lastAccessedAt ? link.lastAccessedAt.toISOString() : '')
        : '',
      createdAt: options.includeMetadata 
        ? link.createdAt.toISOString()
        : ''
    }));
  }

  // Export to CSV
  private static async exportToCsv(
    data: ExportData[],
    fileName: string,
    includeMetadata: boolean
  ): Promise<string> {
    this.ensureTempDir();
    const filePath = path.join(this.TEMP_DIR, fileName);

    // Define CSV headers based on metadata inclusion
    const headers = ['Name', 'URL', 'Description', 'Group', 'Icon URL'];
    if (includeMetadata) {
      headers.push('Is Favorite', 'Access Count', 'Last Accessed', 'Created At');
    }

    // Create CSV content
    const csvLines = [headers.join(',')];
    
    data.forEach(item => {
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

    fs.writeFileSync(filePath, csvLines.join('\n'), 'utf8');
    return filePath;
  }

  // Export to Excel
  private static async exportToExcel(
    data: ExportData[],
    fileName: string,
    includeMetadata: boolean
  ): Promise<string> {
    this.ensureTempDir();
    const filePath = path.join(this.TEMP_DIR, fileName);

    // Prepare data for Excel
    const excelData = data.map(item => {
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

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const columnWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Website Links');

    // Write file
    XLSX.writeFile(workbook, filePath);
    return filePath;
  }

  // Main export function
  static async exportUserData(
    userId: number,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // Get export data
      const data = await this.getExportData(userId, options);

      if (data.length === 0) {
        return {
          success: false,
          recordCount: 0,
          error: 'No data to export with the specified filters'
        };
      }

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const uniqueId = uuidv4().substring(0, 8);
      const baseFileName = `website-links-export-${timestamp}-${uniqueId}`;
      const fileName = `${baseFileName}.${options.format}`;

      let filePath: string;

      // Export based on format
      if (options.format === 'csv') {
        filePath = await this.exportToCsv(data, fileName, options.includeMetadata || false);
      } else if (options.format === 'xlsx') {
        filePath = await this.exportToExcel(data, fileName, options.includeMetadata || false);
      } else {
        return {
          success: false,
          recordCount: 0,
          error: 'Unsupported export format'
        };
      }

      return {
        success: true,
        filePath,
        fileName,
        recordCount: data.length
      };

    } catch (error) {
      return {
        success: false,
        recordCount: 0,
        error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Export specific groups
  static async exportGroups(
    userId: number,
    groupIds: number[],
    format: 'csv' | 'xlsx',
    includeMetadata: boolean = false
  ): Promise<ExportResult> {
    return this.exportUserData(userId, {
      format,
      includeMetadata,
      groupFilter: groupIds
    });
  }

  // Export favorites only
  static async exportFavorites(
    userId: number,
    format: 'csv' | 'xlsx',
    includeMetadata: boolean = false
  ): Promise<ExportResult> {
    return this.exportUserData(userId, {
      format,
      includeMetadata,
      favoriteOnly: true
    });
  }

  // Clean up temporary files
  static cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Failed to cleanup temp file:', error);
    }
  }

  // Get export template (empty file with proper headers)
  static async getImportTemplate(format: 'csv' | 'xlsx'): Promise<ExportResult> {
    try {
      const templateData: ExportData[] = [{
        name: 'Example Website',
        url: 'https://example.com',
        description: 'This is an example website link',
        groupName: 'Example Group',
        iconUrl: 'https://example.com/favicon.ico',
        isFavorite: false,
        accessCount: 0,
        lastAccessedAt: '',
        createdAt: ''
      }];

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `import-template-${timestamp}.${format}`;

      let filePath: string;

      if (format === 'csv') {
        filePath = await this.exportToCsv(templateData, fileName, false);
      } else {
        filePath = await this.exportToExcel(templateData, fileName, false);
      }

      return {
        success: true,
        filePath,
        fileName,
        recordCount: 1
      };

    } catch (error) {
      return {
        success: false,
        recordCount: 0,
        error: `Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}