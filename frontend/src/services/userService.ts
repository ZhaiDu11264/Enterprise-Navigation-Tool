import apiClient, { api } from './api';
import { User } from '../types';
import { normalizeAvatarUrl, normalizeUser } from '../utils/user';

interface ProfileResponse {
  user: User;
  message?: string;
}

export const userService = {
  async updateProfile(payload: { displayName?: string; avatarUrl?: string | null }): Promise<User> {
    const response = await api.put<ProfileResponse>('/users/profile', payload);
    const responseData = response.data as any;
    return normalizeUser(responseData?.user || responseData?.data?.user || responseData?.data) as User;
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string; user?: User }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/users/avatar', formData);
    const responseData = response.data as any;
    const avatarUrl = normalizeAvatarUrl(responseData.avatarUrl || responseData?.data?.avatarUrl);
    const user = normalizeUser(responseData.user || responseData?.data?.user) ?? undefined;
    return {
      avatarUrl: avatarUrl || '',
      user
    };
  }
};
