import { executeQuery } from '../config/database';
import { DefaultConfiguration, DefaultConfigurationRow, ConfigurationData } from './interfaces';
import { GroupService } from './Group';
import { LinkService } from './WebsiteLink';

// Convert database row to DefaultConfiguration interface
const mapConfigRowToConfig = (row: DefaultConfigurationRow): DefaultConfiguration => {
  let configData;
  
  // Handle both string and object cases for config_data
  if (typeof row.config_data === 'string') {
    try {
      configData = JSON.parse(row.config_data);
    } catch (error) {
      console.error('Failed to parse config_data JSON:', row.config_data);
      throw new Error(`Invalid JSON in config_data: ${error}`);
    }
  } else {
    // Already an object (MySQL JSON type returns objects directly)
    configData = row.config_data;
  }
  
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    configData: configData,
    version: row.version,
    isActive: row.is_active,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at
  };
};

export class ConfigurationService {
  // Get the active default configuration
  static async getActiveConfiguration(): Promise<DefaultConfiguration | null> {
    const query = 'SELECT * FROM default_configurations WHERE is_active = true ORDER BY version DESC LIMIT 1';
    const results = await executeQuery<DefaultConfigurationRow>(query);
    
    if (results.length === 0) {
      return null;
    }
    
    const configRow = results[0];
    if (!configRow) {
      return null;
    }
    
    return mapConfigRowToConfig(configRow);
  }

  // Create a new default configuration
  static async createConfiguration(
    name: string,
    description: string,
    configData: ConfigurationData,
    createdBy: number
  ): Promise<DefaultConfiguration> {
    // Get the next version number
    const versionQuery = 'SELECT COALESCE(MAX(version), 0) + 1 as nextVersion FROM default_configurations';
    const versionResult = await executeQuery<{ nextVersion: number }>(versionQuery);
    const versionRow = versionResult[0];
    if (!versionRow) {
      throw new Error('Failed to get next version number');
    }
    const nextVersion = versionRow.nextVersion;
    
    const query = `
      INSERT INTO default_configurations (name, description, config_data, version, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery<{ insertId: number }>(query, [
      name,
      description,
      JSON.stringify(configData),
      nextVersion,
      createdBy
    ]);
    
    // Get the created configuration
    const createdConfig = await this.getConfigurationById((result as any).insertId);
    if (!createdConfig) {
      throw new Error('Failed to create configuration');
    }
    
    return createdConfig;
  }

  // Get configuration by ID
  static async getConfigurationById(id: number): Promise<DefaultConfiguration | null> {
    const query = 'SELECT * FROM default_configurations WHERE id = ?';
    const results = await executeQuery<DefaultConfigurationRow>(query, [id]);
    
    if (results.length === 0) {
      return null;
    }
    
    const configRow = results[0];
    if (!configRow) {
      return null;
    }
    
    return mapConfigRowToConfig(configRow);
  }

  // Update configuration
  static async updateConfiguration(
    id: number,
    name: string,
    description: string,
    configData: ConfigurationData
  ): Promise<DefaultConfiguration> {
    const query = `
      UPDATE default_configurations 
      SET name = ?, description = ?, config_data = ?, version = version + 1, updated_at = NOW()
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, [
      name,
      description,
      JSON.stringify(configData),
      id
    ]);
    
    if ((result as any).affectedRows === 0) {
      throw new Error('Configuration not found');
    }
    
    const updatedConfig = await this.getConfigurationById(id);
    if (!updatedConfig) {
      throw new Error('Configuration not found after update');
    }
    
