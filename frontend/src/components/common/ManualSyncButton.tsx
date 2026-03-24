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

const ManualSyncButton: React.FC<ManualSyncButtonProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | ''>('');

  const t = language === 'zh'
    ? {
        syncConfig: '同步配置',
        syncing: '同步中...',
        syncSuccess: '同步成功，页面即将刷新...',
        syncFailed: '同步失败',
        noUpdates: '暂无可用的配置更新',
        rateLimited: '请求过于频繁，请稍后再试',
        loginExpired: '登录已过期，请重新登录',
        lastSync: '上次同步',
        syncTooltip: '手动同步管理员配置'
      }
    : {
        syncConfig: 'Sync Config',
        syncing: 'Syncing...',
        syncSuccess: 'Sync successful. Page will refresh...',
        syncFailed: 'Sync failed',
        noUpdates: 'No configuration updates available',
        rateLimited: 'Too many requests, please try again later',
        loginExpired: 'Login expired, please log in again',
        lastSync: 'Last sync',
        syncTooltip: 'Manually sync admin configuration'
      };

  if (!user || user.role === 'admin') {
    return null;
  }

  const handleSync = async () => {
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      await api.get('/config/status');
      cache.clear();
      persistentCache.clear();
      linkService.clearCache();
      SearchService.clearCache();
      await api.post('/config/refresh');

      try {
        const dataKeys = ['links', 'groups', 'config', 'cache_', 'search_'];
        dataKeys.forEach(prefix => {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith(prefix)) {
              localStorage.removeItem(key);
            }
          });
        });
      } catch (cleanupError) {
        console.warn('Failed to clear data cache:', cleanupError);
      }

      setLastSync(new Date());
      setMessage(t.syncSuccess);
      setMessageType('success');

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error: any) {
      console.error('Sync failed:', error);
      if (error.response?.status === 404) {
        setMessage(t.noUpdates);
        setMessageType('warning');
      } else if (error.response?.status === 429) {
        setMessage(t.rateLimited);
        setMessageType('warning');
      } else if (error.response?.status === 401) {
        setMessage(t.loginExpired);
        setMessageType('warning');
      } else {
        setMessage(`${t.syncFailed}: ${error.response?.data?.error?.message || error.message}`);
        setMessageType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`manual-sync-button ${className}`}>
      <button onClick={handleSync} disabled={isLoading} className="sync-btn" title={t.syncTooltip}>
        <svg className={`sync-icon ${isLoading ? 'spinning' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
        {isLoading ? t.syncing : t.syncConfig}
      </button>

      {message && <div className={`sync-message ${messageType}`}>{message}</div>}

      {lastSync && !isLoading && (
        <div className="last-sync">{t.lastSync}: {lastSync.toLocaleTimeString()}</div>
      )}
    </div>
  );
};

export default ManualSyncButton;
