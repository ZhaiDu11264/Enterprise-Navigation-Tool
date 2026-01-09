import { ConfigurationService } from '../models/DefaultConfiguration';
import { GroupService } from '../models/Group';
import { LinkService } from '../models/WebsiteLink';
import { UserService } from '../models/User';
import { ConfigurationData } from '../models/interfaces';

describe('Default Configuration System', () => {
  let testUserId: number;
  let testConfigId: number;

  beforeAll(async () => {
    // Create a test user
    const testUser = await UserService.createUser({
      username: 'testuser_config',
      email: 'testconfig@example.com',
      password: 'password123',
      role: 'user'
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await UserService.deleteUser(testUserId);
    }
    if (testConfigId) {
      try {
        await ConfigurationService.deleteConfiguration(testConfigId);
      } catch (error) {
        // Configuration might be active, so deletion could fail
      }
    }
  });

  describe('Configuration Management', () => {
    test('should create default configuration with system groups and links', async () => {
      const configData: ConfigurationData = {
        groups: [
          {
            name: "内部办公",
            description: "公司内部办公系统",
            sortOrder: 0,
            isSystemGroup: true,
            isDeletable: false
          }
        ],
        links: [
          {
            name: "公司网站",
            url: "http://wm.czgm.com",
            description: "公司官方网站",
            groupName: "内部办公",
            sortOrder: 0,
            isSystemLink: true,
            isDeletable: false
          },
          {
            name: "协同办公系统(OA)",
            url: "http://oa.czgm.com",
            description: "办公自动化系统",
            groupName: "内部办公",
            sortOrder: 1,
            isSystemLink: true,
            isDeletable: false
          }
        ]
      };

      const config = await ConfigurationService.createConfiguration(
        'Test Enterprise Configuration',
        'Test configuration with system links',
        configData,
        1 // Admin user ID
      );

      testConfigId = config.id;

      expect(config).toBeDefined();
      expect(config.name).toBe('Test Enterprise Configuration');
      expect(config.configData.groups).toHaveLength(1);
      expect(config.configData.links).toHaveLength(2);
      expect(config.configData.groups[0].isSystemGroup).toBe(true);
      expect(config.configData.groups[0].isDeletable).toBe(false);
      expect(config.configData.links[0].isSystemLink).toBe(true);
      expect(config.configData.links[0].isDeletable).toBe(false);
    });

    test('should validate configuration data', async () => {
      const invalidConfigData: ConfigurationData = {
        groups: [
          {
            name: "",
            description: "Invalid group",
            sortOrder: 0
          }
        ],
        links: [
          {
            name: "Invalid Link",
            url: "invalid-url",
            description: "Invalid URL",
            groupName: "NonExistentGroup",
            sortOrder: 0
          }
        ]
      };

      const validation = ConfigurationService.validateConfigurationData(invalidConfigData);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Group 1: name is required and must be a string');
      expect(validation.errors).toContain('Link 1: invalid URL format');
      expect(validation.errors).toContain('Link 1: groupName "NonExistentGroup" does not exist in groups');
    });
  });

  describe('Configuration Application', () => {
    test('should apply configuration to user with system protection', async () => {
      // First create and activate a configuration
      const configData: ConfigurationData = {
        groups: [
          {
            name: "内部办公",
            description: "公司内部办公系统",
            sortOrder: 0,
            isSystemGroup: true,
            isDeletable: false
          }
        ],
        links: [
          {
            name: "公司网站",
            url: "http://wm.czgm.com",
            description: "公司官方网站",
            groupName: "内部办公",
            sortOrder: 0,
            isSystemLink: true,
            isDeletable: false
          }
        ]
      };

      const config = await ConfigurationService.createConfiguration(
        'Test Application Configuration',
        'Test configuration for application',
        configData,
        1
      );

      // Apply configuration to user
      await ConfigurationService.applyToUser(testUserId, config.id, 'reset');

      // Verify groups were created
      const userGroups = await GroupService.getUserGroups(testUserId);
      expect(userGroups).toHaveLength(1);
      
      const systemGroup = userGroups.find(g => g.name === "内部办公");
      expect(systemGroup).toBeDefined();
      expect(systemGroup?.isSystemGroup).toBe(true);
      expect(systemGroup?.isDeletable).toBe(false);

      // Verify links were created
      const userLinks = await LinkService.getUserLinks(testUserId);
      expect(userLinks).toHaveLength(1);
      
      const systemLink = userLinks.find(l => l.name === "公司网站");
      expect(systemLink).toBeDefined();
      expect(systemLink?.isSystemLink).toBe(true);
      expect(systemLink?.isDeletable).toBe(false);
      expect(systemLink?.url).toBe("http://wm.czgm.com");

      // Clean up
      await ConfigurationService.deleteConfiguration(config.id);
    });

    test('should prevent deletion of system groups and links', async () => {
      // Get the system group and link created in previous test
      const userGroups = await GroupService.getUserGroups(testUserId);
      const systemGroup = userGroups.find(g => g.isSystemGroup);
      
      const userLinks = await LinkService.getUserLinks(testUserId);
      const systemLink = userLinks.find(l => l.isSystemLink);

      if (systemGroup) {
        // Try to delete system group - should fail
        await expect(
          GroupService.deleteGroup(systemGroup.id, testUserId)
        ).rejects.toThrow('Cannot delete system group');
      }

      if (systemLink) {
        // Try to delete system link - should fail
        await expect(
          LinkService.deleteLink(systemLink.id, testUserId)
        ).rejects.toThrow('Cannot delete system link');
      }
    });
  });

  describe('Active Configuration', () => {
    test('should apply active configuration to new user', async () => {
      // Create a test configuration
      const configData: ConfigurationData = {
        groups: [
          {
            name: "测试分组",
            description: "测试用分组",
            sortOrder: 0,
            isSystemGroup: false,
            isDeletable: true
          }
        ],
        links: [
          {
            name: "测试链接",
            url: "http://test.example.com",
            description: "测试链接",
            groupName: "测试分组",
            sortOrder: 0,
            isSystemLink: false,
            isDeletable: true
          }
        ]
      };

      const config = await ConfigurationService.createConfiguration(
        'Test Active Configuration',
        'Test configuration for new users',
        configData,
        1
      );

      // Activate the configuration
      await ConfigurationService.activateConfiguration(config.id);

      // Create a new user
      const newUser = await UserService.createUser({
        username: 'newuser_test',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user'
      });

      // Apply active configuration (this would normally happen during registration)
      await ConfigurationService.applyActiveConfigurationToUser(newUser.id);

      // Verify the configuration was applied
      const userGroups = await GroupService.getUserGroups(newUser.id);
      const userLinks = await LinkService.getUserLinks(newUser.id);

      expect(userGroups).toHaveLength(1);
      expect(userGroups[0].name).toBe("测试分组");
      expect(userLinks).toHaveLength(1);
      expect(userLinks[0].name).toBe("测试链接");

      // Clean up
      await UserService.deleteUser(newUser.id);
      await ConfigurationService.deleteConfiguration(config.id);
    });
  });
});