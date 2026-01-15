import { cache, persistentCache } from '../utils/cache';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Cache Cleanup on User Switch', () => {
  beforeEach(() => {
    localStorage.clear();
    cache.clear();
    persistentCache.clear();
  });

  test('should clear memory cache', () => {
    // Set some cache data
    cache.set('test_links', ['link1', 'link2']);
    cache.set('test_groups', ['group1', 'group2']);
    
    expect(cache.get('test_links')).toEqual(['link1', 'link2']);
    expect(cache.get('test_groups')).toEqual(['group1', 'group2']);

    // Clear cache
    cache.clear();

    // Verify caches are cleared
    expect(cache.get('test_links')).toBeNull();
    expect(cache.get('test_groups')).toBeNull();
  });

  test('should clear persistent cache', () => {
    // Set some persistent cache data
    persistentCache.set('user_profile', { id: 1, name: 'User A' });
    persistentCache.set('recent_links', ['recent1', 'recent2']);
    
    expect(persistentCache.get('user_profile')).toEqual({ id: 1, name: 'User A' });
    expect(persistentCache.get('recent_links')).toEqual(['recent1', 'recent2']);

    // Clear persistent cache
    persistentCache.clear();

    // Verify persistent cache is cleared
    expect(persistentCache.get('user_profile')).toBeNull();
    expect(persistentCache.get('recent_links')).toBeNull();
  });

  test('should isolate user-specific cache data', () => {
    const userId1 = 1;
    const userId2 = 2;

    // Set data for user 1
    persistentCache.setForUser('links', ['user1_link1', 'user1_link2'], userId1);
    persistentCache.setForUser('profile', { id: userId1, name: 'User 1' }, userId1);

    // Set data for user 2
    persistentCache.setForUser('links', ['user2_link1', 'user2_link2'], userId2);
    persistentCache.setForUser('profile', { id: userId2, name: 'User 2' }, userId2);

    // Verify user isolation
    expect(persistentCache.getForUser('links', userId1)).toEqual(['user1_link1', 'user1_link2']);
    expect(persistentCache.getForUser('links', userId2)).toEqual(['user2_link1', 'user2_link2']);
    
    expect(persistentCache.getForUser('profile', userId1)).toEqual({ id: userId1, name: 'User 1' });
    expect(persistentCache.getForUser('profile', userId2)).toEqual({ id: userId2, name: 'User 2' });

    // Clear user 1's cache
    persistentCache.clearForUser(userId1);

    // Verify user 1's data is cleared but user 2's remains
    expect(persistentCache.getForUser('links', userId1)).toBeNull();
    expect(persistentCache.getForUser('profile', userId1)).toBeNull();
    
    expect(persistentCache.getForUser('links', userId2)).toEqual(['user2_link1', 'user2_link2']);
    expect(persistentCache.getForUser('profile', userId2)).toEqual({ id: userId2, name: 'User 2' });
  });

  test('should handle localStorage cleanup', () => {
    // Set some cache data
    cache.set('api_data', { some: 'data' });
    persistentCache.set('user_settings', { theme: 'dark' });
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));

    // Simulate cleanup
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    cache.clear();
    persistentCache.clear();

    // Verify everything is cleared
    expect(cache.get('api_data')).toBeNull();
    expect(persistentCache.get('user_settings')).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('should clear cache before login to prevent data mixing', () => {
    // Set some existing cache data (simulating previous user)
    cache.set('old_links', ['old_link1', 'old_link2']);
    persistentCache.set('old_profile', { id: 999, name: 'Old User' });

    expect(cache.get('old_links')).toEqual(['old_link1', 'old_link2']);
    expect(persistentCache.get('old_profile')).toEqual({ id: 999, name: 'Old User' });

    // Simulate cache clearing that should happen in login
    cache.clear();
    persistentCache.clear();

    // Verify old cache data is cleared
    expect(cache.get('old_links')).toBeNull();
    expect(persistentCache.get('old_profile')).toBeNull();
  });
});