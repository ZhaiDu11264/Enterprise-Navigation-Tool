import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WebsiteLink } from '../../types';
import './LinkCard.css';

interface LinkCardProps {
  link: WebsiteLink;
  onClick: (link: WebsiteLink) => void;
  onEdit?: (link: WebsiteLink) => void;
  onDelete?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  onGroupClick?: (groupId: number) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
  showGroupName?: boolean;
  highlightQuery?: string;
  groups?: Array<{ id: number; name: string }>;
  listLayout?: boolean;
  allowSystemEdit?: boolean;
  compactMode?: boolean;
  showActions?: boolean;
}

export function LinkCard({
  link,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  onGroupClick,
  isDragging = false,
  dragHandleProps,
  showGroupName = false,
  highlightQuery = '',
  groups = [],
  listLayout = false,
  allowSystemEdit = false,
  compactMode = false,
  showActions = false
}: LinkCardProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      ungrouped: 'Ungrouped',
      iconAlt: (name: string) => `${name} icon`,
      addFavorite: 'Add to favorites',
      removeFavorite: 'Remove from favorites',
      editLink: 'Edit link',
      deleteLink: 'Delete link',
      deleteSystemLink: 'Delete system link',
      systemLink: 'System link, cannot delete',
      visit: 'visit',
      visits: 'visits'
    },
    zh: {
      ungrouped: '\u672a\u5206\u7ec4',
      iconAlt: (name: string) => `${name} \u56fe\u6807`,
      addFavorite: '\u6dfb\u52a0\u5230\u6536\u85cf',
      removeFavorite: '\u53d6\u6d88\u6536\u85cf',
      editLink: '\u7f16\u8f91\u94fe\u63a5',
      deleteLink: '\u5220\u9664\u94fe\u63a5',
      deleteSystemLink: '\u5220\u9664\u7cfb\u7edf\u94fe\u63a5',
      systemLink: '\u7cfb\u7edf\u94fe\u63a5\uff0c\u4e0d\u53ef\u5220\u9664',
      visit: '\u6b21\u8bbf\u95ee',
      visits: '\u6b21\u8bbf\u95ee'
    }
  } as const;
  const t = translations[language];
  const isCompact = Boolean(compactMode);
  const allowActions = !isCompact || showActions;
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('.card-actions')) {
      return;
    }
    onClick(link);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(link);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(link);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(link);
  };

  const getIconUrl = () => {
    if (link.iconUrl) {
      return link.iconUrl;
    }
    // Fallback to default icon
    return '/icons/website-icon.svg';
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  const getGroupName = () => {
    if (!showGroupName) return null;
    const group = groups.find(g => Number(g.id) === Number(link.groupId));
    return group?.name || t.ungrouped;
  };
  const handleGroupClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const groupId = Number(link.groupId);
    if (!Number.isFinite(groupId)) {
      return;
    }
    onGroupClick?.(groupId);
  };
  const canDelete = Boolean(link.isDeletable || allowSystemEdit);

  return (
    <div
      className={`link-card ${isDragging ? 'dragging' : ''} ${link.isFavorite ? 'favorite' : ''} ${listLayout ? 'list-layout' : ''}${isCompact ? ' compact' : ''}`}
      onClick={handleCardClick}
      {...dragHandleProps}
    >
      <div className="card-icon">
        <img
          src={getIconUrl()}
          alt={t.iconAlt(link.name)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/website-icon.svg';
          }}
        />
      </div>
      
      <div className="card-content">
        <h3 className="card-title">
          {highlightText(link.name, highlightQuery)}
        </h3>
        {!isCompact && link.description && (
          <p className="card-description">
            {highlightText(link.description, highlightQuery)}
          </p>
        )}
        {!isCompact && <div className="card-url">{new URL(link.url).hostname}</div>}
        {!isCompact && showGroupName && (
          <div
            className="card-group"
            onClick={onGroupClick ? handleGroupClick : undefined}
            role={onGroupClick ? 'button' : undefined}
            tabIndex={onGroupClick ? 0 : undefined}
            onKeyDown={(event) => {
              if (!onGroupClick) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleGroupClick(event as unknown as React.MouseEvent);
              }
            }}
          >
            {getGroupName()}
          </div>
        )}
      </div>

      {allowActions && (
        <div className="card-actions">
          {onToggleFavorite && (
            <button
              className={`favorite-btn ${link.isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              title={link.isFavorite ? t.removeFavorite : t.addFavorite}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          )}
          
          {onEdit && (!link.isSystemLink || allowSystemEdit) && (
            <button
              className="edit-btn"
              onClick={handleEditClick}
              title={t.editLink}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          )}
          
          {onDelete && canDelete ? (
            <button
              className="delete-btn"
              onClick={handleDeleteClick}
              title={link.isDeletable ? t.deleteLink : t.deleteSystemLink}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          ) : null}
          
          {!link.isDeletable && (
            <div className="system-indicator" title={t.systemLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
              </svg>
            </div>
          )}
        </div>
      )}
      
      {!isCompact && link.accessCount > 0 && (
        <div className="card-stats">
          <span className="access-count">{link.accessCount} {link.accessCount === 1 ? t.visit : t.visits}</span>
        </div>
      )}
    </div>
  );
}
