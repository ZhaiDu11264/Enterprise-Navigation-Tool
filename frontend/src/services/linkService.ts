import { api } from './api';
import { WebsiteLink, CreateLinkRequest, UpdateLinkRequest, LinkOrder } from '../types';
import { cache, CacheKeys, CacheTTL, cachedAsync } from '../utils/cache';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

const normalizeLink = (link: WebsiteLink): WebsiteLink => ({
  ...link,
  id: Number(link.id),
  userId: Number(link.userId),
  groupId: Number(link.groupId),
  sortOrder: Number(link.sortOrder),
  accessCount: Number(link.accessCount),
  isActive: Boolean(link.isActive),
  isFavorite: Boolean(link.isFavorite),
  isSystemLink: Boolean(link.isSystemLink),
  isDeletable: Boolean(link.isDeletable)
});

// Cached API functions
const cachedGetLinks = cachedAsync(
  async (): Promise<WebsiteLink[]> => {
    const response = await api.get<ApiResponse<{ links: WebsiteLink[] }>>('/links');
    return response.data.data.links.map(normalizeLink);
  },
  () => CacheKeys.LINKS,
  CacheTTL.MEDIUM
);

const cachedGetRecentLinks = cachedAsync(
  async (): Promise<WebsiteLink[]> => {
    const response = await api.get<ApiResponse<{ links: WebsiteLink[] }>>('/links/recent');
    return response.data.data.links.map(normalizeLink);
  },
  () => CacheKeys.RECENT_LINKS,
  CacheTTL.SHORT
);

const cachedGetFavoriteLinks = cachedAsync(
  async (): Promise<WebsiteLink[]> => {
    const response = await api.get<ApiResponse<{ links: WebsiteLink[] }>>('/links/favorites');
    return response.data.data.links.map(normalizeLink);
  },
  () => CacheKeys.FAVORITE_LINKS,
  CacheTTL.MEDIUM
);

export const linkService = {
  // Get all links for the current user (cached)
  async getLinks(): Promise<WebsiteLink[]> {
    return cachedGetLinks();
  },

  // Create a new link
  async createLink(linkData: CreateLinkRequest): Promise<WebsiteLink> {
    const response = await api.post<ApiResponse<{ link: WebsiteLink }>>('/links', linkData);
    
    // Invalidate related caches
    cache.delete(CacheKeys.LINKS);
    cache.delete(CacheKeys.RECENT_LINKS);
    
    return normalizeLink(response.data.data.link);
  },

  // Update an existing link
  async updateLink(id: number, updates: UpdateLinkRequest): Promise<WebsiteLink> {
    const response = await api.put<ApiResponse<{ link: WebsiteLink }>>(`/links/${id}`, updates);
    
    // Invalidate related caches
    cache.delete(CacheKeys.LINKS);
    cache.delete(CacheKeys.RECENT_LINKS);
    cache.delete(CacheKeys.FAVORITE_LINKS);
    
    return normalizeLink(response.data.data.link);
  },

  // Delete a link
  async deleteLink(id: number): Promise<void> {
    await api.delete(`/links/${id}`);
    
    // Invalidate related caches
    cache.delete(CacheKeys.LINKS);
    cache.delete(CacheKeys.RECENT_LINKS);
    cache.delete(CacheKeys.FAVORITE_LINKS);
  },

  // Toggle favorite status
  async toggleFavorite(id: number, isFavorite: boolean): Promise<WebsiteLink> {
    const response = await api.put<ApiResponse<{ link: WebsiteLink }>>(`/links/${id}`, { isFavorite });
    
    // Invalidate related caches
    cache.delete(CacheKeys.LINKS);
    cache.delete(CacheKeys.FAVORITE_LINKS);
    
    return normalizeLink(response.data.data.link);
  },

  // Reorder links
  async reorderLinks(linkOrders: LinkOrder[]): Promise<void> {
    await api.put('/reorder/links', { linkOrders });
    
    // Invalidate links cache
    cache.delete(CacheKeys.LINKS);
  },

  // Get recent links (cached)
  async getRecentLinks(): Promise<WebsiteLink[]> {
    return cachedGetRecentLinks();
  },

  // Get favorite links (cached)
  async getFavoriteLinks(): Promise<WebsiteLink[]> {
    return cachedGetFavoriteLinks();
  },

  // Track link access
  async trackAccess(id: number): Promise<void> {
    await api.post(`/links/${id}/access`);
    
    // Invalidate recent links cache
    cache.delete(CacheKeys.RECENT_LINKS);
  },

  // Clear all link-related caches
  clearCache(): void {
    cache.delete(CacheKeys.LINKS);
    cache.delete(CacheKeys.RECENT_LINKS);
    cache.delete(CacheKeys.FAVORITE_LINKS);
  },

  // Prefetch links for better performance
  async prefetchLinks(): Promise<void> {
    try {
      // Prefetch in background without waiting
      Promise.all([
        this.getLinks(),
        this.getRecentLinks(),
        this.getFavoriteLinks()
      ]);
    } catch (error) {
      console.warn('Failed to prefetch links:', error);
    }
  }
};
