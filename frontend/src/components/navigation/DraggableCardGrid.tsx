import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { WebsiteLink } from '../../types';
import { DraggableLinkCard } from './DraggableLinkCard';
import './CardGrid.css';

interface DraggableCardGridProps {
  links: WebsiteLink[];
  onLinkClick: (link: WebsiteLink) => void;
  onEditLink?: (link: WebsiteLink) => void;
  onDeleteLink?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  onReorder?: (reorderedLinks: WebsiteLink[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  viewMode?: 'grid' | 'list';
  dragDisabled?: boolean;
  allowSystemEdit?: boolean;
  onAddLinkClick?: () => void;
  addLinkLabel?: string;
  compactMode?: boolean;
  showActions?: boolean;
}

export function DraggableCardGrid({
  links,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onReorder,
  loading = false,
  emptyMessage,
  viewMode = 'grid',
  dragDisabled = false,
  allowSystemEdit = false,
  onAddLinkClick,
  addLinkLabel,
  compactMode = false,
  showActions = false
}: DraggableCardGridProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      loading: 'Loading links...',
      emptyTitle: 'No Links Yet',
      emptyMessage: 'No links found',
      addLink: 'Add Link',
      addLinkHint: 'Create a new link'
    },
    zh: {
      loading: '\u6b63\u5728\u52a0\u8f7d\u94fe\u63a5...',
      emptyTitle: '\u6682\u65e0\u94fe\u63a5',
      emptyMessage: '\u6682\u65e0\u94fe\u63a5',
      addLink: '\u6dfb\u52a0\u94fe\u63a5',
      addLinkHint: '\u65b0\u5efa\u4e00\u4e2a\u94fe\u63a5'
    }
  } as const;
  const t = translations[language];
  const resolvedEmptyMessage = emptyMessage ?? t.emptyMessage;
  const isListView = viewMode === 'list';
  const gridClassName = `grid-container${isListView ? ' list-view' : ''}${compactMode ? ' compact' : ''}`;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id !== over?.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over?.id);

      const reorderedLinks = arrayMove(links, oldIndex, newIndex);
      
      // Update sort orders
      const updatedLinks = reorderedLinks.map((link, index) => ({
        ...link,
        sortOrder: index
      }));

      onReorder?.(updatedLinks);
    }
  };

  if (loading) {
    return (
      <div className="card-grid">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t.loading}</p>
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
          <h3>{t.emptyTitle}</h3>
          <p>{resolvedEmptyMessage}</p>
        </div>
        {onAddLinkClick && (
          <div className="empty-add">
            <button
              className={`add-link-card${isListView ? ' list-layout' : ''}${compactMode ? ' compact' : ''}`}
              onClick={onAddLinkClick}
              type="button"
            >
              <div className="add-link-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </div>
              <div className="add-link-content">
                <div className="add-link-text">{addLinkLabel || t.addLink}</div>
                <div className="add-link-hint">{t.addLinkHint}</div>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-grid">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={links.map(link => link.id)} strategy={rectSortingStrategy}>
          <div className={gridClassName}>
            {links.map((link) => (
              <DraggableLinkCard
                key={link.id}
                link={link}
                onClick={onLinkClick}
                onEdit={onEditLink}
                onDelete={onDeleteLink}
                onToggleFavorite={onToggleFavorite}
                listLayout={isListView}
                disabled={dragDisabled}
                allowSystemEdit={allowSystemEdit}
                compactMode={compactMode}
                showActions={showActions}
              />
            ))}
            {onAddLinkClick && (
              <button
                className={`add-link-card${isListView ? ' list-layout' : ''}${compactMode ? ' compact' : ''}`}
                onClick={onAddLinkClick}
                type="button"
              >
                <div className="add-link-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </div>
                <div className="add-link-content">
                  <div className="add-link-text">{addLinkLabel || t.addLink}</div>
                  <div className="add-link-hint">{t.addLinkHint}</div>
                </div>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
