import React, { useState, useEffect } from 'react';
import { WebsiteLink, Group, LinkOrder } from '../../types';
import { LinkCard } from './LinkCard';
import { linkService } from '../../services/linkService';
import './DraggableList.css';

interface UnifiedDraggableListProps {
  groups: Group[];
  links: WebsiteLink[];
  groupedLinks: { map: Map<number, WebsiteLink[]>; ungrouped: WebsiteLink[] };
  onLinkClick: (link: WebsiteLink) => void;
  onEditLink?: (link: WebsiteLink) => void;
  onDeleteLink?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  onReorderLinks?: (linkOrders: LinkOrder[]) => void;
  onLinkMoved?: (linkId: number, newGroupId: number | null) => void;
  onEditGroup?: (group: Group) => void;
  onDeleteGroup?: (group: Group) => void;
  onAddGroup?: () => void;
  onAddLink?: (groupId: number | null) => void;
  allowSystemEdit?: boolean;
  compactMode?: boolean;
  dragDisabled?: boolean;
  viewMode?: 'grid' | 'list';
  labels: {
    groups: string;
    addGroup: string;
    addLink: string;
    addLinkHint: string;
    ungrouped: string;
    editGroup: string;
    deleteGroup: string;
    systemGroup: string;
    noLinksInGroup: string;
    collapseGroup: string;
    expandGroup: string;
  };
}

