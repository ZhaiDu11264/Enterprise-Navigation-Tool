import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WebsiteLink, Group, LinkOrder, CreateLinkRequest, UpdateLinkRequest, CreateGroupRequest, UpdateGroupRequest } from '../../types';
import { DraggableGroupTabs } from './DraggableGroupTabs';
import { DraggableCardGrid } from './DraggableCardGrid';
import { UnifiedDraggableList } from './UnifiedDraggableList';
import { LinkGroupManager } from './LinkGroupManager';
import './NavigationView.css';

interface NavigationViewProps {
  groups: Group[];
  links: WebsiteLink[];
  loading?: boolean;
  onLinkClick: (link: WebsiteLink) => void;
  onEditLink?: (link: WebsiteLink) => void;
  onDeleteLink?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  onAddGroup?: () => void;
  onEditGroup?: (group: Group) => void;
  onDeleteGroup?: (group: Group) => void;
  onReorderLinks?: (linkOrders: LinkOrder[]) => void;
  onReorderGroups?: (groupOrders: { id: number; sortOrder: number }[]) => void;
  onAddLinkClick?: (groupId?: number | null) => void;
  onOpenSettings?: () => void;
  onLinkMoved?: (linkId: number, newGroupId: number | null) => void;
  allLinksLabel?: string;
  addGroupLabel?: string;
  addLinkLabel?: string;
  settingsLabel?: string;
  viewModeGridLabel?: string;
  viewModeListLabel?: string;
  linkCountLabel?: (count: number) => string;
  groupLayoutTabsLabel?: string;
  groupLayoutListLabel?: string;
  groupsLabel?: string;
  collapseGroupsLabel?: string;
  expandGroupsLabel?: string;
  onCreateLink?: (linkData: CreateLinkRequest) => Promise<void>;
  onUpdateLink?: (id: number, linkData: UpdateLinkRequest) => Promise<void>;
  onDeleteLinkById?: (id: number) => Promise<void>;
  onCreateGroup?: (groupData: CreateGroupRequest) => Promise<void>;
  onUpdateGroup?: (id: number, groupData: UpdateGroupRequest) => Promise<void>;
  onDeleteGroupById?: (id: number) => Promise<void>;
  allowSystemEdit?: boolean;
  compactMode?: boolean;
  initialActiveGroupId?: number | null;
  className?: string;
}

