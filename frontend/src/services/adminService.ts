import api from './api';
import { User, DefaultConfiguration, ConfigurationData, CreateUserRequest } from '../types';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentLogins: number;
  topDomains?: Array<{
    host: string;
    totalAccess: number;
  }>;
  resources?: {
    uptimeSeconds: number;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
    system: {
      loadAverage: number[];
      totalMemMb: number;
      freeMemMb: number;
    };
  };
}

export interface ConfigurationSummary {
  id: number;
  name: string;
  description: string;
  version: number;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  groupCount: number;
  linkCount: number;
}

export interface PublishConfigRequest {
  configId: number;
  strategy: 'reset' | 'merge';
  userIds?: number[];
  notifyUsers?: boolean;
}

export interface PublishResult {
  configurationId: number;
  strategy: string;
  totalUsers: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    userId: number;
    username: string;
    success: boolean;
    error?: string;
  }>;
}

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  createdBy: number | null;
  createdAt: string;
}

export interface NotificationDraft {
  title: string;
  message: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  userIds?: number[];
}

export interface AuditLogEntry {
  id: number;
  userId: number | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogQuery {
  userId?: number;
  action?: string;
  entityType?: string;
  keyword?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogResult {
  logs: AuditLogEntry[];
  total: number;
}

class AdminService {
  // User Management
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/admin/users');
    return (response.data as any).data.users;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post('/admin/users', userData);
    return (response.data as any).data.user;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    const response = await api.put(`/admin/users/${userId}`, updates);
    return (response.data as any).data.user;
  }

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  }

  async resetUserPassword(userId: number, password?: string): Promise<{ temporaryPassword?: string }> {
    const response = await api.post(`/admin/users/${userId}/reset-password`, {
      password
    });
    return (response.data as any).data || {};
  }

  async resetUserProfile(userId: number): Promise<User> {
    const response = await api.post(`/admin/users/${userId}/reset-profile`);
    return (response.data as any).data.user;
  }

  async getSystemStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats');
    return (response.data as any).data.stats;
  }

  async getAuditLogs(query: AuditLogQuery = {}): Promise<AuditLogResult> {
    const response = await api.get('/admin/logs', {
      params: query
    });
    return (response.data as any).data;
  }

  async sendNotification(payload: NotificationDraft): Promise<AdminNotification> {
    const response = await api.post('/admin/notifications', payload);
    return (response.data as any).data.notification;
  }

  async listAdminNotifications(limit = 50): Promise<AdminNotification[]> {
    const response = await api.get('/admin/notifications', {
      params: { limit }
    });
    return (response.data as any).data.notifications;
  }

  // Configuration Management
  async getAllConfigurations(): Promise<ConfigurationSummary[]> {
    const response = await api.get('/admin/config');
    return (response.data as any).data.configurations;
  }

  async getActiveConfiguration(): Promise<DefaultConfiguration | null> {
    try {
      const response = await api.get('/admin/config/active');
      return (response.data as any).data.configuration;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getConfiguration(configId: number): Promise<DefaultConfiguration> {
    const response = await api.get(`/admin/config/${configId}`);
    return (response.data as any).data.configuration;
  }

  async createConfiguration(
    name: string,
    description: string,
    configData: ConfigurationData
  ): Promise<DefaultConfiguration> {
    const response = await api.post('/admin/config', {
      name,
      description,
      configData
    });
    return (response.data as any).data.configuration;
  }

  async updateConfiguration(
    configId: number,
    name?: string,
    description?: string,
    configData?: ConfigurationData
  ): Promise<DefaultConfiguration> {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (configData !== undefined) updates.configData = configData;

    const response = await api.put(`/admin/config/${configId}`, updates);
    return (response.data as any).data.configuration;
  }

  async activateConfiguration(configId: number): Promise<void> {
    await api.post(`/admin/config/${configId}/activate`);
  }

  async deleteConfiguration(configId: number): Promise<void> {
    await api.delete(`/admin/config/${configId}`);
  }

  async createConfigurationFromUser(
    userId: number,
    name: string,
    description: string
  ): Promise<DefaultConfiguration> {
    const response = await api.post(`/admin/config/from-user/${userId}`, {
      name,
      description
    });
    return (response.data as any).data.configuration;
  }

  // Configuration Publishing
  async publishConfiguration(request: PublishConfigRequest): Promise<PublishResult> {
    const response = await api.post('/admin/config/publish', request);
    return (response.data as any).data;
  }

  async resetUserConfiguration(
    userId: number,
    configId?: number,
    strategy: 'reset' | 'merge' = 'reset'
  ): Promise<void> {
    const body: any = { strategy };
    if (configId) body.configId = configId;
    
    await api.post(`/admin/users/${userId}/reset`, body);
  }

  async syncUserConfiguration(userId: number, configId?: number): Promise<void> {
    const body: any = {};
    if (configId) body.configId = configId;
    
    await api.post(`/admin/users/${userId}/sync`, body);
  }

  // Configuration Statistics
  async getConfigurationStats(configId: number): Promise<any> {
    const response = await api.get(`/admin/config/${configId}/stats`);
    return (response.data as any).data.stats;
  }

  // Configuration Notifications
  async getConfigurationNotifications(): Promise<any[]> {
    const response = await api.get('/admin/config/notifications');
    return (response.data as any).data.notifications;
  }
}

const adminService = new AdminService();

export default adminService;
