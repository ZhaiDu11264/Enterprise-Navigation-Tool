import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { cache, persistentCache } from '../../utils/cache';
import { linkService } from '../../services/linkService';
import { SearchService } from '../../services/searchService';
import './ManualSyncButton.css';

interface ManualSyncButtonProps {
  className?: string;
}

const ManualSyncButton: React.FC<ManualSyncButtonProps> = ({ 
  className = ''
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [message, setMessage] = useState<string>('');

  // Translations
  const translations = {
    en: {
      syncConfig: 'Sync Config',
      syncing: 'Syncing...',
      syncSuccess: '✅ Sync successful! Page will refresh...',
      syncFailed: '❌ Sync failed',
      noUpdates: '⚠️ No configuration updates available',
      rateLimited: '⚠️ Too many requests, please try again later',
      loginExpired: '⚠️ Login expired, please log in again',
      lastSync: 'Last sync',
      syncTooltip: 'Manually sync admin configuration'
    },
    zh: {
      syncConfig: '同步配置',
      syncing: '同步中...',
      syncSuccess: '✅ 同步成功！页面即将刷新...',
      syncFailed: '❌ 同步失败',
      noUpdates: '⚠️ 暂无可用的配置更新',
      rateLimited: '⚠️ 请求过于频繁，请稍后再试',
      loginExpired: '⚠️ 登录已过期，请重新登录',
      lastSync: '上次同步',
      syncTooltip: '手动同步管理员配置'
    }
  } as const;
  
  const t = translations[language];

  // Only show for regular users
  if (!user || user.role === 'admin') {
    return null;
  }

  const handleSync = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      console.log('🔄 Starting manual sync...');
      
      // Step 1: Check for configuration updates
      console.log('📊 Checking configuration status...');
      const statusResponse = await api.get('/config/status');
      const currentStatus = statusResponse.data.data.status;
      console.log('✅ Configuration status:', currentStatus);

      // Step 2: Clear all caches
      console.log('🧹 Clearing caches...');
      cache.clear();
      persistentCache.clear();
      linkService.clearCache();
      SearchService.clearCache();

      // Step 3: Force refresh configuration
      console.log('🔄 Refreshing configuration...');
      const refreshResponse = await api.post('/config/refresh');
      console.log('✅ Configuration refresh response:', refreshResponse.data);

      // Step 4: Safe cache cleanup while maintaining user login
      console.log('📥 Clearing data cache...');
      
      // 1. Clear application memory cache
      cache.clear();
      persistentCache.clear();
      linkService.clearCache();
      SearchService.clearCache();
      
      // 2. Only clear data-related localStorage items
      try {
        const dataKeys = ['links', 'groups', 'config', 'cache_', 'search_'];
        dataKeys.forEach(keyPrefix => {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith(keyPrefix)) {
              localStorage.removeItem(key);
            }
          });
        });
        
        console.log('🧹 Data cache cleared (login state preserved)');
      } catch (error) {
        console.warn('Failed to clear data cache:', error);
      }
      
      setLastSync(new Date());
      setMessage(t.syncSuccess);
      console.log('🎉 Manual sync completed successfully');

      // 3. Refresh page after short delay
      setTimeout(() => {
        console.log('🔄 Refreshing page to show latest data');
        window.location.reload();
      }, 800);

    } catch (error: any) {
      console.error('❌ Sync failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 404) {
        setMessage(t.noUpdates);
      } else if (error.response?.status === 429) {
        setMessage(t.rateLimited);
      } else if (error.response?.status === 401) {
        setMessage(t.loginExpired);
      } else {
        setMessage(`${t.syncFailed}: ${error.response?.data?.error?.message || error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`manual-sync-button ${className}`}>
      <button
        onClick={handleSync}
        disabled={isLoading}
        className="sync-btn"
        title={t.syncTooltip}
      >
        <svg 
          className={`sync-icon ${isLoading ? 'spinning' : ''}`} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
        {isLoading ? t.syncing : t.syncConfig}
      </button>
      
      {message && (
        <div className={`sync-message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'warning'}`}>
          {message}
        </div>
      )}
      
      {lastSync && !isLoading && (
        <div className="last-sync">
          {t.lastSync}: {lastSync.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ManualSyncButton;