export function NavigationView({
  groups,
  links,
  loading = false,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onReorderLinks,
  onReorderGroups,
  onAddLinkClick,
  onOpenSettings,
  onLinkMoved,
  allLinksLabel,
  addGroupLabel,
  addLinkLabel,
  settingsLabel,
  viewModeGridLabel,
  viewModeListLabel,
  linkCountLabel,
  groupLayoutTabsLabel,
  groupLayoutListLabel,
  groupsLabel,
  collapseGroupsLabel,
  expandGroupsLabel,
  onCreateLink,
  onUpdateLink,
  onDeleteLinkById,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroupById,
  allowSystemEdit = false,
  compactMode = false,
  initialActiveGroupId = null,
  className = ""
}: NavigationViewProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      emptyAll: 'No links found. Add your first link to get started!',
      emptyGroup: (name: string) => `No links in "${name}" group yet.`,
      groups: 'All',
      addGroup: 'Add Group',
      addLink: 'Add Link',
      settings: 'Settings',
      viewGrid: 'Switch to grid view',
      viewList: 'Switch to list view',
      groupLayoutTabs: 'Switch to group tabs',
      groupLayoutList: 'Switch to group list',
      collapseGroup: 'Collapse group',
      expandGroup: 'Expand group',
      systemGroup: 'System group',
      editGroup: 'Edit group',
      deleteGroup: 'Delete group',
      ungrouped: 'Ungrouped',
      noLinksInGroup: 'No links in this group yet.',
      addLinkHint: 'Create a new link',
      editMode: 'Edit',
      done: 'Done',
      editModeTitle: 'Enter edit mode',
      doneTitle: 'Exit edit mode',
      link: 'link',
      links: 'links'
    },
    zh: {
      emptyAll: '\u6682\u65e0\u94fe\u63a5\uff0c\u5148\u6dfb\u52a0\u4f60\u7684\u7b2c\u4e00\u4e2a\u94fe\u63a5\u3002',
      emptyGroup: (name: string) => `\u201c${name}\u201d\u5206\u7ec4\u6682\u65e0\u94fe\u63a5\u3002`,
      groups: '\u5168\u90e8',
      addGroup: '\u6dfb\u52a0\u5206\u7ec4',
      addLink: '\u6dfb\u52a0\u94fe\u63a5',
      settings: '\u8bbe\u7f6e',
      viewGrid: '\u5207\u6362\u5230\u5361\u7247\u89c6\u56fe',
      viewList: '\u5207\u6362\u5230\u5217\u8868\u89c6\u56fe',
      groupLayoutTabs: '\u5207\u6362\u5230\u5206\u7ec4\u6807\u7b7e',
      groupLayoutList: '\u5207\u6362\u5230\u5206\u7ec4\u5217\u8868',
      collapseGroup: '\u6298\u53e0\u5206\u7ec4',
      expandGroup: '\u5c55\u5f00\u5206\u7ec4',
      systemGroup: '\u7cfb\u7edf\u5206\u7ec4',
      editGroup: '\u7f16\u8f91\u5206\u7ec4',
      deleteGroup: '\u5220\u9664\u5206\u7ec4',
      ungrouped: '\u672a\u5206\u7ec4',
      noLinksInGroup: '\u8be5\u5206\u7ec4\u6682\u65e0\u94fe\u63a5\u3002',
      addLinkHint: '\u65b0\u5efa\u4e00\u4e2a\u94fe\u63a5',
      editMode: '\u7f16\u8f91',
      done: '\u5b8c\u6210',
      editModeTitle: '\u8fdb\u5165\u7f16\u8f91\u6a21\u5f0f',
      doneTitle: '\u9000\u51fa\u7f16\u8f91\u6a21\u5f0f',
      link: '\u6761\u94fe\u63a5',
      links: '\u6761\u94fe\u63a5'
    }
  } as const;
  const t = translations[language];
  const [activeGroupId, setActiveGroupId] = useState<number | null>(initialActiveGroupId);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [groupLayout, setGroupLayout] = useState<'tabs' | 'list'>('tabs');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canEdit = isEditMode;

  // Auto-select first group when groups are available and no group is selected
  useEffect(() => {
    if (groups.length > 0 && activeGroupId === null) {
      const firstGroup = [...groups].sort((a, b) => a.sortOrder - b.sortOrder)[0];
      if (firstGroup) {
        setActiveGroupId(Number(firstGroup.id));
      }
    }
  }, [groups, activeGroupId]);

  useEffect(() => {
    if (initialActiveGroupId === null || initialActiveGroupId === undefined) {
      return;
    }
    setActiveGroupId(Number(initialActiveGroupId));
  }, [initialActiveGroupId]);

  // Filter links based on active group
  const filteredLinks = activeGroupId === null
    ? links
    : links.filter(link => Number(link.groupId) === activeGroupId);

  // Sort links by sort order and favorites
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    // Favorites first
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    // Then by sort order
    return a.sortOrder - b.sortOrder;
  });

  const handleGroupSelect = (groupId: number | null) => {
    setActiveGroupId(groupId === null ? null : Number(groupId));
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const handleGroupLayoutToggle = () => {
    setGroupLayout(prevLayout => (prevLayout === 'tabs' ? 'list' : 'tabs'));
  };

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 180);
    return () => clearTimeout(timer);
  }, [viewMode, groupLayout]);

  const handleMoveToGroup = async (linkId: number, targetGroupId: number | null): Promise<void> => {
    try {
      // 导入linkService
      const { linkService } = await import('../../services/linkService');
      
      // 直接调用API更新groupId
      await linkService.updateLink(linkId, {
        groupId: targetGroupId === null ? undefined : targetGroupId
      });
      
      console.log(`✅ 链接 ${linkId} 已移动到分组 ${targetGroupId ?? '未分组'}`);
      
      // 通知父组件更新状态
      if (onLinkMoved) {
        onLinkMoved(linkId, targetGroupId);
      }
    } catch (error) {
      console.error('移动链接失败:', error);
      throw error; // 重新抛出错误让DraggableList知道失败了
    }
  };

  const handleLinkReorder = (reorderedLinks: WebsiteLink[]) => {
    const linkOrders: LinkOrder[] = reorderedLinks.map((link, index) => ({
      id: link.id,
      sortOrder: index
    }));
    onReorderLinks?.(linkOrders);
  };

  const handleGroupReorder = (reorderedGroups: Group[]) => {
    const groupOrders = reorderedGroups.map((group, index) => ({
      id: group.id,
      sortOrder: index
    }));
    onReorderGroups?.(groupOrders);
  };

  const getEmptyMessage = () => {
    if (activeGroupId === null) {
      return t.emptyAll;
    }
    const activeGroup = groups.find(g => Number(g.id) === activeGroupId);
    return activeGroup ? t.emptyGroup(activeGroup.name) : t.noLinksInGroup;
  };

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.sortOrder - b.sortOrder),
    [groups]
  );

  const groupedLinks = useMemo(() => {
    const map = new Map<number, WebsiteLink[]>();
    sortedGroups.forEach(group => {
      map.set(Number(group.id), []);
    });
    const ungrouped: WebsiteLink[] = [];
    links.forEach(link => {
      const groupId = Number(link.groupId);
      if (map.has(groupId)) {
        map.get(groupId)!.push(link);
      } else {
        ungrouped.push(link);
      }
    });
    return { map, ungrouped };
  }, [links, sortedGroups]);

  // Handle add link button
  const handleAddLink = (groupId?: number | null) => {
    if (onAddLinkClick) {
      onAddLinkClick(groupId);
    } else if (onCreateLink) {
      return;
    } else if (onEditLink) {
      onEditLink({} as WebsiteLink);
    }
  };

  const activeGroup = activeGroupId === null
    ? null
    : groups.find(g => Number(g.id) === activeGroupId) || null;

  return (
    <div className={`navigation-view ${isTransitioning ? 'view-transition' : ''} ${className}`}>
      <div className={`navigation-header ${groupLayout === 'tabs' ? 'tabs-header' : 'list-header'}`}>
        <div className="view-controls top-controls">
          <div className="view-actions">
            {/* 左侧按钮已移除 */}
          </div>
          
          <div className="view-tools">
            <button
              className="edit-mode-btn"
              onClick={() => setIsEditMode(prev => !prev)}
              title={isEditMode ? t.doneTitle : t.editModeTitle}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                {isEditMode ? (
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                ) : (
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                )}
              </svg>
            </button>
            
            {onOpenSettings && (
              <button
                className="settings-btn"
                onClick={onOpenSettings}
                title={settingsLabel || t.settings}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.11-.2-.36-.28-.57-.2l-2.39.96c-.5-.38-1.04-.7-1.64-.94l-.36-2.54A.487.487 0 0 0 14.84 2h-3.68c-.24 0-.44.17-.47.41l-.36 2.54c-.6.24-1.14.56-1.64.94l-2.39-.96c-.21-.08-.46 0-.57.2L2.81 8.41c-.11.2-.06.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.11.2.36.28.57.2l2.39-.96c.5.38 1.04.7 1.64.94l.36 2.54c.03.24.23.41.47.41h3.68c.24 0 .44-.17.47-.41l.36-2.54c.6-.24 1.14-.56 1.64-.94l2.39.96c.21.08.46 0 .57-.2l1.92-3.32c.11-.2.06-.47-.12-.61l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"/>
                </svg>
              </button>
            )}
            
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={handleViewModeToggle}
              title={viewMode === 'grid' ? (viewModeListLabel || t.viewList) : (viewModeGridLabel || t.viewGrid)}
            >
              {viewMode === 'grid' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 18h5v-6h-5v6zm-6 0h5V5H4v13zm6-10h5V5h-5v3zm6 0h5v-3h-5v3zm0 5h5v-6h-5v6zm0 5h5v-4h-5v4z"/>
                </svg>
              )}
            </button>

            <button
              className={`view-mode-btn ${groupLayout === 'list' ? 'active' : ''}`}
              onClick={handleGroupLayoutToggle}
              title={groupLayout === 'tabs' ? (groupLayoutListLabel || t.groupLayoutList) : (groupLayoutTabsLabel || t.groupLayoutTabs)}
            >
              {groupLayout === 'tabs' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 6h6v2H3V6zm0 5h6v2H3v-2zm0 5h6v2H3v-2zm8-10h10v2H11V6zm0 5h10v2H11v-2zm0 5h10v2H11v-2z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {groupLayout === 'tabs' ? (
          <DraggableGroupTabs
            groups={groups}
            activeGroupId={activeGroupId}
            onGroupSelect={handleGroupSelect}
            onAddGroup={canEdit ? onAddGroup : undefined}
            onEditGroup={canEdit ? onEditGroup : undefined}
            onDeleteGroup={canEdit ? onDeleteGroup : undefined}
            onReorderGroups={handleGroupReorder}
            allowSystemEdit={allowSystemEdit}
            showAllTab={false}
            allLabel={allLinksLabel}
            addGroupLabel={addGroupLabel}
            dragDisabled={!canEdit}
          />
        ) : (
          // 分组列表模式 - 统一使用UnifiedDraggableList支持跨组拖动
          <UnifiedDraggableList
            groups={sortedGroups}
            links={links}
            groupedLinks={groupedLinks}
            onLinkClick={onLinkClick}
            onEditLink={canEdit ? onEditLink : undefined}
            onDeleteLink={canEdit ? onDeleteLink : undefined}
            onToggleFavorite={onToggleFavorite}
            onReorderLinks={onReorderLinks}
            onLinkMoved={handleMoveToGroup}
            onEditGroup={canEdit ? onEditGroup : undefined}
            onDeleteGroup={canEdit ? onDeleteGroup : undefined}
            onAddGroup={canEdit ? onAddGroup : undefined}
            onAddLink={canEdit ? handleAddLink : undefined}
            allowSystemEdit={allowSystemEdit}
            compactMode={compactMode}
            dragDisabled={!canEdit}
            viewMode={viewMode}
            labels={{
              groups: groupsLabel || t.groups,
              addGroup: addGroupLabel || t.addGroup,
              addLink: addLinkLabel || t.addLink,
              addLinkHint: t.addLinkHint,
              ungrouped: t.ungrouped,
              editGroup: t.editGroup,
              deleteGroup: t.deleteGroup,
              systemGroup: t.systemGroup,
              noLinksInGroup: t.noLinksInGroup,
              collapseGroup: collapseGroupsLabel || t.collapseGroup,
              expandGroup: expandGroupsLabel || t.expandGroup
            }}
          />
        )}
        
      </div>
      
      {groupLayout === 'tabs' && (
        <div className="navigation-content">
          {activeGroup && (
            <div className="active-group-label">
              {activeGroup.name}
            </div>
          )}
          <DraggableCardGrid
            links={sortedLinks}
            onLinkClick={onLinkClick}
            onEditLink={canEdit ? onEditLink : undefined}
            onDeleteLink={canEdit ? onDeleteLink : undefined}
            onToggleFavorite={onToggleFavorite}
            onReorder={handleLinkReorder}
            loading={loading}
            emptyMessage={getEmptyMessage()}
            viewMode={viewMode}
            allowSystemEdit={allowSystemEdit}
            onAddLinkClick={canEdit && (onAddLinkClick || onCreateLink) ? () => handleAddLink(activeGroupId) : undefined}
            dragDisabled={!canEdit}
            addLinkLabel={addLinkLabel}
            compactMode={compactMode}
            showActions={canEdit}
          />
        </div>
      )}

      {/* Link and Group Management Modals */}
      {onCreateLink && onUpdateLink && onDeleteLinkById && 
       onCreateGroup && onUpdateGroup && onDeleteGroupById && (
        <LinkGroupManager
          groups={groups}
          links={links}
          onCreateLink={onCreateLink}
          onUpdateLink={onUpdateLink}
          onDeleteLink={onDeleteLinkById}
          onCreateGroup={onCreateGroup}
          onUpdateGroup={onUpdateGroup}
          onDeleteGroup={onDeleteGroupById}
        />
      )}
    </div>
  );
}
