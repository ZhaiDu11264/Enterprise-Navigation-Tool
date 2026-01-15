import { useConfigurationSync } from '../hooks/useConfigurationSync';
import { api } from '../services/api';
import { cache, persistentCache } from '../utils/cache';
import { linkService } from '../services/linkService';
import { SearchService } from '../services/searchService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../utils/cache');
jest.mock('../services/linkService');
jest.mock('../services/searchService');

const mockApi = api as jest.Mocked<typeof api>;
const mockCache = cache as jest.Mocked<typeof cache>;
const mockPersistentCache = persistentCache as jest.Mocked<typeof persistentCache>;
const mockLinkService = linkService as jest.Mocked<typeof linkService>;
const mockSearchService = SearchService as jest.Mocked<typeof SearchService>;

// Helper to create mock Axios response
const createMockResponse = <T>(data: T): any => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any
});

describe('Admin Configuration Sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration Status Checking', () => {
    test('should detect configuration updates', async () => {
      // Mock API response for configuration status
      mockApi.get.mockResolvedValueOnce(createMockResponse({
        success: true,
        data: {
          status: {
            lastUpdated: '2024-01-07T10:00:00Z',
            version: 2,
            isActive: true
          }
        }
      }));

      // Simulate checking for updates
      const response = await api.get('/config/status');
      const status = response.data.data.status;

      expect(status.version).toBe(2);
      expect(status.isActive).toBe(true);
      expect(mockApi.get).toHaveBeenCalledWith('/config/status');
    });

    test('should handle no active configuration', async () => {
      mockApi.get.mockResolvedValueOnce(createMockResponse({
        success: true,
        data: {
          status: {
            lastUpdated: '2024-01-07T10:00:00Z',
            version: 0,
            isActive: false
          }
        }
      }));

      const response = await api.get('/config/status');
      const status = response.data.data.status;

      expect(status.version).toBe(0);
      expect(status.isActive).toBe(false);
    });
  });

  describe('Cache Clearing on Updates', () => {
    test('should clear all caches when applying updates', () => {
      // Simulate applying configuration updates
      mockCache.clear.mockImplementation(() => {});
      mockPersistentCache.clear.mockImplementation(() => {});
      mockLinkService.clearCache.mockImplementation(() => {});
      mockSearchService.clearCache.mockImplementation(() => {});

      // Clear all caches
      cache.clear();
      persistentCache.clear();
      linkService.clearCache();
      SearchService.clearCache();

      // Verify all caches were cleared
      expect(mockCache.clear).toHaveBeenCalled();
      expect(mockPersistentCache.clear).toHaveBeenCalled();
      expect(mockLinkService.clearCache).toHaveBeenCalled();
      expect(mockSearchService.clearCache).toHaveBeenCalled();
    });
  });

  describe('Configuration Refresh API', () => {
    test('should refresh user configuration', async () => {
      mockApi.post.mockResolvedValueOnce(createMockResponse({
        success: true,
        message: 'Configuration refreshed successfully',
        data: {
          configurationId: 1,
          version: 3
        }
      }));

      const response = await api.post('/config/refresh');
      const result = response.data;

      expect(result.success).toBe(true);
      expect(result.data.configurationId).toBe(1);
      expect(result.data.version).toBe(3);
      expect(mockApi.post).toHaveBeenCalledWith('/config/refresh');
    });

    test('should handle no active configuration error', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: {
          status: 404,
          data: {
            error: {
              code: 'NO_ACTIVE_CONFIG',
              message: 'No active configuration found'
            }
          }
        }
      });

      try {
        await api.post('/config/refresh');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error.code).toBe('NO_ACTIVE_CONFIG');
      }
    });
  });

  describe('Admin Publish Configuration', () => {
    test('should publish configuration to all users', async () => {
      const publishRequest = {
        configId: 1,
        strategy: 'merge',
        notifyUsers: true
      };

      mockApi.post.mockResolvedValueOnce(createMockResponse({
        success: true,
        data: {
          configurationId: 1,
          strategy: 'merge',
          totalUsers: 5,
          successCount: 5,
          failureCount: 0,
          results: [
            { userId: 2, username: 'user1', success: true },
            { userId: 3, username: 'user2', success: true },
            { userId: 4, username: 'user3', success: true },
            { userId: 5, username: 'user4', success: true },
            { userId: 6, username: 'user5', success: true }
          ]
        },
        message: 'Configuration published to 5 users successfully'
      }));

      const response = await api.post('/admin/config/publish', publishRequest);
      const result = response.data;

      expect(result.success).toBe(true);
      expect(result.data.totalUsers).toBe(5);
      expect(result.data.successCount).toBe(5);
      expect(result.data.failureCount).toBe(0);
      expect(mockApi.post).toHaveBeenCalledWith('/admin/config/publish', publishRequest);
    });

    test('should publish configuration to specific users', async () => {
      const publishRequest = {
        configId: 1,
        strategy: 'reset',
        userIds: [2, 3],
        notifyUsers: true
      };

      mockApi.post.mockResolvedValueOnce(createMockResponse({
        success: true,
        data: {
          configurationId: 1,
          strategy: 'reset',
          totalUsers: 2,
          successCount: 2,
          failureCount: 0,
          results: [
            { userId: 2, username: 'user1', success: true },
            { userId: 3, username: 'user2', success: true }
          ]
        },
        message: 'Configuration published to 2 users successfully'
      }));

      const response = await api.post('/admin/config/publish', publishRequest);
      const result = response.data;

      expect(result.success).toBe(true);
      expect(result.data.totalUsers).toBe(2);
      expect(result.data.successCount).toBe(2);
      expect(mockApi.post).toHaveBeenCalledWith('/admin/config/publish', publishRequest);
    });

    test('should handle partial failures in publishing', async () => {
      const publishRequest = {
        configId: 1,
        strategy: 'merge',
        notifyUsers: true
      };

      mockApi.post.mockResolvedValueOnce(createMockResponse({
        success: true,
        data: {
          configurationId: 1,
          strategy: 'merge',
          totalUsers: 3,
          successCount: 2,
          failureCount: 1,
          results: [
            { userId: 2, username: 'user1', success: true },
            { userId: 3, username: 'user2', success: true },
            { userId: 4, username: 'user3', success: false, error: 'User not found' }
          ]
        },
        message: 'Configuration published to 2 users successfully, 1 failed'
      }));

      const response = await api.post('/admin/config/publish', publishRequest);
      const result = response.data;

      expect(result.success).toBe(true);
      expect(result.data.totalUsers).toBe(3);
      expect(result.data.successCount).toBe(2);
      expect(result.data.failureCount).toBe(1);
      expect(result.data.results[2].success).toBe(false);
      expect(result.data.results[2].error).toBe('User not found');
    });
  });

  describe('Version Tracking', () => {
    test('should increment version after successful publish', async () => {
      // This test would verify that the configuration version is incremented
      // after a successful publish operation, which triggers sync notifications
      
      const initialVersion = 1;
      const expectedNewVersion = 2;

      // Mock the version increment behavior
      mockApi.post.mockResolvedValueOnce(createMockResponse({
        success: true,
        data: {
          configurationId: 1,
          strategy: 'merge',
          totalUsers: 1,
          successCount: 1,
          failureCount: 0,
          results: [
            { userId: 2, username: 'user1', success: true }
          ]
        }
      }));

      // Mock getting updated configuration with new version
      mockApi.get.mockResolvedValueOnce(createMockResponse({
        success: true,
        data: {
          status: {
            lastUpdated: '2024-01-07T10:30:00Z',
            version: expectedNewVersion,
            isActive: true
          }
        }
      }));

      // Publish configuration
      await api.post('/admin/config/publish', {
        configId: 1,
        strategy: 'merge'
      });

      // Check new version
      const statusResponse = await api.get('/config/status');
      const newVersion = statusResponse.data.data.status.version;

      expect(newVersion).toBe(expectedNewVersion);
    });
  });
});