export function UnifiedDraggableList({
  groups,
  links,
  groupedLinks,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onReorderLinks,
  onLinkMoved,
  onEditGroup,
  onDeleteGroup,
  onAddGroup,
  allowSystemEdit = false,
  compactMode = false,
  dragDisabled = false,
  viewMode = 'list',
  labels
}: UnifiedDraggableListProps) {
  // 构建统一的链接列表（按分组顺序）
  const buildUnifiedList = () => {
    const result: Array<{ type: 'group-header'; group: Group } | { type: 'link'; link: WebsiteLink; groupId: number | null }> = [];
    
    groups.forEach(group => {
      result.push({ type: 'group-header', group });
      const groupLinks = (groupedLinks.map.get(Number(group.id)) ?? []).sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.sortOrder - b.sortOrder;
      });
      groupLinks.forEach(link => {
        result.push({ type: 'link', link, groupId: Number(group.id) });
      });
    });
    
    // 添加未分组
    if (groupedLinks.ungrouped.length > 0) {
      const sortedUngrouped = [...groupedLinks.ungrouped].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.sortOrder - b.sortOrder;
      });
      result.push({ type: 'group-header', group: { id: -1, name: labels.ungrouped } as any });
      sortedUngrouped.forEach(link => {
        result.push({ type: 'link', link, groupId: null });
      });
    }
    
    return result;
  };

  const [unifiedList, setUnifiedList] = useState(buildUnifiedList());
  const [draggedStartIndex, setDraggedStartIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedSourceGroupId, setDraggedSourceGroupId] = useState<number | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [lastUpdateKey, setLastUpdateKey] = useState(0);

  const getTargetGroupId = (
    item: { type: 'group-header'; group: Group } | { type: 'link'; link: WebsiteLink; groupId: number | null }
  ): number | null => {
    if (item.type === 'link') {
      return item.groupId;
    }
    if (item.group.id === -1) {
      return null;
    }
    return Number(item.group.id);
  };

  const updateDraggedItemGroup = (
    item: { type: 'link'; link: WebsiteLink; groupId: number | null },
    targetGroupId: number | null
  ) => {
    if (item.groupId === targetGroupId) {
      return item;
    }
    return {
      ...item,
      groupId: targetGroupId,
      link: targetGroupId === null ? item.link : { ...item.link, groupId: targetGroupId }
    };
  };

  const moveUnifiedItem = (
    list: Array<{ type: 'group-header'; group: Group } | { type: 'link'; link: WebsiteLink; groupId: number | null }>,
    fromIndex: number,
    toIndex: number,
    updatedItem?: { type: 'link'; link: WebsiteLink; groupId: number | null }
  ) => {
    const nextList = [...list];
    const [removed] = nextList.splice(fromIndex, 1);
    const insertIndex = Math.max(0, Math.min(toIndex, nextList.length));
    nextList.splice(insertIndex, 0, updatedItem ?? removed);
    return { nextList, insertIndex };
  };

  const buildLinkOrdersForGroup = (
    list: Array<{ type: 'group-header'; group: Group } | { type: 'link'; link: WebsiteLink; groupId: number | null }>,
    groupId: number | null,
    movedLinkId?: number,
    movedTargetGroupId?: number | null
  ): LinkOrder[] => {
    const linkItems = list.filter(
      (item): item is { type: 'link'; link: WebsiteLink; groupId: number | null } =>
        item.type === 'link' && item.groupId === groupId
    );
    return linkItems
      .map(item => item.link)
      .map((link, index) => ({
        id: link.id,
        sortOrder: index,
        ...(movedLinkId === link.id && typeof movedTargetGroupId === 'number' ? { groupId: movedTargetGroupId } : {})
      }));
  };

  const toggleGroupCollapsed = (groupId: number) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  useEffect(() => {
    // 只在不拖动时更新列表
    if (!isDragging) {
      setUnifiedList(buildUnifiedList());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, links, groupedLinks, isDragging, lastUpdateKey]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (dragDisabled) return;
    const item = unifiedList[index];
    if (item.type !== 'link') return;
    
    setDraggedIndex(index);
    setDraggedStartIndex(index);
    setDraggedSourceGroupId(item.groupId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (dragDisabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    if (dragDisabled || draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();
    
    const draggedItem = unifiedList[draggedIndex];
    const targetItem = unifiedList[index];
    
    // 只允许链接之间拖拽
    if (draggedItem.type !== 'link') return;
    if (targetItem.type !== 'link' && targetItem.type !== 'group-header') return;
    
    // 实时更新列表顺序
    const targetGroupId = getTargetGroupId(targetItem);
    const insertIndex = targetItem.type === 'group-header' ? index + 1 : index;
    const updatedDraggedItem = updateDraggedItemGroup(draggedItem, targetGroupId);
    const { nextList, insertIndex: newIndex } = moveUnifiedItem(
      unifiedList,
      draggedIndex,
      insertIndex,
      updatedDraggedItem
    );
    
    setUnifiedList(nextList);
    setDraggedIndex(newIndex);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    if (dragDisabled || draggedIndex === null) return;
    e.preventDefault();
    
    const draggedItem = unifiedList[draggedIndex];
    const targetItem = unifiedList[targetIndex];
    
    if (draggedItem.type !== 'link') return;
    if (targetItem.type !== 'link' && targetItem.type !== 'group-header') return;
    
    // Check for cross-group moves and ordering changes
    const sourceGroupId = draggedSourceGroupId ?? draggedItem.groupId;
    const targetGroupId = getTargetGroupId(targetItem);
    const insertIndex = targetItem.type === 'group-header' ? targetIndex + 1 : targetIndex;
    const didChangeGroup = sourceGroupId !== targetGroupId;
    const didChangePosition = (draggedStartIndex ?? draggedIndex) !== insertIndex;
    
    if (!didChangeGroup && !didChangePosition) {
      setDraggedIndex(null);
      setDraggedSourceGroupId(null);
      setIsDragging(false);
      return;
    }
    
    const updatedDraggedItem = updateDraggedItemGroup(draggedItem, targetGroupId);
    const result = didChangePosition
      ? moveUnifiedItem(unifiedList, draggedIndex, insertIndex, updatedDraggedItem)
      : {
          nextList: unifiedList.map((item, index) =>
            index === draggedIndex && item.type === 'link' ? updatedDraggedItem : item
          )
        };
    const nextList = result.nextList;
    
    const linkOrders: LinkOrder[] = [];
    if (didChangeGroup) {
      linkOrders.push(
        ...buildLinkOrdersForGroup(nextList, sourceGroupId),
        ...buildLinkOrdersForGroup(nextList, targetGroupId, draggedItem.link.id, targetGroupId)
      );
    } else {
      linkOrders.push(...buildLinkOrdersForGroup(nextList, targetGroupId));
    }

    if (onReorderLinks) {
      onReorderLinks(linkOrders);
    } else if (didChangeGroup) {
      try {
        await linkService.updateLink(draggedItem.link.id, {
          groupId: targetGroupId === null ? undefined : targetGroupId
        });
        onLinkMoved?.(draggedItem.link.id, targetGroupId);
        setTimeout(() => {
          setLastUpdateKey(prev => prev + 1);
        }, 80);
      } catch (error) {
        console.error('Failed to move link:', error);
        setUnifiedList(buildUnifiedList());
      }
    } else {
      onLinkMoved?.(draggedItem.link.id, targetGroupId);
    }

    setUnifiedList(nextList);
    setDraggedIndex(null);
    setDraggedStartIndex(null);
    setDraggedSourceGroupId(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedStartIndex(null);
    setDraggedSourceGroupId(null);
    setIsDragging(false);
  };

  const sections = unifiedList.reduce(
    (
      acc: Array<{
        header: Group;
        headerIndex: number;
        items: Array<{ item: { type: 'link'; link: WebsiteLink; groupId: number | null }; index: number }>;
      }>,
      item,
      index
    ) => {
      if (item.type === 'group-header') {
        acc.push({ header: item.group, headerIndex: index, items: [] });
        return acc;
      }
      const current = acc[acc.length - 1];
      if (current) {
        current.items.push({ item, index });
      }
      return acc;
    },
    []
  );

  return (
    <div className={`unified-draggable-list ${viewMode === 'grid' ? 'grid-mode' : 'list-mode'}`}>
      <div className="grouped-list-header">
        <div className="grouped-list-title">{labels.groups}</div>
        {onAddGroup && (
          <button className="grouped-add-btn" onClick={onAddGroup} title={labels.addGroup}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>{labels.addGroup}</span>
          </button>
        )}
      </div>
      
      <div className="unified-list-content">
        {sections.map((section) => {
          const group = section.header;
          const groupKey = Number(group.id);
          const isCollapsed = collapsedGroups.has(groupKey);
          const canEditGroup = Boolean(onEditGroup && (!group.isSystemGroup || allowSystemEdit));
          const canDeleteGroup = Boolean(onDeleteGroup && group.isDeletable);
          const isListView = viewMode === 'list';

          return (
            <div key={`group-${group.id}`} className="grouped-section">
              <div
                className={`grouped-header${isCollapsed ? ' collapsed' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, section.headerIndex)}
                onDrop={(e) => handleDrop(e, section.headerIndex)}
              >
                <button
                  className="grouped-toggle"
                  type="button"
                  onClick={() => toggleGroupCollapsed(groupKey)}
                  title={isCollapsed ? labels.expandGroup : labels.collapseGroup}
                >
                  <span className={`grouped-caret${isCollapsed ? ' collapsed' : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </span>
                  <span className="grouped-name">{group.name}</span>
                  {group.isSystemGroup && (
                    <span className="grouped-system" title={labels.systemGroup}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" />
                      </svg>
                    </span>
                  )}
                </button>
                <div className="grouped-actions">
                  {canEditGroup && (
                    <button className="grouped-action edit" onClick={() => onEditGroup?.(group)} title={labels.editGroup}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  )}
                  {canDeleteGroup && (
                    <button className="grouped-action delete" onClick={() => onDeleteGroup?.(group)} title={labels.deleteGroup}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div
                className={`grouped-section-body ${isListView ? 'list-layout' : 'grid-layout'}${isCollapsed ? ' collapsed' : ''}`}
              >
                {section.items.length === 0 ? (
                  <div className="grouped-empty">{labels.noLinksInGroup}</div>
                ) : (
                  section.items.map(({ item, index }) => {
                    const { link } = item;
                    const isDragging = draggedIndex === index;

                    return (
                      <div
                        key={`link-${link.id}`}
                        className={`draggable-list-item ${isDragging ? 'dragging' : ''}${isListView ? '' : ' grid-item'}`}
                        draggable={!dragDisabled && !isCollapsed}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <LinkCard
                          link={link}
                          onClick={onLinkClick}
                          onEdit={onEditLink}
                          onDelete={onDeleteLink}
                          onToggleFavorite={onToggleFavorite}
                          listLayout={isListView}
                          allowSystemEdit={allowSystemEdit}
                          compactMode={compactMode}
                          showActions={true}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
