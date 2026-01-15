import React from 'react';
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
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Group } from '../../types';
import './GroupTabs.css';

interface DraggableTabProps {
  group: Group;
  isActive: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  allowSystemEdit?: boolean;
}

function DraggableTab({
  group,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  disabled = false,
  allowSystemEdit = false
}: DraggableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const dragHandleProps = disabled ? {} : {
    ...attributes,
    ...listeners,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`tab ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onSelect}
      {...dragHandleProps}
    >
      <span className="tab-label">{group.name}</span>
      
      {(Boolean(onEdit && (!group.isSystemGroup || allowSystemEdit)) || Boolean(onDelete && group.isDeletable)) ? (
        <div className="tab-actions">
          {onEdit && (!group.isSystemGroup || allowSystemEdit) && (
            <button
              className="tab-action edit"
              onClick={handleEditClick}
              title="Edit group"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          )}
          
          {onDelete && group.isDeletable && (
            <button
              className="tab-action delete"
              onClick={handleDeleteClick}
              title="Delete group"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

interface DraggableGroupTabsProps {
  groups: Group[];
  activeGroupId: number | null;
  onGroupSelect: (groupId: number | null) => void;
  onAddGroup?: () => void;
  onEditGroup?: (group: Group) => void;
  onDeleteGroup?: (group: Group) => void;
  onReorderGroups?: (reorderedGroups: Group[]) => void;
  showAllTab?: boolean;
  allLabel?: string;
  addGroupLabel?: string;
  groupsLabel?: string;
  collapseLabel?: string;
  expandLabel?: string;
  className?: string;
  dragDisabled?: boolean;
  allowSystemEdit?: boolean;
  layout?: 'tabs' | 'list';
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function DraggableGroupTabs({
  groups,
  activeGroupId,
  onGroupSelect,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onReorderGroups,
  showAllTab = true,
  allLabel,
  addGroupLabel,
  groupsLabel = 'Groups',
  collapseLabel = 'Collapse groups',
  expandLabel = 'Expand groups',
  className = "",
  dragDisabled = false,
  allowSystemEdit = false,
  layout = 'tabs',
  collapsed = false,
  onToggleCollapsed
}: DraggableGroupTabsProps) {
  const sortedGroups = [...groups].sort((a, b) => a.sortOrder - b.sortOrder);
  const isListLayout = layout === 'list';
  const layoutClassName = isListLayout ? 'list-layout' : 'tabs-layout';

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
      const oldIndex = sortedGroups.findIndex((group) => group.id === active.id);
      const newIndex = sortedGroups.findIndex((group) => group.id === over?.id);

      const reorderedGroups = arrayMove(sortedGroups, oldIndex, newIndex);
      
      // Update sort orders
      const updatedGroups = reorderedGroups.map((group, index) => ({
        ...group,
        sortOrder: index
      }));

      onReorderGroups?.(updatedGroups);
    }
  };

  const handleTabClick = (groupId: number | null) => {
    onGroupSelect(groupId === null ? null : Number(groupId));
  };

  return (
    <div className={`group-tabs ${layoutClassName} ${collapsed ? 'collapsed' : ''} ${className}`}>
      <div className="tabs-container">
        {isListLayout && (
          <div className="group-tabs-header">
            <span className="group-tabs-title">{groupsLabel}</span>
            <div className="group-tabs-header-actions">
              {onAddGroup && (
                <button
                  className="add-group-btn"
                  onClick={onAddGroup}
                  title="Add new group"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  <span>{addGroupLabel || 'Add Group'}</span>
                </button>
              )}
              {onToggleCollapsed && (
                <button
                  className="group-collapse-btn"
                  onClick={onToggleCollapsed}
                  title={collapsed ? expandLabel : collapseLabel}
                  aria-expanded={!collapsed}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    {collapsed ? (
                      <path d="M7 10l5 5 5-5z"/>
                    ) : (
                      <path d="M7 14l5-5 5 5z"/>
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        {!collapsed && (
          <div className="tabs-scroll">
            {showAllTab && (
              <button
                className={`tab ${activeGroupId === null ? 'active' : ''}`}
                onClick={() => handleTabClick(null)}
              >
                <span className="tab-label">{allLabel || 'All Links'}</span>
              </button>
            )}
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sortedGroups.map(group => group.id)} 
                strategy={isListLayout ? verticalListSortingStrategy : horizontalListSortingStrategy}
              >
                {sortedGroups.map((group) => (
                  <DraggableTab
                    key={group.id}
                    group={group}
                    isActive={activeGroupId === Number(group.id)}
                    onSelect={() => handleTabClick(Number(group.id))}
                    onEdit={onEditGroup ? () => onEditGroup(group) : undefined}
                    onDelete={onDeleteGroup ? () => onDeleteGroup(group) : undefined}
                    disabled={dragDisabled}
                    allowSystemEdit={allowSystemEdit}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
        
        {!isListLayout && onAddGroup && (
          <button
            className="add-group-btn"
            onClick={onAddGroup}
            title="Add new group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>{addGroupLabel || 'Add Group'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
