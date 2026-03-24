import React, { useState, useCallback } from 'react';
import { WebsiteLink } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import config from '../../config';
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
  const { language } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const t = language === 'zh'
    ? {
        favorite: '收藏',
        accessCountTitle: '访问次数',
        accessCountSuffix: '次访问',
        removeFavorite: '取消收藏',
        addFavorite: '添加收藏',
        edit: '编辑',
        delete: '删除',
        systemLink: '系统链接'
      }
    : {
        favorite: 'Favorite',
        accessCountTitle: 'Access Count',
        accessCountSuffix: 'visits',
        removeFavorite: 'Remove Favorite',
        addFavorite: 'Add Favorite',
        edit: 'Edit',
        delete: 'Delete',
        systemLink: 'System Link'
      };

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault();
      onSelect(link.id, !isSelected);
    } else {
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

    try {
      const domain = new URL(link.url).hostname;
      const template = config.links.faviconFallbackTemplate;
      if (template.includes('{domain}')) {
        return template.replace('{domain}', domain);
      }
      return `${template}${domain}`;
    } catch {
      return config.links.defaultFaviconPath;
    }
  }, [link.iconUrl, link.url, imageError]);

  return (
    <div
      className={`selectable-link-card ${isSelected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

      <div className="link-icon">
        <img src={getIconUrl()} alt={`${link.name} icon`} onError={() => setImageError(true)} loading="lazy" />
      </div>

      <div className="link-content">
        <div className="link-header">
          <h3 className="link-name" title={link.name}>{link.name}</h3>
          {link.isFavorite && (
            <span className="favorite-indicator" title={t.favorite}>⭐</span>
          )}
        </div>

        {link.description && (
          <p className="link-description" title={link.description}>{link.description}</p>
        )}

        <div className="link-meta">
          <span className="link-url" title={link.url}>{link.url}</span>
          {link.accessCount > 0 && (
            <span className="access-count" title={t.accessCountTitle}>
              {link.accessCount} {t.accessCountSuffix}
            </span>
          )}
        </div>
      </div>

      {!selectionMode && (isHovered || window.innerWidth <= 768) && (
        <div className="link-actions">
          {onToggleFavorite && (
            <button
              className={`action-btn favorite-btn ${link.isFavorite ? 'active' : ''}`}
              onClick={(e) => handleActionClick(e, () => onToggleFavorite(link))}
              title={link.isFavorite ? t.removeFavorite : t.addFavorite}
            >
              {link.isFavorite ? '⭐' : '☆'}
            </button>
          )}

          {onEdit && (
            <button
              className="action-btn edit-btn"
              onClick={(e) => handleActionClick(e, () => onEdit(link))}
              title={t.edit}
            >
              ✏️
            </button>
          )}

          {onDelete && link.isDeletable && (
            <button
              className="action-btn delete-btn"
              onClick={(e) => handleActionClick(e, () => onDelete(link))}
              title={t.delete}
            >
              🗑️
            </button>
          )}
        </div>
      )}

      {link.isSystemLink && (
        <div className="system-indicator" title={t.systemLink}>
          🔒
        </div>
      )}
    </div>
  );
};

export default SelectableLinkCard;
