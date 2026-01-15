import { ConfigurationService } from '../models/DefaultConfiguration';
import { UserService } from '../models/User';
import { ConfigurationData, DefaultConfiguration } from '../models/interfaces';

const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@company.com',
  password: 'admin123',
  role: 'admin' as const
};

export const DEFAULT_CONFIGURATION_NAME = '默认企业配置';
export const DEFAULT_CONFIGURATION_DESCRIPTION = '包含内部办公系统的标准配置（新用户注册时自动应用）';

export const DEFAULT_CONFIGURATION_DATA: ConfigurationData = {
  groups: [
    {
      name: '内部办公',
      description: '公司内部办公系统（管理员配置，不可删除）',
      sortOrder: 0,
      isSystemGroup: true,
      isDeletable: false
    }
  ],
  links: [
    {
      name: '公司网站',
      url: 'http://wm.czgm.com',
      description: '公司官方网站',
      groupName: '内部办公',
      sortOrder: 0,
      isSystemLink: true,
      isDeletable: false
    },
    {
      name: '协同办公系统(OA)',
      url: 'http://oa.czgm.com',
      description: '办公自动化系统',
      groupName: '内部办公',
      sortOrder: 1,
      isSystemLink: true,
      isDeletable: false
    },
    {
      name: '人力资源系统(EHR)',
      url: 'http://ehr.czgm.com',
      description: '人力资源管理系统',
      groupName: '内部办公',
      sortOrder: 2,
      isSystemLink: true,
      isDeletable: false
    },
    {
      name: '电子邮件系统',
      url: 'http://mail.czgm.com',
      description: '企业邮箱系统',
      groupName: '内部办公',
      sortOrder: 3,
      isSystemLink: true,
      isDeletable: false
    },
    {
      name: 'CRM系统',
      url: 'http://192.168.21.197',
      description: '客户关系管理系统',
      groupName: '内部办公',
      sortOrder: 4,
      isSystemLink: true,
      isDeletable: false
    }
  ]
};

const ensureAdminUserId = async (): Promise<number> => {
  const adminUserId = await UserService.getFirstAdminUserId();
  if (adminUserId) {
    return adminUserId;
  }

  const adminUser = await UserService.createUser(DEFAULT_ADMIN);
  console.warn('No admin user found. Created default admin: admin / admin123');
  return adminUser.id;
};

export const ensureActiveDefaultConfiguration = async (): Promise<DefaultConfiguration | null> => {
  const activeConfig = await ConfigurationService.getActiveConfiguration();
  if (activeConfig) {
    return activeConfig;
  }

  const adminUserId = await ensureAdminUserId();
  const newConfig = await ConfigurationService.createConfiguration(
    DEFAULT_CONFIGURATION_NAME,
    DEFAULT_CONFIGURATION_DESCRIPTION,
    DEFAULT_CONFIGURATION_DATA,
    adminUserId
  );

  await ConfigurationService.activateConfiguration(newConfig.id);
  return newConfig;
};

export const syncConfigurationToAllUsers = async (
  configId: number,
  strategy: 'reset' | 'merge' = 'merge'
): Promise<void> => {
  const users = await UserService.getAllUsers();

  for (const user of users) {
    try {
      await ConfigurationService.applyToUser(user.id, configId, strategy);
    } catch (error) {
      console.error(`Failed to sync configuration to user ${user.id}:`, error);
    }
  }
};
