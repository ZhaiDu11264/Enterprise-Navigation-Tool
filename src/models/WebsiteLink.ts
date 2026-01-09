import { executeQuery } from '../config/database';
import { WebsiteLink, WebsiteLinkRow, CreateLinkRequest, LinkOrder } from './interfaces';

// Convert database row to WebsiteLink interface
const mapLinkRowToLink = (row: WebsiteLinkRow): WebsiteLink => ({
  id: row.id,
  userId: row.user_id,
  groupId: row.group_id,
  name: row.name,
  url: row.url,
  description: row.description || undefined,
  iconUrl: row.icon_url || undefined,
  sortOrder: row.sort_order,
  isFavorite: row.is_favorite,
  accessCount: row.access_count,
  lastAccessedAt: row.last_accessed_at,
  isActive: row.is_active,
  isSystemLink: row.is_system_link,
  isDeletable: row.is_deletable,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export class LinkService {
  // Create a new website link
  static async createLink(userId: number, linkData: CreateLinkRequest & { isSystemLink?: boolean; isDeletable?: boolean }): Promise<WebsiteLink> {
    // Verify user owns the group
    const groupQuery = 'SELECT COUNT(*) as count FROM `groups` WHERE id = ? AND user_id = ? AND is_active = true';
    const groupResult = await executeQuery<{ count: number }>(groupQuery, [linkData.groupId, userId]);
    const groupRow = groupResult[0];
    if (!groupRow || groupRow.count === 0) {
      throw new Error('Group not found or access denied');
    }
    
    // Get the next sort order for this group
    const maxSortQuery = `
      SELECT COALESCE(MAX(sort_order), 0) as maxSort 
      FROM website_links 
      WHERE group_id = ? AND is_active = true
    `;
    const maxSortResult = await executeQuery<{ maxSort: number }>(maxSortQuery, [linkData.groupId]);
    const maxSortRow = maxSortResult[0];
    if (!maxSortRow) {
      throw new Error('Failed to get max sort order');
    }
    const nextSortOrder = linkData.sortOrder ?? (maxSortRow.maxSort + 1);
    
    const query = `
      INSERT INTO website_links (user_id, group_id, name, url, description, icon_url, sort_order, is_system_link, is_deletable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery<{ insertId: number }>(query, [
      userId,
      linkData.groupId,
      linkData.name,
      linkData.url,
      linkData.description || null,
      linkData.iconUrl || null,
      nextSortOrder,
      linkData.isSystemLink || false,
      linkData.isDeletable !== undefined ? linkData.isDeletable : true
    ]);
    
    // Get the created link
    const createdLink = await this.getLinkById((result as any).insertId);
    if (!createdLink) {
      throw new Error('Failed to create link');
    }
    
    // Auto-sync to default configuration if admin user creates system links
    await this.autoSyncToDefaultConfig(userId, createdLink);
    
    return createdLink;
  }

  // Get link by ID
  static async getLinkById(id: number): Promise<WebsiteLink | null> {
    const query = 'SELECT * FROM website_links WHERE id = ? AND is_active = true';
    const results = await executeQuery<WebsiteLinkRow>(query, [id]);
    
    if (results.length === 0) {
      return null;
    }
    
    const linkRow = results[0];
    if (!linkRow) {
      return null;
    }
    
    return mapLinkRowToLink(linkRow);
  }

  // Get all links for a user
  static async getUserLinks(userId: number): Promise<WebsiteLink[]> {
    const query = `
      SELECT wl.* FROM website_links wl
      JOIN \`groups\` g ON wl.group_id = g.id
      WHERE wl.user_id = ? AND wl.is_active = true AND g.is_active = true
      ORDER BY g.sort_order ASC, wl.sort_order ASC, wl.created_at ASC
    `;
    const results = await executeQuery<WebsiteLinkRow>(query, [userId]);
    
    return results.map(mapLinkRowToLink);
  }

  // Get links by group
  static async getLinksByGroup(userId: number, groupId: number): Promise<WebsiteLink[]> {
    const query = `
      SELECT wl.* FROM website_links wl
      JOIN \`groups\` g ON wl.group_id = g.id
      WHERE wl.user_id = ? AND wl.group_id = ? AND wl.is_active = true AND g.is_active = true
      ORDER BY wl.sort_order ASC, wl.created_at ASC
    `;
    const results = await executeQuery<WebsiteLinkRow>(query, [userId, groupId]);
    
    return results.map(mapLinkRowToLink);
  }

  // Update link
  static async updateLink(id: number, userId: number, updates: Partial<WebsiteLink>): Promise<WebsiteLink> {
    const allowedFields = ['name', 'url', 'description', 'iconUrl', 'groupId', 'sortOrder', 'isFavorite'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    // If groupId is being updated, verify user owns the new group
    if (updates.groupId !== undefined) {
      const groupQuery = 'SELECT COUNT(*) as count FROM `groups` WHERE id = ? AND user_id = ? AND is_active = true';
      const groupResult = await executeQuery<{ count: number }>(groupQuery, [updates.groupId, userId]);
      const groupRow = groupResult[0];
      if (!groupRow || groupRow.count === 0) {
        throw new Error('Target group not found or access denied');
      }
    }
    
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'iconUrl') {
          updateFields.push('icon_url = ?');
        } else if (key === 'groupId') {
          updateFields.push('group_id = ?');
        } else if (key === 'sortOrder') {
          updateFields.push('sort_order = ?');
        } else if (key === 'isFavorite') {
          updateFields.push('is_favorite = ?');
        } else {
          updateFields.push(`${key} = ?`);
        }
        updateValues.push(value);
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    updateValues.push(id, userId);
    
    const query = `
      UPDATE website_links 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND is_active = true
    `;
    
    const result = await executeQuery(query, updateValues);
    
    if ((result as any).affectedRows === 0) {
      throw new Error('Link not found or access denied');
    }
    
    const updatedLink = await this.getLinkById(id);
    if (!updatedLink) {
      throw new Error('Link not found after update');
    }
    
    // Auto-sync to default configuration if admin user updates system links
    await this.autoSyncToDefaultConfig(userId, updatedLink);
    
    return updatedLink;
  }

  // Delete link (soft delete)
  static async deleteLink(id: number, userId: number, allowSystemDelete: boolean = false): Promise<void> {
    // First check if this is a system link that cannot be deleted
    const link = await this.getLinkById(id);
    if (!link) {
      throw new Error('Link not found');
    }
    
    if (!link.isDeletable && !allowSystemDelete) {
      throw new Error('Cannot delete system link');
    }
    
    const query = `
      UPDATE website_links 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND is_active = true
    `;
    
    const result = await executeQuery(query, [id, userId]);
    
    if ((result as any).affectedRows === 0) {
      throw new Error('Link not found or access denied');
    }
  }

  // Reorder links
  static async reorderLinks(userId: number, linkOrders: LinkOrder[]): Promise<void> {
    for (const { id, sortOrder, groupId } of linkOrders) {
      const updateFields = ['sort_order = ?'];
      const updateValues = [sortOrder];
      
      // If groupId is provided, update it as well (for moving between groups)
      if (groupId !== undefined) {
        // Verify user owns the target group
        const groupQuery = 'SELECT COUNT(*) as count FROM `groups` WHERE id = ? AND user_id = ? AND is_active = true';
        const groupResult = await executeQuery<{ count: number }>(groupQuery, [groupId, userId]);
        const groupRow = groupResult[0];
        if (!groupRow || groupRow.count === 0) {
          throw new Error(`Target group ${groupId} not found or access denied`);
        }
        
        updateFields.push('group_id = ?');
        updateValues.push(groupId);
      }
      
      updateValues.push(id, userId);
      
      const query = `
        UPDATE website_links 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ? AND is_active = true
      `;
      
      await executeQuery(query, updateValues);
    }
  }

  // Search links
  static async searchLinks(userId: number, searchQuery: string): Promise<WebsiteLink[]> {
    const query = `
      SELECT wl.* FROM website_links wl
      JOIN \`groups\` g ON wl.group_id = g.id
      WHERE wl.user_id = ? AND wl.is_active = true AND g.is_active = true
      AND (
        MATCH(wl.name, wl.description) AGAINST(? IN NATURAL LANGUAGE MODE)
        OR wl.name LIKE ?
        OR wl.description LIKE ?
        OR wl.url LIKE ?
      )
      ORDER BY 
        MATCH(wl.name, wl.description) AGAINST(? IN NATURAL LANGUAGE MODE) DESC,
        wl.access_count DESC,
        wl.name ASC
    `;
    
    const searchPattern = `%${searchQuery}%`;
    const results = await executeQuery<WebsiteLinkRow>(query, [
      userId, searchQuery, searchPattern, searchPattern, searchPattern, searchQuery
    ]);
    
    return results.map(mapLinkRowToLink);
  }

  // Get favorite links
  static async getFavoriteLinks(userId: number): Promise<WebsiteLink[]> {
    const query = `
      SELECT wl.* FROM website_links wl
      JOIN \`groups\` g ON wl.group_id = g.id
      WHERE wl.user_id = ? AND wl.is_favorite = true AND wl.is_active = true AND g.is_active = true
      ORDER BY wl.access_count DESC, wl.name ASC
    `;
    const results = await executeQuery<WebsiteLinkRow>(query, [userId]);
    
    return results.map(mapLinkRowToLink);
  }

  // Get recent links
  static async getRecentLinks(userId: number, limit: number = 10): Promise<WebsiteLink[]> {
    const query = `
      SELECT wl.* FROM website_links wl
      JOIN \`groups\` g ON wl.group_id = g.id
      WHERE wl.user_id = ? AND wl.last_accessed_at IS NOT NULL AND wl.is_active = true AND g.is_active = true
      ORDER BY wl.last_accessed_at DESC
      LIMIT ?
    `;
    const results = await executeQuery<WebsiteLinkRow>(query, [userId, limit]);
    
    return results.map(mapLinkRowToLink);
  }

  // Record link access
  static async recordAccess(id: number, userId: number): Promise<void> {
    const query = `
      UPDATE website_links 
      SET access_count = access_count + 1, 
          last_accessed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND is_active = true
    `;
    
    await executeQuery(query, [id, userId]);
  }

  // Toggle favorite status
  static async toggleFavorite(id: number, userId: number): Promise<WebsiteLink> {
    const query = `
      UPDATE website_links 
      SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND is_active = true
    `;
    
    const result = await executeQuery(query, [id, userId]);
    
    if ((result as any).affectedRows === 0) {
      throw new Error('Link not found or access denied');
    }
    
    const updatedLink = await this.getLinkById(id);
    if (!updatedLink) {
      throw new Error('Link not found after update');
    }
    
    return updatedLink;
  }

  // Check if user owns link
  static async userOwnsLink(userId: number, linkId: number): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count FROM website_links 
      WHERE id = ? AND user_id = ? AND is_active = true
    `;
    const results = await executeQuery<{ count: number }>(query, [linkId, userId]);
    const countRow = results[0];
    if (!countRow) {
      return false;
    }
    return countRow.count > 0;
  }

  // Get links with group information
  static async getLinksWithGroups(userId: number): Promise<(WebsiteLink & { groupName: string })[]> {
    const query = `
      SELECT wl.*, g.name as group_name
      FROM website_links wl
      JOIN \`groups\` g ON wl.group_id = g.id
      WHERE wl.user_id = ? AND wl.is_active = true AND g.is_active = true
      ORDER BY g.sort_order ASC, wl.sort_order ASC, wl.created_at ASC
    `;
    
    const results = await executeQuery<WebsiteLinkRow & { group_name: string }>(query, [userId]);
    
    return results.map(row => ({
      ...mapLinkRowToLink(row),
      groupName: row.group_name
    }));
  }

  // Auto-sync admin changes to default configuration
  static async autoSyncToDefaultConfig(userId: number, updatedLink: WebsiteLink): Promise<void> {
    try {
      // Only sync if user is admin and link is a system link
      const userQuery = 'SELECT role FROM users WHERE id = ?';
      const userResult = await executeQuery<{ role: string }>(userQuery, [userId]);
      const userRow = userResult[0];
      
      if (!userRow || userRow.role !== 'admin' || !updatedLink.isSystemLink) {
        return; // Skip sync for non-admin users or non-system links
      }

      console.log(`🔄 Auto-syncing admin change to default config: ${updatedLink.name}`);

      // Import ConfigurationService to avoid circular dependency
      const { ConfigurationService } = await import('./DefaultConfiguration');
      
      // Get current active configuration
      const activeConfig = await ConfigurationService.getActiveConfiguration();
      if (!activeConfig) {
        console.warn('No active configuration found for auto-sync');
        return;
      }

      // Find and update the corresponding link in default configuration
      const configData = activeConfig.configData;
      const linkToUpdate = configData.links.find(link => link.name === updatedLink.name);
      
      if (linkToUpdate) {
        // Update all relevant link data fields
        linkToUpdate.url = updatedLink.url;
        linkToUpdate.description = updatedLink.description || undefined;
        linkToUpdate.iconUrl = updatedLink.iconUrl || undefined;
        linkToUpdate.sortOrder = updatedLink.sortOrder;
        linkToUpdate.isSystemLink = updatedLink.isSystemLink;
        linkToUpdate.isDeletable = updatedLink.isDeletable;
        
        // Update the configuration in database
        await executeQuery(
          'UPDATE default_configurations SET config_data = ?, version = version + 1, updated_at = NOW() WHERE id = ?',
          [JSON.stringify(configData), activeConfig.id]
        );
        
        console.log(`✅ Auto-synced all fields for ${updatedLink.name} to default config (new version: ${activeConfig.version + 1})`);
      }
      
    } catch (error) {
      console.error('Auto-sync to default config failed:', error);
      // Don't throw error to avoid breaking the main update operation
    }
  }
}