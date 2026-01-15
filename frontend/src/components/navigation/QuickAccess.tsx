import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WebsiteLink } from '../../types';
import { SearchService } from '../../services/searchService';
import { LinkCard } from './LinkCard';
import './QuickAccess.css';

interface QuickAccessProps {
  onLinkClick: (link: WebsiteLink) => void;
  onEditLink?: (link: WebsiteLink) => void;
  onDeleteLink?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  groups?: Array<{ id: number; name: string }>;
  className?: string;
}

export function QuickAccess({
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  groups = [],
  className = ""
}: QuickAccessProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      title: 'Quick Access',
      loading: 'Loading your quick access links...',
      loadFailed: 'Failed to load quick access data',
      retry: 'Try Again',
      refresh: 'Refresh',
      retryTitle: 'Retry',
      recent: (count: number) => `Recent (${count})`,
      favorites: (count: number) => `Favorites (${count})`,
      recentInfo: 'Your recently accessed links',
      favoritesInfo: 'Your favorite links for quick access',
      lastUsed: (date: string) => `Last used: ${date}`,
      visit: 'visit',
      visits: 'visits',
      noRecentTitle: 'No recent links',
      noRecentHint: 'Links you visit will appear here for quick access',
      noFavoritesTitle: 'No favorite links',
      noFavoritesHint: 'Mark links as favorites to see them here for quick access',
      emptyTitle: 'No quick access links',
      emptyHint: 'Start browsing your links or mark some as favorites to see them here'
    },
    zh: {
      title: '\u5feb\u901f\u8bbf\u95ee',
      loading: '\u6b63\u5728\u52a0\u8f7d\u5feb\u901f\u8bbf\u95ee\u94fe\u63a5...',
      loadFailed: '\u52a0\u8f7d\u5feb\u901f\u8bbf\u95ee\u5931\u8d25',
      retry: '\u91cd\u8bd5',
      refresh: '\u5237\u65b0',
      retryTitle: '\u91cd\u8bd5',
      recent: (count: number) => `\u6700\u8fd1(${count})`,
      favorites: (count: number) => `\u6536\u85cf(${count})`,
      recentInfo: '\u6700\u8fd1\u8bbf\u95ee\u7684\u94fe\u63a5',
      favoritesInfo: '\u4f60\u7684\u6536\u85cf\u94fe\u63a5',
      lastUsed: (date: string) => `\u4e0a\u6b21\u4f7f\u7528\uff1a${date}`,
      visit: '\u6b21\u8bbf\u95ee',
      visits: '\u6b21\u8bbf\u95ee',
      noRecentTitle: '\u6682\u65e0\u6700\u8fd1\u94fe\u63a5',
      noRecentHint: '\u4f60\u8bbf\u95ee\u7684\u94fe\u63a5\u4f1a\u663e\u793a\u5728\u8fd9\u91cc',
      noFavoritesTitle: '\u6682\u65e0\u6536\u85cf\u94fe\u63a5',
      noFavoritesHint: '\u6807\u8bb0\u6536\u85cf\u4ee5\u4fbf\u5feb\u901f\u8bbf\u95ee',
      emptyTitle: '\u6682\u65e0\u5feb\u901f\u8bbf\u95ee\u94fe\u63a5',
      emptyHint: '\u6d4f\u89c8\u94fe\u63a5\u6216\u6dfb\u52a0\u6536\u85cf\u540e\u5c06\u663e\u793a\u5728\u8fd9\u91cc'
    }
  } as const;
  const t = translations[language];

  const [recentLinks, setRecentLinks] = useState<WebsiteLink[]>([]);
  const [favoriteLinks, setFavoriteLinks] = useState<WebsiteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');

  const loadQuickAccessData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [recentResponse, favoritesResponse] = await Promise.all([
        SearchService.getRecentLinks(8),
        SearchService.getFavoriteLinks()
      ]);

      setRecentLinks(recentResponse.recent);
      setFavoriteLinks(favoritesResponse.favorites);
    } catch (err) {
      console.error('Failed to load quick access data:', err);
      setError(t.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [t.loadFailed]);

  useEffect(() => {
    loadQuickAccessData();
  }, [loadQuickAccessData]);

  const handleRefresh = () => {
    loadQuickAccessData();
  };

  const handleLinkClick = (link: WebsiteLink) => {
    onLinkClick(link);
    setTimeout(() => {
      loadQuickAccessData();
    }, 100);
  };

  const handleToggleFavorite = (link: WebsiteLink) => {
    onToggleFavorite?.(link);
    setTimeout(() => {
      loadQuickAccessData();
    }, 100);
  };

  if (loading) {
    return (
      <div className={`quick-access loading ${className}`}>
        <div className="quick-access-header">
          <h3>{t.title}</h3>
        </div>
        <div className="quick-access-loading">
          <div className="spinner" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`quick-access error ${className}`}>
        <div className="quick-access-header">
          <h3>{t.title}</h3>
          <button onClick={handleRefresh} className="refresh-btn" title={t.retryTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>
        <div className="quick-access-error">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-btn">{t.retry}</button>
        </div>
      </div>
    );
  }

  const hasRecentLinks = recentLinks.length > 0;
  const hasFavoriteLinks = favoriteLinks.length > 0;
  const currentTab = !hasRecentLinks && hasFavoriteLinks ? 'favorites' : activeTab;

  return (
    <div className={`quick-access ${className}`}>
      <div className="quick-access-header">
        <h3>{t.title}</h3>
        <div className="quick-access-actions">
          <button onClick={handleRefresh} className="refresh-btn" title={t.refresh}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>
      </div>

      {(hasRecentLinks || hasFavoriteLinks) && (
        <div className="quick-access-tabs">
          {hasRecentLinks && (
            <button
              className={`tab-btn ${currentTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
              {t.recent(recentLinks.length)}
            </button>
          )}

          {hasFavoriteLinks && (
            <button
              className={`tab-btn ${currentTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              {t.favorites(favoriteLinks.length)}
            </button>
          )}
        </div>
      )}

      <div className="quick-access-content">
        {currentTab === 'recent' && (
          <div className="recent-links-section">
            {hasRecentLinks ? (
              <>
                <div className="section-info">
                  <p>{t.recentInfo}</p>
                </div>
                <div className="links-grid">
                  {recentLinks.map((link) => (
                    <div key={link.id} className="quick-access-item">
                      <LinkCard
                        link={link}
                        onClick={handleLinkClick}
                        onEdit={onEditLink}
                        onDelete={onDeleteLink}
                        onToggleFavorite={handleToggleFavorite}
                        showGroupName={true}
                        groups={groups}
                      />
                      <div className="access-info">
                        {link.lastAccessedAt && (
                          <span className="last-accessed">
                            {t.lastUsed(new Date(link.lastAccessedAt).toLocaleDateString())}
                          </span>
                        )}
                        <span className="access-count">
                          {link.accessCount} {link.accessCount === 1 ? t.visit : t.visits}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                </svg>
                <h4>{t.noRecentTitle}</h4>
                <p>{t.noRecentHint}</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'favorites' && (
          <div className="favorites-section">
            {hasFavoriteLinks ? (
              <>
                <div className="section-info">
                  <p>{t.favoritesInfo}</p>
                </div>
                <div className="links-grid">
                  {favoriteLinks.map((link) => (
                    <div key={link.id} className="quick-access-item">
                      <LinkCard
                        link={link}
                        onClick={handleLinkClick}
                        onEdit={onEditLink}
                        onDelete={onDeleteLink}
                        onToggleFavorite={handleToggleFavorite}
                        showGroupName={true}
                        groups={groups}
                      />
                      <div className="access-info">
                        {link.accessCount > 0 && (
                          <span className="access-count">
                            {link.accessCount} {link.accessCount === 1 ? t.visit : t.visits}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <h4>{t.noFavoritesTitle}</h4>
                <p>{t.noFavoritesHint}</p>
              </div>
            )}
          </div>
        )}

        {!hasRecentLinks && !hasFavoriteLinks && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
            <h4>{t.emptyTitle}</h4>
            <p>{t.emptyHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
