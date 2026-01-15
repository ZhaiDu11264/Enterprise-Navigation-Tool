import { executeQuery } from '../config/database';
import { Group, GroupRow, CreateGroupRequest } from './interfaces';

// Convert database row to Group interface
const mapGroupRowToGroup = (row: GroupRow): Group => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  description: row.description || undefined,
  sortOrder: row.sort_order,
  isActive: row.is_active,
  isSystemGroup: row.is_system_group,
  isDeletable: row.is_deletable,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export class GroupService {
  // Create a new group
  static async createGroup(userId: number, groupData: CreateGroupRequest & { isSystemGroup?: boolean; isDeletable?: boolean }): Promise<Group> {
    // Get the next sort order for this user
    const maxSortQuery = 'SELECT COALESCE(MAX(sort_order), 0) as maxSort FROM `groups` WHERE user_id = ? AND is_active = true';
    const maxSortResult = await executeQuery<{ maxSort: number }>(maxSortQuery, [userId]);
    const maxSortRow = maxSortResult[0];
    if (!maxSortRow) {
      throw new Error('Failed to get max sort order');
    }
    const nextSortOrder = groupData.sortOrder ?? (maxSortRow.maxSort + 1);
    
    const query = `
      INSERT INTO \`groups\` (user_id, name, description, sort_order, is_system_group, is_deletable)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery<{ insertId: number }>(query, [
      userId,
      groupData.name,
      groupData.description || null,
      nextSortOrder,
      groupData.isSystemGroup || false,
      groupData.isDeletable !== undefined ? groupData.isDeletable : true
    ]);
    
    // Get the created group
    const createdGroup = await this.getGroupById((result as any).insertId);
    if (!createdGroup) {
      throw new Error('Failed to create group');
    }
    
    return createdGroup;
  }

  // Get group by ID
  static async getGroupById(id: number): Promise<Group | null> {
    const query = 'SELECT * FROM `groups` WHERE id = ? AND is_active = true';
    const results = await executeQuery<GroupRow>(query, [id]);
    
    if (results.length === 0) {
      return null;
    }
    
    const groupRow = results[0];
    if (!groupRow) {
      return null;
    }
    
    return mapGroupRowToGroup(groupRow);
  }

  // Get all groups for a user
  static async getUserGroups(userId: number): Promise<Group[]> {
    const query = `
      SELECT * FROM \`groups\` 
      WHERE user_id = ? AND is_active = true 
      ORDER BY sort_order ASC, created_at ASC
    `;
    const results = await executeQuery<GroupRow>(query, [userId]);
    
    return results.map(mapGroupRowToGroup);
  }

  // Update group
  static async updateGroup(id: number, userId: number, updates: Partial<Group>): Promise<Group> {
    const allowedFields = ['name', 'description', 'sortOrder'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'sortOrder') {
          updateFields.push('sort_order = ?');
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
      UPDATE \`groups\` 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND is_active = true
    `;
    
    const result = await executeQuery(query, updateValues);
    
    if ((result as any).affectedRows === 0) {
      throw new Error('Group not found or access denied');
    }
    
    const updatedGroup = await this.getGroupById(id);
    if (!updatedGroup) {
      throw new Error('Group not found after update');
    }
    
    return updatedGroup;
  }

  // Delete group (soft delete)
  static async deleteGroup(id: number, userId: number): Promise<void> {
    // First check if this is a system group that cannot be deleted
    const group = await this.getGroupById(id);
    if (!group) {
      throw new Error('Group not found');
    }
    
    if (!group.isDeletable) {
      throw new Error('Cannot delete system group');
    }
    
    // Delete all active links in this group (soft delete)
    const deleteLinksQuery = `
      UPDATE website_links 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE group_id = ? AND is_active = true
    `;
    await executeQuery(deleteLinksQuery, [id]);
    
    // Now soft delete the group
    const query = `
      UPDATE \`groups\` 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND is_active = true
    `;
    
    const result = await executeQuery(query, [id, userId]);
    
    if ((result as any).affectedRows === 0) {
      throw new Error('Group not found or access denied');
    }
  }

  // Reorder groups for a user
  static async reorderGroups(userId: number, groupOrders: { id: number; sortOrder: number }[]): Promise<void> {
    // Start a transaction-like operation by updating each group
    for (const { id, sortOrder } of groupOrders) {
      const query = `
        UPDATE \`groups\` 
        SET sort_order = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ? AND is_active = true
      `;
      
      await executeQuery(query, [sortOrder, id, userId]);
    }
  }

  // Get group by name for a user
  static async getGroupByName(userId: number, name: string): Promise<Group | null> {
    const query = `
      SELECT * FROM \`groups\` 
      WHERE user_id = ? AND name = ? AND is_active = true
    `;
    const results = await executeQuery<GroupRow>(query, [userId, name]);
    
    if (results.length === 0) {
      return null;
    }
    
    const groupRow = results[0];
    if (!groupRow) {
      return null;
    }
    
    return mapGroupRowToGroup(groupRow);
  }

  // Check if user owns group
  static async userOwnsGroup(userId: number, groupId: number): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count FROM \`groups\` 
      WHERE id = ? AND user_id = ? AND is_active = true
    `;
    const results = await executeQuery<{ count: number }>(query, [groupId, userId]);
    const countRow = results[0];
    if (!countRow) {
      return false;
    }
    return countRow.count > 0;
  }

  // Get group with link count
  static async getGroupsWithLinkCount(userId: number): Promise<(Group & { linkCount: number })[]> {
    const query = `
      SELECT g.*, 
             COALESCE(COUNT(wl.id), 0) as link_count
      FROM \`groups\` g
      LEFT JOIN website_links wl ON g.id = wl.group_id AND wl.is_active = true
      WHERE g.user_id = ? AND g.is_active = true
      GROUP BY g.id
      ORDER BY g.sort_order ASC, g.created_at ASC
    `;
    
    const results = await executeQuery<GroupRow & { link_count: number }>(query, [userId]);
    
    return results.map(row => ({
      ...mapGroupRowToGroup(row),
      linkCount: row.link_count
    }));
  }
}
