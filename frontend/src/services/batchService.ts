import api from './api';
import { WebsiteLink } from '../types';

export interface BatchDeleteRequest {
  linkIds: number[];
}

export interface BatchMoveRequest {
  linkIds: number[];
  targetGroupId: number;
}

export interface BatchEditRequest {
  linkIds: number[];
  updates: Partial<WebsiteLink>;
}

export interface BatchExportRequest {
  linkIds: number[];
  format: 'csv' | 'xlsx';
  includeMetadata?: boolean;
}

export interface BatchOperationResult {
  success: boolean;
  affectedCount: number;
  errors?: string[];
  message?: string;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class BatchService {
  // Batch delete links
  async batchDelete(linkIds: number[]): Promise<BatchOperationResult> {
    try {
      const response = await api.post<ApiResponse<BatchOperationResult>>('/batch/links/delete', { linkIds });
      return (response.data as ApiResponse<BatchOperationResult>).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '批量删除失败');
    }
  }

  // Batch move links to different group
  async batchMove(linkIds: number[], targetGroupId: number): Promise<BatchOperationResult> {
    try {
      const response = await api.post<ApiResponse<BatchOperationResult>>('/batch/links/move', { 
        linkIds, 
        targetGroupId 
      });
      return (response.data as ApiResponse<BatchOperationResult>).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '批量移动失败');
    }
  }

  // Batch edit links
  async batchEdit(linkIds: number[], updates: Partial<WebsiteLink>): Promise<BatchOperationResult> {
    try {
      const response = await api.post<ApiResponse<BatchOperationResult>>('/batch/links/edit', { 
        linkIds, 
        updates 
      });
      return (response.data as ApiResponse<BatchOperationResult>).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '批量编辑失败');
    }
  }

  // Batch export selected links
  async batchExport(linkIds: number[], format: 'csv' | 'xlsx', includeMetadata: boolean = false): Promise<void> {
    try {
      const response = await api.post('/export/batch', {
        linkIds,
        format,
        includeMetadata
      }, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data as BlobPart], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or generate one
      const contentDisposition = response.headers['content-disposition'];
      let filename = `batch-export-${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '批量导出失败');
    }
  }

  // Batch toggle favorite status
  async batchToggleFavorite(linkIds: number[], isFavorite: boolean): Promise<BatchOperationResult> {
    try {
      const response = await api.post<ApiResponse<BatchOperationResult>>('/batch/links/favorite', { 
        linkIds, 
        isFavorite 
      });
      return (response.data as ApiResponse<BatchOperationResult>).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '批量收藏操作失败');
    }
  }

  // Batch update group for links
  async batchUpdateGroup(linkIds: number[], groupId: number): Promise<BatchOperationResult> {
    try {
      const response = await api.post<ApiResponse<BatchOperationResult>>('/batch/links/group', { 
        linkIds, 
        groupId 
      });
      return (response.data as ApiResponse<BatchOperationResult>).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '批量更新分组失败');
    }
  }

  // Get batch operation history
  async getBatchHistory(limit: number = 10): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<{ history: any[] }>>(`/batch/history?limit=${limit}`);
      return (response.data as ApiResponse<{ history: any[] }>).data.history;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '获取操作历史失败');
    }
  }

  // Validate links connectivity
  async validateLinks(linkIds: number[]): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>('/batch/links/validate', { linkIds });
      return (response.data as ApiResponse<any>).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '链接验证失败');
    }
  }

  // Clean duplicate links
  async cleanDuplicates(groupId?: number): Promise<BatchOperationResult> {
    try {
      const response = await api.post<ApiResponse<BatchOperationResult>>('/batch/links/clean-duplicates', { 
        groupId 
      });
      return (response.data as ApiResponse<BatchOperationResult>).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '清理重复链接失败');
    }
  }

  // Batch import from JSON data
  async batchImportJson(data: any[], options: any = {}): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>('/import/batch', {
        data,
        ...options
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '批量导入失败');
    }
  }

  // Get data analysis report
  async getDataAnalysis(): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>('/batch/analysis');
      return (response.data as ApiResponse<any>).data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '数据分析失败');
    }
  }
}

export default new BatchService();