    return updatedConfig;
  }

  // Increment configuration version (for tracking changes)
  static async incrementVersion(id: number): Promise<void> {
    const query = `
      UPDATE default_configurations 
      SET version = version + 1, updated_at = NOW()
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, [id]);
    
    if ((result as any).affectedRows === 0) {
      throw new Error('Configuration not found');
    }
  }

  // Activate a configuration (deactivates others)
  static async activateConfiguration(id: number): Promise<void> {
    // Start by deactivating all configurations
    await executeQuery('UPDATE default_configurations SET is_active = false');
    
    // Activate the specified configuration
    const result = await executeQuery('UPDATE default_configurations SET is_active = true WHERE id = ?', [id]);
    
    if ((result as any).affectedRows === 0) {
      throw new Error('Configuration not found');
    }
  }

  // Apply raw configuration data to a user (no DB-stored config required)
  static async applyConfigDataToUser(
    userId: number,
    configData: ConfigurationData,
    strategy: 'reset' | 'merge' | 'sync' = 'reset'
  ): Promise<void> {
    if (strategy === 'reset') {
      await executeQuery('UPDATE website_links SET is_active = false WHERE user_id = ?', [userId]);
      await executeQuery('UPDATE `groups` SET is_active = false WHERE user_id = ?', [userId]);
    }

    const normalize = (value: string) => value.trim().toLowerCase();
    const systemGroupNames = new Set(
      configData.groups
        .filter(group => group.isSystemGroup)
        .map(group => normalize(group.name))
    );

    if (strategy === 'sync') {
      const userSystemGroups = await executeQuery<{ id: number; name: string }>(
        'SELECT id, name FROM `groups` WHERE user_id = ? AND is_active = true AND is_system_group = true',
        [userId]
      );

      for (const group of userSystemGroups) {
        if (!systemGroupNames.has(normalize(group.name))) {
          await executeQuery(
            'UPDATE website_links SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE group_id = ? AND is_active = true',
            [group.id]
          );
          await executeQuery(
            'UPDATE `groups` SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [group.id, userId]
          );
        }
      }
    }

    const groupMapping: { [key: string]: number } = {};

    for (const groupData of configData.groups) {
      let group;

      if (strategy === 'merge' || strategy === 'sync') {
        const existingRows = await executeQuery<{
          id: number;
          is_active: number | boolean;
        }>(
          'SELECT id, is_active FROM `groups` WHERE user_id = ? AND TRIM(LOWER(name)) = TRIM(LOWER(?)) ORDER BY is_active DESC, id ASC LIMIT 1',
          [userId, groupData.name]
        );
        const existingRow = existingRows[0];
        if (existingRow) {
          await executeQuery(
            `UPDATE \`groups\`
             SET name = ?, description = ?, sort_order = ?, is_system_group = ?, is_deletable = ?, is_active = true, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            [
              groupData.name,
              groupData.description ?? null,
              groupData.sortOrder ?? 0,
              groupData.isSystemGroup || false,
              groupData.isDeletable !== undefined ? groupData.isDeletable : true,
              existingRow.id,
              userId
            ]
          );
          group = await GroupService.getGroupById(existingRow.id);
        }
      }

      if (!group) {
        group = await GroupService.createGroup(userId, {
          name: groupData.name,
          description: groupData.description ?? undefined,
          sortOrder: groupData.sortOrder,
          isSystemGroup: groupData.isSystemGroup || false,
          isDeletable: groupData.isDeletable !== undefined ? groupData.isDeletable : true
        });
      }

      groupMapping[groupData.name] = group.id;
    }

    for (const linkData of configData.links) {
      const groupId = groupMapping[linkData.groupName];
      if (!groupId) {
        console.warn(`Group ${linkData.groupName} not found for link ${linkData.name}`);
        continue;
      }

      if (strategy === 'merge' || strategy === 'sync') {
        if (linkData.isSystemLink) {
          const existingLinks = await LinkService.getLinksByGroup(userId, groupId);
          const normalizedName = normalize(linkData.name);
          const matches = existingLinks.filter(link =>
            normalize(link.name) === normalizedName || link.url === linkData.url
          );

          if (matches.length > 0) {
            const primary = matches.find(link => link.isSystemLink) ?? matches[0];
            if (!primary) {
              continue;
            }

            await LinkService.updateLink(primary.id, userId, {
              name: linkData.name,
              url: linkData.url,
              description: linkData.description ?? undefined,
              iconUrl: linkData.iconUrl ?? undefined,
              groupId: groupId,
              sortOrder: linkData.sortOrder,
              isSystemLink: true,
              isDeletable: false
            });

            for (const dup of matches) {
              if (dup.id === primary.id) {
                continue;
              }
              await executeQuery(
                'UPDATE website_links SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                [dup.id, userId]
              );
            }
            continue;
          }
        } else {
          const existingLinks = await LinkService.getLinksByGroup(userId, groupId);
          const existingLink = existingLinks.find(link => link.url === linkData.url);
          if (existingLink) {
            continue;
          }
        }
      }

      await LinkService.createLink(userId, {
        name: linkData.name,
        url: linkData.url,
        description: linkData.description ?? undefined,
        iconUrl: linkData.iconUrl ?? undefined,
        groupId: groupId,
        sortOrder: linkData.sortOrder,
        isSystemLink: linkData.isSystemLink || false,
        isDeletable: linkData.isDeletable !== undefined ? linkData.isDeletable : true
      });
    }

    if (strategy === 'sync') {
      const systemLinks = await executeQuery<{
        id: number;
        name: string;
        group_id: number;
      }>(
        `SELECT wl.id, wl.name, wl.group_id
         FROM website_links wl
         JOIN \`groups\` g ON wl.group_id = g.id
         WHERE wl.user_id = ? AND wl.is_active = true AND g.is_active = true AND g.is_system_group = true`,
        [userId]
      );

      const configLinkMap = new Map<string, Set<string>>();
      for (const link of configData.links) {
        const groupKey = normalize(link.groupName);
        if (!configLinkMap.has(groupKey)) {
          configLinkMap.set(groupKey, new Set());
        }
        configLinkMap.get(groupKey)!.add(normalize(link.name));
      }

      const seen = new Set<string>();
      for (const link of systemLinks) {
        const groupRows = await executeQuery<{ name: string }>(
          'SELECT name FROM `groups` WHERE id = ? AND user_id = ?',
          [link.group_id, userId]
        );
        const groupName = groupRows[0]?.name;
        if (!groupName) {
          continue;
        }
        const groupKey = normalize(groupName);
        const nameKey = normalize(link.name);
        const allowed = configLinkMap.get(groupKey);
        const identity = `${groupKey}::${nameKey}`;

        if (!allowed || !allowed.has(nameKey) || seen.has(identity)) {
          await executeQuery(
            'UPDATE website_links SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [link.id, userId]
          );
        } else {
          seen.add(identity);
        }
      }
    }
  }

  // Apply configuration to a user
  static async applyToUser(
    userId: number,
    configId: number,
    strategy: 'reset' | 'merge' | 'sync' = 'reset'
  ): Promise<void> {
    const config = await this.getConfigurationById(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    if (strategy === 'reset') {
      // Delete existing user data
      await executeQuery('UPDATE website_links SET is_active = false WHERE user_id = ?', [userId]);
      await executeQuery('UPDATE `groups` SET is_active = false WHERE user_id = ?', [userId]);
    }

    const normalize = (value: string) => value.trim().toLowerCase();
    const systemGroupNames = new Set(
      config.configData.groups
        .filter(group => group.isSystemGroup)
        .map(group => normalize(group.name))
    );

    if (strategy === 'sync') {
      const userSystemGroups = await executeQuery<{ id: number; name: string }>(
        'SELECT id, name FROM `groups` WHERE user_id = ? AND is_active = true AND is_system_group = true',
        [userId]
      );

      for (const group of userSystemGroups) {
        if (!systemGroupNames.has(normalize(group.name))) {
          await executeQuery(
            'UPDATE website_links SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE group_id = ? AND is_active = true',
            [group.id]
          );
          await executeQuery(
            'UPDATE `groups` SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [group.id, userId]
          );
        }
      }
    }
    
    // Create groups from configuration
    const groupMapping: { [key: string]: number } = {};
    
    for (const groupData of config.configData.groups) {
      let group;
      
      if (strategy === 'merge' || strategy === 'sync') {
        // Check if group already exists (case/whitespace insensitive, include inactive)
        const existingRows = await executeQuery<{
          id: number;
          is_active: number | boolean;
        }>(
          'SELECT id, is_active FROM `groups` WHERE user_id = ? AND TRIM(LOWER(name)) = TRIM(LOWER(?)) ORDER BY is_active DESC, id ASC LIMIT 1',
          [userId, groupData.name]
        );
        const existingRow = existingRows[0];
        if (existingRow) {
          const isActive = Boolean(existingRow.is_active);
          // Restore/update existing group to avoid duplicates
          await executeQuery(
            `UPDATE \`groups\`
             SET name = ?, description = ?, sort_order = ?, is_system_group = ?, is_deletable = ?, is_active = true, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            [
              groupData.name,
              groupData.description ?? null,
              groupData.sortOrder ?? 0,
              groupData.isSystemGroup || false,
              groupData.isDeletable !== undefined ? groupData.isDeletable : true,
              existingRow.id,
              userId
            ]
          );
          group = await GroupService.getGroupById(existingRow.id);
        }
      }

      if (!group) {
        // Create new group
        group = await GroupService.createGroup(userId, {
          name: groupData.name,
          description: groupData.description ?? undefined,
          sortOrder: groupData.sortOrder,
          isSystemGroup: groupData.isSystemGroup || false,
          isDeletable: groupData.isDeletable !== undefined ? groupData.isDeletable : true
        });
      }
      
      groupMapping[groupData.name] = group.id;
    }
    
    // Create links from configuration
    for (const linkData of config.configData.links) {
      const groupId = groupMapping[linkData.groupName];
      if (!groupId) {
        console.warn(`Group ${linkData.groupName} not found for link ${linkData.name}`);
        continue;
      }
      
      if (strategy === 'merge' || strategy === 'sync') {
        // For system links, check by name and update if exists
        if (linkData.isSystemLink) {
          const existingLinks = await LinkService.getLinksByGroup(userId, groupId);
          const normalizedName = normalize(linkData.name);
          const matches = existingLinks.filter(link =>
            normalize(link.name) === normalizedName || link.url === linkData.url
          );

          if (matches.length > 0) {
            const primary = matches.find(link => link.isSystemLink) ?? matches[0];
            if (!primary) {
              continue;
            }

            // Update existing link and convert to system if needed
            await LinkService.updateLink(primary.id, userId, {
              name: linkData.name,
              url: linkData.url,
              description: linkData.description ?? undefined,
              iconUrl: linkData.iconUrl ?? undefined,
              groupId: groupId,
              sortOrder: linkData.sortOrder,
              isSystemLink: true,
              isDeletable: false
            });

            for (const dup of matches) {
              if (dup.id === primary.id) {
                continue;
              }
              await executeQuery(
                'UPDATE website_links SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                [dup.id, userId]
              );
            }
            continue; // Skip creating new link
          }
        } else {
          // For regular links, check if link already exists (by URL in the same group)
          const existingLinks = await LinkService.getLinksByGroup(userId, groupId);
          const existingLink = existingLinks.find(link => link.url === linkData.url);
          
          if (existingLink) {
            continue; // Skip if link already exists
          }
        }
      }
      
      // Create new link
      await LinkService.createLink(userId, {
        name: linkData.name,
        url: linkData.url,
        description: linkData.description ?? undefined,
        iconUrl: linkData.iconUrl ?? undefined,
        groupId: groupId,
        sortOrder: linkData.sortOrder,
        isSystemLink: linkData.isSystemLink || false,
        isDeletable: linkData.isDeletable !== undefined ? linkData.isDeletable : true
      });
    }

    if (strategy === 'sync') {
      const systemLinks = await executeQuery<{
        id: number;
        name: string;
        group_id: number;
      }>(
        `SELECT wl.id, wl.name, wl.group_id
         FROM website_links wl
         JOIN \`groups\` g ON wl.group_id = g.id
         WHERE wl.user_id = ? AND wl.is_active = true AND g.is_active = true AND g.is_system_group = true`,
        [userId]
      );

      const configLinkMap = new Map<string, Set<string>>();
      for (const link of config.configData.links) {
        const groupKey = normalize(link.groupName);
        if (!configLinkMap.has(groupKey)) {
          configLinkMap.set(groupKey, new Set());
        }
        configLinkMap.get(groupKey)!.add(normalize(link.name));
      }

      for (const link of systemLinks) {
        const groupRows = await executeQuery<{ name: string }>(
          'SELECT name FROM `groups` WHERE id = ? AND user_id = ?',
          [link.group_id, userId]
        );
        const groupName = groupRows[0]?.name;
        if (!groupName) {
          continue;
        }
        const groupKey = normalize(groupName);
        const allowed = configLinkMap.get(groupKey);
        if (!allowed || !allowed.has(normalize(link.name))) {
          await executeQuery(
            'UPDATE website_links SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [link.id, userId]
          );
        }
      }
    }
  }

  // Apply active configuration to a new user
  static async applyActiveConfigurationToUser(userId: number): Promise<void> {
    const activeConfig = await this.getActiveConfiguration();
    if (!activeConfig) {
      console.warn('No active default configuration found');
      return;
    }
    
    await this.applyToUser(userId, activeConfig.id, 'reset');
  }

  // Rebuild default configuration from an admin user's current setup and activate it
  static async rebuildFromAdmin(userId: number, description?: string): Promise<DefaultConfiguration | null> {
    const roleRows = await executeQuery<{ role: string }>('SELECT role FROM users WHERE id = ?', [userId]);
    const role = roleRows[0]?.role;
    if (role !== 'admin') {
      return null;
    }

    const activeConfig = await this.getActiveConfiguration();
    const name = activeConfig?.name || '默认企业配置';
    const desc = description ?? activeConfig?.description ?? 'Auto-generated from admin changes';

    const newConfig = await this.createFromUser(userId, name, desc, userId);
    await this.activateConfiguration(newConfig.id);
    return newConfig;
  }

  // Get all configurations
  static async getAllConfigurations(): Promise<DefaultConfiguration[]> {
    const query = 'SELECT * FROM default_configurations ORDER BY version DESC';
    const results = await executeQuery<DefaultConfigurationRow>(query);
    
    return results.map(mapConfigRowToConfig);
  }

  // Delete configuration
  static async deleteConfiguration(id: number): Promise<void> {
    // Check if this is the active configuration
    const config = await this.getConfigurationById(id);
    if (config?.isActive) {
      throw new Error('Cannot delete the active configuration');
    }
    
    const result = await executeQuery('DELETE FROM default_configurations WHERE id = ?', [id]);
    
    if ((result as any).affectedRows === 0) {
      throw new Error('Configuration not found');
    }
  }

  // Create configuration from user's current setup
  static async createFromUser(
    userId: number,
    name: string,
    description: string,
    createdBy: number
  ): Promise<DefaultConfiguration> {
    // Get user's groups and links
    const groups = await GroupService.getUserGroups(userId);
    const links = await LinkService.getLinksWithGroups(userId);
    
    // Build configuration data
    const configData: ConfigurationData = {
      groups: groups.map(group => ({
        name: group.name,
        description: group.description ?? undefined,
        sortOrder: group.sortOrder,
        isSystemGroup: group.isSystemGroup,
        isDeletable: group.isDeletable
      })),
      links: links.map(link => ({
        name: link.name,
        url: link.url,
        description: link.description ?? undefined,
        iconUrl: link.iconUrl ?? undefined,
        groupName: link.groupName,
        sortOrder: link.sortOrder,
        isSystemLink: link.isSystemLink,
        isDeletable: link.isDeletable
      }))
    };
    
    return await this.createConfiguration(name, description, configData, createdBy);
  }

  // Get configuration statistics
  static async getConfigurationStats(id: number): Promise<{
    groupCount: number;
    linkCount: number;
    usersWithConfig: number;
  }> {
    const config = await this.getConfigurationById(id);
    if (!config) {
      throw new Error('Configuration not found');
    }
    
    const groupCount = config.configData.groups.length;
    const linkCount = config.configData.links.length;
    
    // Count users who might have this configuration (approximation)
    // This is complex to determine exactly, so we'll return 0 for now
    const usersWithConfig = 0;
    
    return {
      groupCount,
      linkCount,
      usersWithConfig
    };
  }

  // Validate configuration data
  static validateConfigurationData(configData: ConfigurationData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate groups
    if (!Array.isArray(configData.groups)) {
      errors.push('Groups must be an array');
    } else {
      const groupNames = new Set<string>();
      configData.groups.forEach((group, index) => {
        if (!group.name || typeof group.name !== 'string') {
          errors.push(`Group ${index + 1}: name is required and must be a string`);
        } else if (groupNames.has(group.name)) {
          errors.push(`Group ${index + 1}: duplicate group name "${group.name}"`);
        } else {
          groupNames.add(group.name);
        }
        
        if (group.sortOrder !== undefined && typeof group.sortOrder !== 'number') {
          errors.push(`Group ${index + 1}: sortOrder must be a number`);
        }
      });
    }
    
    // Validate links
    if (!Array.isArray(configData.links)) {
      errors.push('Links must be an array');
    } else {
      const groupNames = new Set(configData.groups.map(g => g.name));
      
      configData.links.forEach((link, index) => {
        if (!link.name || typeof link.name !== 'string') {
          errors.push(`Link ${index + 1}: name is required and must be a string`);
        }
        
        if (!link.url || typeof link.url !== 'string') {
          errors.push(`Link ${index + 1}: url is required and must be a string`);
        } else {
          try {
            new URL(link.url);
          } catch {
            errors.push(`Link ${index + 1}: invalid URL format`);
          }
        }
        
        if (!link.groupName || typeof link.groupName !== 'string') {
          errors.push(`Link ${index + 1}: groupName is required and must be a string`);
        } else if (!groupNames.has(link.groupName)) {
          errors.push(`Link ${index + 1}: groupName "${link.groupName}" does not exist in groups`);
        }
        
        if (link.sortOrder !== undefined && typeof link.sortOrder !== 'number') {
          errors.push(`Link ${index + 1}: sortOrder must be a number`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
