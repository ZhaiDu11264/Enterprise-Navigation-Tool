import React from 'react';
import { WebsiteLink } from '../../types';
import { LinkCard } from './LinkCard';
import './CardGrid.css';

interface CardGridProps {
  links: WebsiteLink[];
  onLinkClick: (link: WebsiteLink) => void;
  onEditLink?: (link: WebsiteLink) => void;
  onDeleteLink?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  loading?: boolean;
  emptyMessage?: string;
  viewMode?: 'grid' | 'list';
  compactMode?: boolean;
  showActions?: boolean;
}

export function CardGrid({
  links,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  loading = false,
  emptyMessage = "No links found",
  viewMode = 'grid',
  compactMode = false,
  showActions = false
}: CardGridProps) {
  const isListView = viewMode === 'list';
  const gridClassName = `grid-container${isListView ? ' list-view' : ''}${compactMode ? ' compact' : ''}`;

  if (loading) {
    return (
      <div className="card-grid">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading links...</p>
        </div>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="card-grid">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3>No Links Yet</h3>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-grid">
      <div className={gridClassName}>
        {links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            onClick={onLinkClick}
            onEdit={onEditLink}
            onDelete={onDeleteLink}
            onToggleFavorite={onToggleFavorite}
            listLayout={isListView}
            compactMode={compactMode}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
}
