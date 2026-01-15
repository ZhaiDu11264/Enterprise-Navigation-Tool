import React, { useState, useEffect } from 'react';
import { WebsiteLink } from '../../types';
import { LinkCard } from './LinkCard';
import './DraggableList.css';

interface DraggableListProps {
  links: WebsiteLink[];
  groupId?: number | null;
  onLinkClick: (link: WebsiteLink) => void;
  onEditLink?: (link: WebsiteLink) => void;
  onDeleteLink?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  onReorder?: (reorderedLinks: WebsiteLink[]) => void;
  onMoveToGroup?: (linkId: number, targetGroupId: number | null) => Promise<void>;
  allowSystemEdit?: boolean;
  compactMode?: boolean;
  showActions?: boolean;
  dragDisabled?: boolean;
  onAddLinkClick?: () => void;
  addLinkLabel?: string;
  addLinkHint?: string;
  enableCrossGroupDrag?: boolean;
}

export function DraggableList({
  links,
  groupId,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onReorder,
  onMoveToGroup,
  allowSystemEdit = false,
  compactMode = false,
  showActions = false,
  dragDisabled = false,
  onAddLinkClick,
  addLinkLabel = '添加链接',
  addLinkHint = '新建一个链接',
  enableCrossGroupDrag = false
}: DraggableListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localLinks, setLocalLinks] = useState<WebsiteLink[]>(links);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // 只在不拖动时更新 localLinks
    if (!isDragging) {
      setLocalLinks(links);
    }
  }, [links, isDragging]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (dragDisabled) return;

    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';

    const dragData = {
      linkId: localLinks[index].id,
      sourceGroupId: groupId,
      linkData: localLinks[index]
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragDisabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (dragDisabled || draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();

    const newLinks = [...localLinks];
    const draggedItem = newLinks[draggedIndex];
    newLinks.splice(draggedIndex, 1);
    newLinks.splice(index, 0, draggedItem);

    setLocalLinks(newLinks);
    setDraggedIndex(index);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (dragDisabled) return;
    e.preventDefault();

    try {
      const dragDataStr = e.dataTransfer.getData('application/json');
      if (!dragDataStr) {
        setDraggedIndex(null);
        setIsDragging(false);
        return;
      }

      const dragData = JSON.parse(dragDataStr);

      if (enableCrossGroupDrag && dragData.sourceGroupId !== groupId && onMoveToGroup) {
        try {
          await onMoveToGroup(dragData.linkId, groupId ?? null);
          console.log(`✅ 跨组移动成功: 链接 ${dragData.linkId} → 分组 ${groupId ?? '未分组'}`);
        } catch (error) {
          console.error('跨组移动失败:', error);
          setLocalLinks(links);
        }
      } else if (dragData.sourceGroupId === groupId) {
        if (onReorder) {
          onReorder(localLinks);
        }
      }
    } catch (error) {
      console.error('Drop error:', error);
      setLocalLinks(links);
    }

    setDraggedIndex(null);
    setTimeout(() => {
      setIsDragging(false);
    }, 120);
  };

  const handleDragEnd = () => {
    if (dragDisabled) return;
    setDraggedIndex(null);
    setTimeout(() => {
      setIsDragging(false);
    }, 60);
  };

  return (
    <div
      className="draggable-list"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {localLinks.map((link, index) => (
        <div
          key={link.id}
          className={`draggable-list-item ${draggedIndex === index ? 'dragging' : ''}`}
          draggable={!dragDisabled}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragEnd={handleDragEnd}
        >
          <LinkCard
            link={link}
            onClick={onLinkClick}
            onEdit={onEditLink}
            onDelete={onDeleteLink}
            onToggleFavorite={onToggleFavorite}
            listLayout={true}
            allowSystemEdit={allowSystemEdit}
            compactMode={compactMode}
            showActions={showActions}
          />
        </div>
      ))}
      {onAddLinkClick && (
        <div className="draggable-list-item add-link-item">
          <button
            className={`add-link-card${compactMode ? ' compact' : ''}`}
            onClick={onAddLinkClick}
            type="button"
          >
            <div className="add-link-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div className="add-link-content">
              <div className="add-link-text">{addLinkLabel}</div>
              <div className="add-link-hint">{addLinkHint}</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
