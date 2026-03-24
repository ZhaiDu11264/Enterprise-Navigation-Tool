import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { cache, persistentCache } from '../../utils/cache';
import { linkService } from '../../services/linkService';
import { SearchService } from '../../services/searchService';
import './RefreshButton.css';

interface RefreshButtonProps {
  onRefresh?: () => void;
  className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, className = '' }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    en: {
      title: 'Refresh data to get the latest configuration',
      refreshing: 'Refreshing...',
      refresh: 'Refresh'
    },
    zh: {
      title: '刷新数据以获取最新配置',
      refreshing: '刷新中...',
      refresh: '刷新'
    }
  } as const;

  const t = translations[language];

  if (!user || user.role === 'admin') {
    return null;
  }

  const handleRefresh = async () => {
    setIsLoading(true);

    try {
      cache.clear();
      persistentCache.clear();
      linkService.clearCache();
      SearchService.clearCache();

      if (onRefresh) {
        await onRefresh();
      }

      window.location.reload();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading}
      className={`refresh-btn ${className}`}
      title={t.title}
    >
      <svg
        className={`refresh-icon ${isLoading ? 'spinning' : ''}`}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
      </svg>
      {isLoading ? t.refreshing : t.refresh}
    </button>
  );
};

export default RefreshButton;
