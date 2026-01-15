import { api } from './api';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

const normalizeGroup = (group: Group): Group => ({
  ...group,
  id: Number(group.id),
  userId: Number(group.userId),
  sortOrder: Number(group.sortOrder),
  isActive: Boolean(group.isActive),
  isSystemGroup: Boolean(group.isSystemGroup),
  isDeletable: Boolean(group.isDeletable)
});

export const groupService = {
  // Get all groups for the current user
  async getGroups(): Promise<Group[]> {
    const response = await api.get<ApiResponse<{ groups: Group[] }>>('/groups');
    return response.data.data.groups.map(normalizeGroup);
  },

  // Create a new group
  async createGroup(groupData: CreateGroupRequest): Promise<Group> {
    const response = await api.post<ApiResponse<{ group: Group }>>('/groups', groupData);
    return normalizeGroup(response.data.data.group);
  },

  // Update an existing group
  async updateGroup(id: number, updates: UpdateGroupRequest): Promise<Group> {
    const response = await api.put<ApiResponse<{ group: Group }>>(`/groups/${id}`, updates);
    return normalizeGroup(response.data.data.group);
  },

  // Delete a group
  async deleteGroup(id: number): Promise<void> {
    await api.delete(`/groups/${id}`);
  },

  // Reorder groups
  async reorderGroups(groupOrders: { id: number; sortOrder: number }[]): Promise<void> {
    await api.put('/reorder/groups', { groupOrders });
  }
};
