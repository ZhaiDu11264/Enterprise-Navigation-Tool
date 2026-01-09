import request from 'supertest';
import app from '../app';
import { UserService } from '../models/User';
import { GroupService } from '../models/Group';
import { LinkService } from '../models/WebsiteLink';
import { ConfigurationService } from '../models/DefaultConfiguration';
import { JWTService } from '../utils/jwt';

// Mock database operations for testing
jest.mock('../config/database', () => ({
  executeQuery: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(undefined),
  closePool: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../models/DefaultConfiguration', () => ({
  ConfigurationService: {
    applyActiveConfigurationToUser: jest.fn().mockResolvedValue(undefined),
    getActiveConfiguration: jest.fn().mockResolvedValue({
      id: 1,
      name: 'Default Config',
      description: 'Default configuration for new users',
      configData: {
        groups: [
          { name: 'Work Tools', description: 'Essential work applications', sortOrder: 0 },
          { name: 'Resources', description: 'Company resources', sortOrder: 1 }
        ],
        links: [
          { name: 'Company Portal', url: 'https://portal.company.com', description: 'Main company portal', groupName: 'Work Tools', sortOrder: 0 },
          { name: 'HR System', url: 'https://hr.company.com', description: 'Human resources', groupName: 'Resources', sortOrder: 0 }
        ]
      },
      version: 1,
      isActive: true,
      createdBy: 1,
      createdAt: new Date()
    }),
    updateConfiguration: jest.fn(),
    applyToUser: jest.fn(),
    getAllConfigurations: jest.fn(),
    createConfiguration: jest.fn(),
    getConfigurationById: jest.fn(),
    activateConfiguration: jest.fn(),
    deleteConfiguration: jest.fn(),
    createFromUser: jest.fn(),
    getConfigurationStats: jest.fn(),
    validateConfigurationData: jest.fn()
  }
}));

// Mock additional services
jest.mock('../models/Group', () => ({
  GroupService: {
    createGroup: jest.fn(),
    getUserGroups: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
    reorderGroups: jest.fn(),
    getGroupById: jest.fn(),
    userOwnsGroup: jest.fn(),
    getGroupByName: jest.fn(),
    getGroupsWithLinkCount: jest.fn()
  }
}));

jest.mock('../models/WebsiteLink', () => ({
  LinkService: {
    createLink: jest.fn(),
    getUserLinks: jest.fn(),
    updateLink: jest.fn(),
    deleteLink: jest.fn(),
    reorderLinks: jest.fn(),
    searchLinks: jest.fn(),
    getFavoriteLinks: jest.fn(),
    getRecentLinks: jest.fn(),
    recordAccess: jest.fn(),
    toggleFavorite: jest.fn(),
    userOwnsLink: jest.fn(),
    getLinkById: jest.fn(),
    getLinksByGroup: jest.fn(),
    getLinksWithGroups: jest.fn()
  }
}));

jest.mock('../services/importService', () => ({
  ImportService: {
    parseCSV: jest.fn(),
    importFromFile: jest.fn(),
    batchImport: jest.fn()
  }
}));

jest.mock('../services/faviconService', () => ({
  faviconService: {
    extractFavicon: jest.fn(),
    cacheFavicon: jest.fn(),
    getFaviconUrl: jest.fn(),
    uploadCustomIcon: jest.fn(),
    getDefaultIcon: jest.fn()
  }
}));

