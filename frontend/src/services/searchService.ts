import { api } from './api';
import { WebsiteLink } from '../types';
import { cache, CacheKeys, CacheTTL, cachedAsync } from '../utils/cache';

export interface SearchResponse {
  query: string;
  results: WebsiteLink[];
  totalCount: number;
  returnedCount: number;
  timestamp: string;
}

export interface RecentLinksResponse {
  recent: WebsiteLink[];
  count: number;
  timestamp: string;
}

export interface FavoriteLinksResponse {
  favorites: WebsiteLink[];
  count: number;
  timestamp: string;
}

// Cache search results for better performance
const cachedSearchLinks = cachedAsync(
  async (query: string, limit?: number): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await api.get<SearchResponse>(`/search?${params.toString()}`);
    return response.data;
  },
  (query: string, limit?: number) => CacheKeys.SEARCH_RESULTS(`${query}_${limit || 'all'}`),
  CacheTTL.SHORT // Cache search results for 1 minute
);

export class SearchService {
  /**
   * Search for links by query (cached)
   */
  static async searchLinks(query: string, limit?: number): Promise<SearchResponse> {
    // Don't cache very short queries or empty queries
    if (query.length < 2) {
      const params = new URLSearchParams();
      params.append('q', query);
      if (limit) {
        params.append('limit', limit.toString());
      }

      const response = await api.get<SearchResponse>(`/search?${params.toString()}`);
      return response.data;
    }

    return cachedSearchLinks(query, limit);
  }

  /**
   * Get recent links (cached)
   */
  static async getRecentLinks(limit?: number): Promise<RecentLinksResponse> {
    const cacheKey = `${CacheKeys.RECENT_LINKS}_${limit || 'all'}`;
    
    // Try cache first
    const cached = cache.get<RecentLinksResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const params = new URLSearchParams();
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await api.get<RecentLinksResponse>(`/search/recent?${params.toString()}`);
    
    // Cache the result
    cache.set(cacheKey, response.data, CacheTTL.SHORT);
    
    return response.data;
  }

  /**
   * Get favorite links (cached)
   */
  static async getFavoriteLinks(): Promise<FavoriteLinksResponse> {
    const cacheKey = CacheKeys.FAVORITE_LINKS;
    
    // Try cache first
    const cached = cache.get<FavoriteLinksResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const response = await api.get<FavoriteLinksResponse>('/search/favorites');
    
    // Cache the result
    cache.set(cacheKey, response.data, CacheTTL.MEDIUM);
    
    return response.data;
  }

  /**
   * Clear search-related caches
   */
  static clearCache(): void {
    // Clear all search result caches by iterating through cache keys
    try {
      const stats = cache.getStats();
      const keysToDelete: string[] = [];
      
      stats.keys.forEach(key => {
        if (key.startsWith('search_') || 
            key.includes('recent') || 
            key.includes('favorite') ||
            key.includes('suggestions_')) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => cache.delete(key));
      
      console.log(`SearchService: Cleared ${keysToDelete.length} cache entries`);
    } catch (error) {
      console.warn('Failed to clear search cache:', error);
      // Fallback: clear entire cache if selective clearing fails
      cache.clear();
    }
  }

  /**
   * Prefetch popular searches for better performance
   */
  static async prefetchPopularSearches(queries: string[]): Promise<void> {
    try {
      // Prefetch in background without waiting
      queries.forEach(query => {
        if (query.length >= 2) {
          this.searchLinks(query, 10); // Prefetch top 10 results
        }
      });
    } catch (error) {
      console.warn('Failed to prefetch searches:', error);
    }
  }

  /**
   * Get search suggestions based on query
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];

    const cacheKey = `suggestions_${query}`;
    
    // Try cache first
    const cached = cache.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // This would typically call a suggestions endpoint
      // For now, we'll derive suggestions from search results
      const searchResponse = await this.searchLinks(query, 5);
      const suggestions = searchResponse.results
        .map(link => link.name)
        .filter(name => name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      // Cache suggestions for a short time
      cache.set(cacheKey, suggestions, CacheTTL.SHORT);
      
      return suggestions;
    } catch (error) {
      console.warn('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Debounced search function for real-time suggestions
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttled search function to limit API calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}