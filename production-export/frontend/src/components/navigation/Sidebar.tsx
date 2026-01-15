import React, { useEffect, useState } from 'react';
import { WebsiteLink } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  mostVisited: WebsiteLink[];
  favorites: WebsiteLink[];
  onLinkClick: (link: WebsiteLink) => void;
  onToggleFavorite: (linkId: number) => void;
  labels: {
    mostVisited: string;
    favorites: string;
    noMostVisited: string;
    noFavorites: string;
    visits: string;
  };
}

export function Sidebar({
  mostVisited,
  favorites,
  onLinkClick,
  onToggleFavorite,
  labels
}: SidebarProps) {
  const pageSize = 10;
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'mostVisited' | 'favorites' | null>(null);
  const [mostVisitedPage, setMostVisitedPage] = useState(0);
  const [favoritesPage, setFavoritesPage] = useState(0);

  const mostVisitedStart = mostVisitedPage * pageSize;
  const favoritesStart = favoritesPage * pageSize;
  const visibleMostVisited = mostVisited.slice(mostVisitedStart, mostVisitedStart + pageSize);
  const visibleFavorites = favorites.slice(favoritesStart, favoritesStart + pageSize);

  useEffect(() => {
    setMostVisitedPage(0);
  }, [mostVisited.length]);

  useEffect(() => {
    setFavoritesPage(0);
  }, [favorites.length]);

  useEffect(() => {
    if (expandedSection !== 'mostVisited') {
      setMostVisitedPage(0);
    }
    if (expandedSection !== 'favorites') {
      setFavoritesPage(0);
    }
  }, [expandedSection]);

  const renderLinkItem = (link: WebsiteLink) => (
    <div 
      key={link.id} 
      className="sidebar-link-item"
      onClick={() => onLinkClick(link)}
      title={link.name}
    >
      <div className="sidebar-link-icon">
        {link.iconUrl ? (
          <img src={link.iconUrl} alt={link.name} />
        ) : (
          <span className="sidebar-link-placeholder">🔗</span>
        )}
      </div>
      <div className="sidebar-link-info">
        <div className="sidebar-link-name">{link.name}</div>
      </div>
      {link.isFavorite && <span className="sidebar-favorite-badge">❤️</span>}
    </div>
  );

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-inner">
        <button 
          className="sidebar-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? '收起' : '展开'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            {isExpanded ? (
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            ) : (
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            )}
          </svg>
        </button>

        <section className="sidebar-section">
          <button 
            className={`sidebar-section-header ${expandedSection === 'mostVisited' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'mostVisited' ? null : 'mostVisited')}
            title={labels.mostVisited}
          >
            <svg className="sidebar-section-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
            {isExpanded && <span className="sidebar-section-title">{labels.mostVisited}</span>}
            {isExpanded && mostVisited.length > 0 && (
              <span className="sidebar-count">{mostVisited.length}</span>
            )}
          </button>
          <div className={`sidebar-section-content ${expandedSection === 'mostVisited' ? 'show' : ''}`}>
            {mostVisited.length > 0 ? (
              <>
                {visibleMostVisited.map(link => renderLinkItem(link))}
                {(mostVisitedPage > 0 || mostVisitedStart + pageSize < mostVisited.length) && (
                  <div className="sidebar-pager">
                    <button
                      type="button"
                      className="sidebar-more-item"
                      onClick={() => setMostVisitedPage((page) => Math.max(page - 1, 0))}
                      title="Previous"
                      disabled={mostVisitedPage === 0}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      className="sidebar-more-item"
                      onClick={() => setMostVisitedPage((page) => page + 1)}
                      title="Next"
                      disabled={mostVisitedStart + pageSize >= mostVisited.length}
                    >
                      ▶
                    </button>
                  </div>
                )}
              </>
            ) : (
              isExpanded && <div className="sidebar-empty">{labels.noMostVisited}</div>
            )}
          </div>
        </section>

        <section className="sidebar-section">
          <button 
            className={`sidebar-section-header ${expandedSection === 'favorites' ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === 'favorites' ? null : 'favorites')}
            title={labels.favorites}
          >
            <svg className="sidebar-section-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {isExpanded && <span className="sidebar-section-title">{labels.favorites}</span>}
            {isExpanded && favorites.length > 0 && (
              <span className="sidebar-count">{favorites.length}</span>
            )}
          </button>
          <div className={`sidebar-section-content ${expandedSection === 'favorites' ? 'show' : ''}`}>
            {favorites.length > 0 ? (
              <>
                {visibleFavorites.map(link => renderLinkItem(link))}
                {(favoritesPage > 0 || favoritesStart + pageSize < favorites.length) && (
                  <div className="sidebar-pager">
                    <button
                      type="button"
                      className="sidebar-more-item"
                      onClick={() => setFavoritesPage((page) => Math.max(page - 1, 0))}
                      title="Previous"
                      disabled={favoritesPage === 0}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      className="sidebar-more-item"
                      onClick={() => setFavoritesPage((page) => page + 1)}
                      title="Next"
                      disabled={favoritesStart + pageSize >= favorites.length}
                    >
                      ▶
                    </button>
                  </div>
                )}
              </>
            ) : (
              isExpanded && <div className="sidebar-empty">{labels.noFavorites}</div>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
