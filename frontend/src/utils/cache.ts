// Simple in-memory cache with TTL support
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Cache with localStorage persistence
class PersistentCache {
  private prefix = 'nav_cache_';
  private defaultTTL = 2 * 60 * 60 * 1000; // 2 hours (reduced from 24 hours to minimize cache leakage)

  private getStorageKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  // Get user-specific storage key
  private getUserStorageKey(key: string, userId?: number): string {
    if (userId) {
      return `${this.prefix}user_${userId}_${key}`;
    }
    return this.getStorageKey(key);
  }

  // Set with optional user isolation
  setForUser<T>(key: string, data: T, userId?: number, ttl?: number): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl ?? this.defaultTTL
      };
      localStorage.setItem(this.getUserStorageKey(key, userId), JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  // Get with optional user isolation
  getForUser<T>(key: string, userId?: number): T | null {
    try {
      const item = localStorage.getItem(this.getUserStorageKey(key, userId));
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();
      
      if (now - entry.timestamp > entry.ttl) {
        this.deleteForUser(key, userId);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  // Delete with optional user isolation
  deleteForUser(key: string, userId?: number): boolean {
    try {
      localStorage.removeItem(this.getUserStorageKey(key, userId));
      return true;
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
      return false;
    }
  }

  // Clear all caches for a specific user
  clearForUser(userId: number): void {
    try {
      const keys = Object.keys(localStorage);
      const userPrefix = `${this.prefix}user_${userId}_`;
      keys.forEach(key => {
        if (key.startsWith(userPrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear user-specific localStorage:', error);
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl ?? this.defaultTTL
      };
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getStorageKey(key));
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();
      
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    try {
      localStorage.removeItem(this.getStorageKey(key));
      return true;
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
      return false;
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  // Clean up expired entries
  cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(storageKey => {
        if (storageKey.startsWith(this.prefix)) {
          try {
            const item = localStorage.getItem(storageKey);
            if (item) {
              const entry: CacheEntry<any> = JSON.parse(item);
              if (now - entry.timestamp > entry.ttl) {
                localStorage.removeItem(storageKey);
              }
            }
          } catch (error) {
            // Remove corrupted entries
            localStorage.removeItem(storageKey);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup localStorage:', error);
    }
  }
}

export const persistentCache = new PersistentCache();

// Cleanup persistent cache on page load
persistentCache.cleanup();

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = fn(...args);
    cache.set(key, result, ttl);
    
    return result;
  }) as T;
}

// Async cache decorator
export function cachedAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  const pendingRequests = new Map<string, Promise<any>>();

  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Check if request is already pending
    const pending = pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Execute function and cache result
    const promise = fn(...args).then(result => {
      cache.set(key, result, ttl);
      pendingRequests.delete(key);
      return result;
    }).catch(error => {
      pendingRequests.delete(key);
      throw error;
    });

    pendingRequests.set(key, promise);
    return promise;
  }) as T;
}

// Cache keys for common operations
export const CacheKeys = {
  LINKS: 'links',
  GROUPS: 'groups',
  RECENT_LINKS: 'recent_links',
  FAVORITE_LINKS: 'favorite_links',
  SEARCH_RESULTS: (query: string) => `search_${query}`,
  USER_PROFILE: 'user_profile',
  FAVICON: (url: string) => `favicon_${url}`,
  CONFIG: 'default_config'
} as const;

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  VERY_LONG: 24 * 60 * 60 * 1000  // 24 hours
} as const;