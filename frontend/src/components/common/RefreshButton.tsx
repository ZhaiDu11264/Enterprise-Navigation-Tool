import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  const [isLoading, setIsLoading] = useState(false);

  // Only show for regular users
  if (!user || user.role === 'admin') {
    return null;
  }

  const handleRefresh = async () => {
    setIsLoading(true);

    try {
      // Clear all caches
      cache.clear();
      persistentCache.clear();
      linkService.clearCache();
      SearchService.clearCache();

      // Call parent refresh function if provided
      if (onRefresh) {
        await onRefresh();
      }

      // Reload the page to get fresh data
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
      title="刷新数据以获取最新配置"
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
      {isLoading ? '刷新中...' : '刷新'}
    </button>
  );
};

export default RefreshButton;