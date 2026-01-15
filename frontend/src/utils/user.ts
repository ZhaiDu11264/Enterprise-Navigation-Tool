import { User } from '../types';
import { API_BASE_URL } from '../services/api';

const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');

export const normalizeAvatarUrl = (avatarUrl?: string | null): string | null => {
  if (!avatarUrl) {
    return avatarUrl ?? null;
  }
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  const normalizedPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  return `${apiOrigin}${normalizedPath}`;
};

export const normalizeUser = (user: User | null | undefined): User | null => {
  if (!user) {
    return null;
  }
  return {
    ...user,
    avatarUrl: normalizeAvatarUrl(user.avatarUrl ?? null) ?? undefined
  };
};
