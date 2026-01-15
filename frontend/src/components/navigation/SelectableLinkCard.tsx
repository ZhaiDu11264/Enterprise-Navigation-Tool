import React, { useState, useCallback } from 'react';
import { WebsiteLink } from '../../types';
import './SelectableLinkCard.css';

interface SelectableLinkCardProps {
  link: WebsiteLink;
  isSelected: boolean;
  onSelect: (linkId: number, selected: boolean) => void;
  onEdit?: (link: WebsiteLink) => void;
  onDelete?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  selectionMode: boolean;
}

const SelectableLinkCard: React.FC<SelectableLinkCardProps> = ({
  link,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  selectionMode
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault();
      onSelect(link.id, !isSelected);
    } else {
      // Normal link click behavior
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  }, [selectionMode, isSelected, onSelect, link.id, link.url]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(link.id, e.target.checked);
  }, [onSelect, link.id]);

  const handleActionClick = useCallback((e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  }, []);

  const getIconUrl = useCallback(() => {
    if (link.iconUrl && !imageError) {
      return link.iconUrl;
    }
    
    // Fallback to favicon service
    try {
      const domain = new URL(link.url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '/default-favicon.png';
    }
  }, [link.iconUrl, link.url, imageError]);

  return (
    <div 
      className={`selectable-link-card ${isSelected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="selection-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Link Icon */}
      <div className="link-icon">
        <img
          src={getIconUrl()}
          alt={`${link.name} icon`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>

      {/* Link Content */}
      <div className="link-content">
        <div className="link-header">
          <h3 className="link-name" title={link.name}>
            {link.name}
          </h3>
          {link.isFavorite && (
            <span className="favorite-indicator" title="收藏">⭐</span>
          )}
        </div>

        {link.description && (
          <p className="link-description" title={link.description}>
            {link.description}
          </p>
        )}

        <div className="link-meta">
          <span className="link-url" title={link.url}>
            {link.url}
          </span>
          {link.accessCount > 0 && (
            <span className="access-count" title="访问次数">
              {link.accessCount} 次访问
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!selectionMode && (isHovered || window.innerWidth <= 768) && (
        <div className="link-actions">
          {onToggleFavorite && (
            <button
              className={`action-btn favorite-btn ${link.isFavorite ? 'active' : ''}`}
              onClick={(e) => handleActionClick(e, () => onToggleFavorite(link))}
              title={link.isFavorite ? '取消收藏' : '添加收藏'}
            >
              {link.isFavorite ? '⭐' : '☆'}
            </button>
          )}
          
          {onEdit && (
            <button
              className="action-btn edit-btn"
              onClick={(e) => handleActionClick(e, () => onEdit(link))}
              title="编辑"
            >
              ✏️
            </button>
          )}
          
          {onDelete && link.isDeletable && (
            <button
              className="action-btn delete-btn"
              onClick={(e) => handleActionClick(e, () => onDelete(link))}
              title="删除"
            >
              🗑️
            </button>
          )}
        </div>
      )}

      {/* System Link Indicator */}
      {link.isSystemLink && (
        <div className="system-indicator" title="系统链接">
          🔒
        </div>
      )}
    </div>
  );
};

export default SelectableLinkCard;