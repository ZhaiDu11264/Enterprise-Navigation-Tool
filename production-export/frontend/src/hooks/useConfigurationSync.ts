import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { cache, persistentCache } from '../utils/cache';
import { linkService } from '../services/linkService';
import { SearchService } from '../services/searchService';

interface ConfigurationStatus {
  lastUpdated: string;
  version: number;
  isActive: boolean;
}

interface ConfigurationSyncHook {
  isChecking: boolean;
  lastSync: Date | null;
  hasUpdates: boolean;
  checkForUpdates: () => Promise<void>;
  applyUpdates: () => Promise<void>;
}

export const useConfigurationSync = (
  enabled: boolean = true,
  intervalMs: number = process.env.NODE_ENV === 'development' ? 300000 : 30000 // 5 minutes in dev, 30 seconds in prod
): ConfigurationSyncHook => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [lastKnownVersion, setLastKnownVersion] = useState<number | null>(null);

  const checkForUpdates = useCallback(async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);
      
      // Check current configuration status
      const response = await api.get<{
        success: boolean;
        data: { status: ConfigurationStatus };
      }>('/config/status');
      
      const currentStatus = response.data.data.status;
      
      // Compare with last known version
      if (lastKnownVersion !== null && currentStatus.version > lastKnownVersion) {
        setHasUpdates(true);
        console.log('Configuration update detected:', {
          oldVersion: lastKnownVersion,
          newVersion: currentStatus.version
        });
      }
      
      setLastKnownVersion(currentStatus.version);
      setLastSync(new Date());
      
    } catch (error) {
      // Silently fail in development to avoid spam
      if (process.env.NODE_ENV !== 'development') {
        console.warn('Failed to check for configuration updates:', error);
      }
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, lastKnownVersion]);

  const applyUpdates = useCallback(async () => {
    try {
      setIsChecking(true);
      
      // Clear all caches to force fresh data load
      cache.clear();
      persistentCache.clear();
      linkService.clearCache();
      SearchService.clearCache();
      
      // Force reload of configuration data
      await linkService.getLinks();
      
      setHasUpdates(false);
      setLastSync(new Date());
      
      console.log('Configuration updates applied successfully');
      
    } catch (error) {
      console.error('Failed to apply configuration updates:', error);
      throw error;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Set up polling interval - disabled in development
  useEffect(() => {
    if (!enabled) return;
    
    // Disable in development environment to prevent rate limiting issues
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Configuration sync disabled in development mode');
      return;
    }

    // Initial check
    checkForUpdates();

    // Set up interval
    const interval = setInterval(checkForUpdates, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, intervalMs, checkForUpdates]);

  return {
    isChecking,
    lastSync,
    hasUpdates,
    checkForUpdates,
    applyUpdates
  };
};