describe('End-to-End Integration Tests', () => {
  // Test users
  const regularUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    role: 'user' as const,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true
  };

  const adminUser = {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: '$2b$10$hashedpassword',
    role: 'admin' as const,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true
  };

  // Test data
  const testGroup = {
    id: 1,
    userId: 1,
    name: 'Test Group',
    description: 'A test group',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const testLink = {
    id: 1,
    userId: 1,
    groupId: 1,
    name: 'Test Link',
    url: 'https://example.com',
    description: 'A test link',
    iconUrl: undefined,
    sortOrder: 0,
    isFavorite: false,
    accessCount: 0,
    lastAccessedAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  let userToken: string;
  let adminToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Generate tokens for testing
    const userTokenResult = JWTService.generateToken(regularUser);
    const adminTokenResult = JWTService.generateToken(adminUser);
    
    userToken = userTokenResult.token!;
    adminToken = adminTokenResult.token!;
  });

  describe('Complete User Registration and Setup Workflow', () => {
    it('should complete full user registration and initialization workflow', async () => {
      // Step 1: Register new user
      jest.spyOn(UserService, 'usernameExists').mockResolvedValue(false);
      jest.spyOn(UserService, 'emailExists').mockResolvedValue(false);
      jest.spyOn(UserService, 'createUser').mockResolvedValue({
        ...regularUser,
        id: 3,
        username: 'newuser',
        email: 'newuser@example.com'
      });

      const registrationResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'ValidPass123',
          role: 'user'
        });

      expect(registrationResponse.status).toBe(201);
      expect(registrationResponse.body.success).toBe(true);
      expect(registrationResponse.body.data.user.username).toBe('newuser');

      // Step 2: Login with new user
      jest.spyOn(UserService, 'authenticate').mockResolvedValue({
        success: true,
        user: {
          ...regularUser,
          id: 3,
          username: 'newuser',
          email: 'newuser@example.com'
        }
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'newuser',
          password: 'ValidPass123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();

      const newUserToken = loginResponse.body.data.token;

      // Step 3: Verify user can access their profile
      jest.spyOn(UserService, 'getUserById').mockResolvedValue({
        ...regularUser,
        id: 3,
        username: 'newuser',
        email: 'newuser@example.com'
      });

      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.user.username).toBe('newuser');

      // Step 4: Verify default configuration was applied
      jest.spyOn(GroupService, 'getUserGroups').mockResolvedValue([
        { ...testGroup, name: 'Work Tools', description: 'Essential work applications' },
        { ...testGroup, id: 2, name: 'Resources', description: 'Company resources', sortOrder: 1 }
      ]);

      const groupsResponse = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(groupsResponse.status).toBe(200);
      expect(groupsResponse.body.data.groups).toHaveLength(2);
      expect(groupsResponse.body.data.groups[0].name).toBe('Work Tools');
    });
  });

  describe('Complete Link Management Workflow', () => {
    beforeEach(() => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(regularUser);
    });

    it('should complete full link management workflow', async () => {
      // Step 1: Create a group
      jest.spyOn(GroupService, 'getGroupByName').mockResolvedValue(null); // No existing group
      jest.spyOn(GroupService, 'createGroup').mockResolvedValue(testGroup);

      const groupResponse = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Group',
          description: 'A test group'
        });

      expect(groupResponse.status).toBe(201);
      expect(groupResponse.body.data.group.name).toBe('Test Group');

      // Step 2: Create a link in the group
      jest.spyOn(LinkService, 'createLink').mockResolvedValue(testLink);

      const linkResponse = await request(app)
        .post('/api/links')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Link',
          url: 'https://example.com',
          description: 'A test link',
          groupId: 1
        });

      expect(linkResponse.status).toBe(201);
      expect(linkResponse.body.data.link.name).toBe('Test Link');
      expect(linkResponse.body.data.link.url).toBe('https://example.com');

      // Step 3: Update the link
      jest.spyOn(LinkService, 'updateLink').mockResolvedValue({
        ...testLink,
        name: 'Updated Test Link',
        description: 'Updated description'
      });

      const updateResponse = await request(app)
        .put('/api/links/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Test Link',
          description: 'Updated description'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.link.name).toBe('Updated Test Link');

      // Step 4: Get all user links
      jest.spyOn(LinkService, 'getUserLinks').mockResolvedValue([{
        ...testLink,
        name: 'Updated Test Link',
        description: 'Updated description'
      }]);

      const linksResponse = await request(app)
        .get('/api/links')
        .set('Authorization', `Bearer ${userToken}`);

      expect(linksResponse.status).toBe(200);
      expect(linksResponse.body.data.links).toHaveLength(1);
      expect(linksResponse.body.data.links[0].name).toBe('Updated Test Link');

      // Step 5: Mark link as favorite
      jest.spyOn(LinkService, 'updateLink').mockResolvedValue({
        ...testLink,
        name: 'Updated Test Link',
        description: 'Updated description',
        isFavorite: true
      });

      const favoriteResponse = await request(app)
        .put('/api/links/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          isFavorite: true
        });

      expect(favoriteResponse.status).toBe(200);
      expect(favoriteResponse.body.data.link.isFavorite).toBe(true);

      // Step 6: Delete the link
      jest.spyOn(LinkService, 'deleteLink').mockResolvedValue();

      const deleteResponse = await request(app)
        .delete('/api/links/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('Search and Quick Access Workflow', () => {
    beforeEach(() => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(regularUser);
    });

    it('should complete search and quick access workflow', async () => {
      const searchResults = [
        { ...testLink, name: 'Company Portal', description: 'Main company portal' },
        { ...testLink, id: 2, name: 'Company Wiki', description: 'Internal wiki' }
      ];

      // Step 1: Search for links
      jest.spyOn(LinkService, 'searchLinks').mockResolvedValue(searchResults);

      const searchResponse = await request(app)
        .get('/api/search?q=company')
        .set('Authorization', `Bearer ${userToken}`);

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.results).toHaveLength(2);
      expect(searchResponse.body.results[0].name).toBe('Company Portal');

      // Step 2: Access a link (simulate click)
      jest.spyOn(LinkService, 'recordAccess').mockResolvedValue();

      const accessResponse = await request(app)
        .put('/api/links/1/access')
        .set('Authorization', `Bearer ${userToken}`);

      expect(accessResponse.status).toBe(200);

      // Step 3: Get recent links
      jest.spyOn(LinkService, 'getRecentLinks').mockResolvedValue([{
        ...testLink,
        accessCount: 1,
        lastAccessedAt: new Date()
      }]);

      const recentResponse = await request(app)
        .get('/api/search/recent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(recentResponse.status).toBe(200);
      expect(recentResponse.body.recent).toHaveLength(1);
      expect(recentResponse.body.recent[0].accessCount).toBe(1);

      // Step 4: Get favorite links
      jest.spyOn(LinkService, 'getFavoriteLinks').mockResolvedValue([{
        ...testLink,
        isFavorite: true
      }]);

      const favoritesResponse = await request(app)
        .get('/api/search/favorites')
        .set('Authorization', `Bearer ${userToken}`);

      expect(favoritesResponse.status).toBe(200);
      expect(favoritesResponse.body.favorites).toHaveLength(1);
      expect(favoritesResponse.body.favorites[0].isFavorite).toBe(true);
    });
  });

  describe('Drag-and-Drop Reordering Workflow', () => {
    beforeEach(() => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(regularUser);
    });

    it('should complete reordering workflow', async () => {
      // Step 1: Get current links and groups
      jest.spyOn(LinkService, 'getUserLinks').mockResolvedValue([
        { ...testLink, id: 1, name: 'Link 1', sortOrder: 0 },
        { ...testLink, id: 2, name: 'Link 2', sortOrder: 1 },
        { ...testLink, id: 3, name: 'Link 3', sortOrder: 2 }
      ]);

      const initialResponse = await request(app)
        .get('/api/links')
        .set('Authorization', `Bearer ${userToken}`);

      expect(initialResponse.status).toBe(200);
      expect(initialResponse.body.data.links).toHaveLength(3);

      // Step 2: Reorder links
      jest.spyOn(LinkService, 'reorderLinks').mockResolvedValue();

      const reorderResponse = await request(app)
        .put('/api/links/reorder')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          linkOrders: [
            { id: 3, sortOrder: 0 },
            { id: 1, sortOrder: 1 },
            { id: 2, sortOrder: 2 }
          ]
        });

      expect(reorderResponse.status).toBe(200);

      // Step 3: Verify new order
      jest.spyOn(LinkService, 'getUserLinks').mockResolvedValue([
        { ...testLink, id: 3, name: 'Link 3', sortOrder: 0 },
        { ...testLink, id: 1, name: 'Link 1', sortOrder: 1 },
        { ...testLink, id: 2, name: 'Link 2', sortOrder: 2 }
      ]);

      const verifyResponse = await request(app)
        .get('/api/links')
        .set('Authorization', `Bearer ${userToken}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.data.links[0].name).toBe('Link 3');
      expect(verifyResponse.body.data.links[1].name).toBe('Link 1');
    });
  });

  describe('Admin Configuration Management Workflow', () => {
    beforeEach(() => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(adminUser);
    });

    it('should complete admin configuration workflow', async () => {
      // Step 1: Get current default configuration
      jest.spyOn(ConfigurationService, 'getAllConfigurations').mockResolvedValue([{
        id: 1,
        name: 'Default Config',
        description: 'Default configuration for new users',
        configData: {
          groups: [
            { name: 'Work Tools', description: 'Essential work applications', sortOrder: 0 },
            { name: 'Resources', description: 'Company resources', sortOrder: 1 }
          ],
          links: [
            { name: 'Company Portal', url: 'https://portal.company.com', description: 'Main company portal', groupName: 'Work Tools', sortOrder: 0 },
            { name: 'HR System', url: 'https://hr.company.com', description: 'Human resources', groupName: 'Resources', sortOrder: 0 }
          ]
        },
        version: 1,
        isActive: true,
        createdBy: 1,
        createdAt: new Date()
      }]);

      const configResponse = await request(app)
        .get('/api/admin/config/active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(configResponse.status).toBe(200);
      expect(configResponse.body.data.configuration.name).toBe('Default Config');

      // Step 2: Update default configuration
      jest.spyOn(ConfigurationService, 'updateConfiguration').mockResolvedValue({
        id: 1,
        name: 'Updated Default Config',
        description: 'Updated configuration',
        configData: {
          groups: [
            { name: 'Updated Work Tools', description: 'Updated work applications', sortOrder: 0 }
          ],
          links: [
            { name: 'Updated Portal', url: 'https://newportal.company.com', description: 'Updated portal', groupName: 'Updated Work Tools', sortOrder: 0 }
          ]
        },
        version: 2,
        isActive: true,
        createdBy: 2,
        createdAt: new Date()
      });

      const updateConfigResponse = await request(app)
        .put('/api/admin/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Default Config',
          description: 'Updated configuration',
          configData: {
            groups: [
              { name: 'Updated Work Tools', description: 'Updated work applications', sortOrder: 0 }
            ],
            links: [
              { name: 'Updated Portal', url: 'https://newportal.company.com', description: 'Updated portal', groupName: 'Updated Work Tools', sortOrder: 0 }
            ]
          }
        });

      expect(updateConfigResponse.status).toBe(200);
      expect(updateConfigResponse.body.data.configuration.name).toBe('Updated Default Config');
      expect(updateConfigResponse.body.data.configuration.version).toBe(2);

      // Step 3: Publish configuration to users
      jest.spyOn(ConfigurationService, 'applyToUser').mockResolvedValue();

      const publishResponse = await request(app)
        .post('/api/admin/config/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          configId: 1,
          strategy: 'reset'
        });

      expect(publishResponse.status).toBe(200);
      expect(publishResponse.body.success).toBe(true);

      // Step 4: Get all users (admin function)
      jest.spyOn(UserService, 'getAllUsers').mockResolvedValue([
        regularUser,
        adminUser
      ]);

      const usersResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(usersResponse.status).toBe(200);
      expect(usersResponse.body.data.users).toHaveLength(2);

      // Step 5: Reset specific user to default config
      jest.spyOn(ConfigurationService, 'applyToUser').mockResolvedValue();

      const resetUserResponse = await request(app)
        .post('/api/admin/users/1/reset')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          strategy: 'reset'
        });

      expect(resetUserResponse.status).toBe(200);
      expect(resetUserResponse.body.success).toBe(true);
    });
  });

  describe('Import/Export Workflow', () => {
    beforeEach(() => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(adminUser);
    });

    it('should complete import/export workflow', async () => {
      // Step 1: Export current configuration
      jest.spyOn(LinkService, 'getUserLinks').mockResolvedValue([testLink]);
      jest.spyOn(GroupService, 'getUserGroups').mockResolvedValue([testGroup]);

      const exportResponse = await request(app)
        .get('/api/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(exportResponse.status).toBe(200);
      expect(exportResponse.headers['content-type']).toContain('text/csv');

      // Step 2: Import configuration (simulate file upload)
      // Note: This would normally involve file upload, but we'll mock the parsing
      jest.spyOn(require('../services/importService').ImportService, 'batchImport').mockResolvedValue({
        success: true,
        totalRows: 2,
        successfulImports: 2,
        errors: [],
        createdGroups: ['Imported Group'],
        createdLinks: 1
      });

      // Simulate import request (in real scenario, this would include file upload)
      const importResponse = await request(app)
        .post('/api/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          data: {
            groups: [{ name: 'Imported Group', description: 'From CSV' }],
            links: [{ name: 'Imported Link', url: 'https://imported.com', description: 'From CSV', groupName: 'Imported Group' }]
          }
        });

      expect(importResponse.status).toBe(200);
      expect(importResponse.body.success).toBe(true);
    });
  });

  describe('Favicon Service Integration', () => {
    beforeEach(() => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(regularUser);
    });

    it('should complete favicon extraction workflow', async () => {
      // Step 1: Extract favicon from URL
      jest.spyOn(require('../services/faviconService').faviconService, 'extractFavicon').mockResolvedValue('https://example.com/favicon.ico');

      const faviconResponse = await request(app)
        .post('/api/favicon/extract')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          url: 'https://example.com'
        });

      expect(faviconResponse.status).toBe(200);
      expect(faviconResponse.body.data.faviconUrl).toBe('https://example.com/favicon.ico');

      // Step 2: Create link with extracted favicon
      jest.spyOn(LinkService, 'createLink').mockResolvedValue({
        ...testLink,
        iconUrl: 'https://example.com/favicon.ico'
      });

      const linkWithFaviconResponse = await request(app)
        .post('/api/links')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Link with Favicon',
          url: 'https://example.com',
          description: 'Link with favicon',
          groupId: 1,
          iconUrl: 'https://example.com/favicon.ico'
        });

      expect(linkWithFaviconResponse.status).toBe(201);
      expect(linkWithFaviconResponse.body.data.link.iconUrl).toBe('https://example.com/favicon.ico');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle authentication errors gracefully', async () => {
      // Test with invalid token
      const response = await request(app)
        .get('/api/links')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should handle authorization errors gracefully', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(regularUser);

      // Regular user trying to access admin endpoint
      const response = await request(app)
        .get('/api/admin/config')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should handle validation errors gracefully', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(regularUser);

      // Invalid link data
      const response = await request(app)
        .post('/api/links')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '', // Empty name
          url: 'invalid-url', // Invalid URL
          groupId: 'not-a-number' // Invalid group ID
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle resource not found errors gracefully', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(regularUser);
      jest.spyOn(LinkService, 'updateLink').mockRejectedValue(new Error('Link not found'));

      const response = await request(app)
        .put('/api/links/999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(() => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(regularUser);
    });

    it('should handle large datasets efficiently', async () => {
      // Simulate large number of links
      const manyLinks = Array.from({ length: 100 }, (_, i) => ({
        ...testLink,
        id: i + 1,
        name: `Link ${i + 1}`,
        url: `https://example${i + 1}.com`
      }));

      jest.spyOn(LinkService, 'getUserLinks').mockResolvedValue(manyLinks);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/links')
        .set('Authorization', `Bearer ${userToken}`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(response.body.data.links).toHaveLength(100);
      
      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle concurrent requests properly', async () => {
      jest.spyOn(LinkService, 'getUserLinks').mockResolvedValue([testLink]);

      // Make multiple concurrent requests
      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/links')
          .set('Authorization', `Bearer ${userToken}`)
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data.links).toHaveLength(1);
      });
    });
  });

  describe('System Health and Monitoring', () => {
    it('should provide health check endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.environment).toBeDefined();
      expect(response.body.version).toBeDefined();
    });

    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app).get('/api/non-existent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});