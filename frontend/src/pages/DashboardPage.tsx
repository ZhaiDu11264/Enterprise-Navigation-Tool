import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserProfile } from '../components/auth';
import { NavigationView, GroupModal, LinkModal, Sidebar } from '../components/navigation';
import { ModernSearchBar } from '../components/navigation/ModernSearchBar';
import { SettingsModal, useNotifications, Footer, ScrollToTop } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import {
  WebsiteLink,
  Group,
  LinkOrder,
  CreateGroupRequest,
  UpdateGroupRequest,
  CreateLinkRequest,
  UpdateLinkRequest
} from '../types';
import { linkService } from '../services/linkService';
import { groupService } from '../services/groupService';
import notificationService, { UserNotification } from '../services/notificationService';
import { api } from '../services/api';
import './DashboardPage.css';

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { gridSize, setGridSize } = useSettings();
  const { darkMode, setDarkMode, compactMode, setCompactMode, transparentMode, setTransparentMode } = useSettings();
  const [groups, setGroups] = useState<Group[]>([]);
  const [links, setLinks] = useState<WebsiteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotifications();
  const [showSettings, setShowSettings] = useState(false);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkModalMode, setLinkModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLink, setSelectedLink] = useState<WebsiteLink | null>(null);
  const [defaultLinkGroupId, setDefaultLinkGroupId] = useState<number | null>(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState<UserNotification[]>([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const initialGroupParam = searchParams.get('groupId');
  const initialGroupId = initialGroupParam ? Number(initialGroupParam) : null;

  const translations = {
    en: {
      title: 'Enterprise Navigation Tool',
      addLink: 'Add Link',
      addGroup: 'Add Group',
      adminTools: 'Admin Tools',
      settings: 'Settings',
      viewGrid: 'Switch to grid view',
      viewList: 'Switch to list view',
      groupLayoutTabs: 'Switch to group tabs',
      groupLayoutList: 'Switch to group list',
      groupsLabel: 'All',
      collapseGroups: 'Collapse groups',
      expandGroups: 'Expand groups',
      settingsTitle: 'Settings',
      darkMode: 'Dark mode',
      compactMode: 'Compact view',
      transparentMode: 'Transparent mode',
      language: 'Language',
      gridSize: 'Icon Size',
      gridSizeSmall: 'Small (More per row)',
      gridSizeMedium: 'Medium (Default)',
      gridSizeLarge: 'Large (Fewer per row)',
      gridSizeExtraLarge: 'Extra Large (Fewest per row)',
      english: 'English',
      chinese: 'Chinese',
      close: 'Close',
      notificationsLabel: 'Notifications',
      notificationsEmpty: 'No notifications yet.',
      notificationsLoading: 'Loading notifications...',
      markRead: 'Mark read',
      errorTitle: 'Error',
      retry: 'Try Again',
      notifications: {
        linkAddedTitle: 'Link added',
        linkAddedMessage: (name: string) => `"${name}" has been added.`,
        linkUpdatedTitle: 'Link updated',
        linkUpdatedMessage: (name: string) => `"${name}" has been updated.`,
        groupCreatedTitle: 'Group created',
        groupCreatedMessage: (name: string) => `"${name}" has been added.`,
        groupUpdatedTitle: 'Group updated',
        groupUpdatedMessage: (name: string) => `"${name}" has been updated.`
      },
      confirms: {
        deleteLink: (name: string) => `Are you sure you want to delete "${name}"?`,
        deleteGroup: (name: string) => `Are you sure you want to delete the "${name}" group?`
      },
      errors: {
        loadFailed: 'Failed to load your navigation data. Please try refreshing the page.',
        saveLinkFailedTitle: 'Failed to save link',
        saveLinkFailedMessage: 'Please try again.',
        saveGroupFailedTitle: 'Failed to save group',
        saveGroupFailedMessage: 'Please try again.',
        openLinkFailed: 'Failed to open link.',
        toggleFavoriteFailed: 'Failed to toggle favorite.',
        deleteLinkFailed: 'Failed to delete link.',
        deleteGroupFailed: 'Failed to delete group.',
        reorderLinksFailed: 'Failed to reorder links.',
        reorderGroupsFailed: 'Failed to reorder groups.'
      },
      sidebar: {
        mostVisited: 'Most Visited',
        favorites: 'Favorites',
        noMostVisited: 'No visit history yet',
        noFavorites: 'No favorites yet',
        visits: 'visits'
      }
    },
    zh: {
      title: '企业网址导航',
      addLink: '添加链接',
      addGroup: '添加分组',
      adminTools: '管理工具',
      settings: '设置',
      viewGrid: '切换到卡片视图',
      viewList: '切换到列表视图',
      groupLayoutTabs: '切换到分组标签',
      groupLayoutList: '切换到分组列表',
      groupsLabel: '全部',
      collapseGroups: '折叠分组',
      expandGroups: '展开分组',
      settingsTitle: '设置',
      darkMode: '深色模式',
      compactMode: '简约显示',
      transparentMode: '通透模式',
      language: '语言',
      gridSize: '图标大小',
      gridSizeSmall: '小 (每行更多)',
      gridSizeMedium: '中 (默认)',
      gridSizeLarge: '大 (每行更少)',
      gridSizeExtraLarge: '特大 (每行最少)',
      english: '英文',
      chinese: '中文',
      close: '关闭',
      notificationsLabel: '通知',
      notificationsEmpty: '暂无通知。',
      notificationsLoading: '加载通知中...',
      markRead: '标记已读',
      errorTitle: '错误',
      retry: '重试',
      notifications: {
        linkAddedTitle: '链接已添加',
        linkAddedMessage: (name: string) => `“${name}”已添加。`,
        linkUpdatedTitle: '链接已更新',
        linkUpdatedMessage: (name: string) => `“${name}”已更新。`,
        groupCreatedTitle: '分组已创建',
        groupCreatedMessage: (name: string) => `“${name}”已添加。`,
        groupUpdatedTitle: '分组已更新',
        groupUpdatedMessage: (name: string) => `“${name}”已更新。`
      },
      confirms: {
        deleteLink: (name: string) => `确认删除“${name}”？`,
        deleteGroup: (name: string) => `确认删除分组“${name}”？`
      },
      errors: {
        loadFailed: '加载导航数据失败，请刷新重试。',
        saveLinkFailedTitle: '保存链接失败',
        saveLinkFailedMessage: '请重试。',
        saveGroupFailedTitle: '保存分组失败',
        saveGroupFailedMessage: '请重试。',
        openLinkFailed: '打开链接失败。',
        toggleFavoriteFailed: '切换收藏失败。',
        deleteLinkFailed: '删除链接失败。',
        deleteGroupFailed: '删除分组失败。',
        reorderLinksFailed: '链接排序失败。',
        reorderGroupsFailed: '分组排序失败。'
      },
      sidebar: {
        mostVisited: '最常访问',
        favorites: '收藏夹',
        noMostVisited: '暂无访问记录',
        noFavorites: '暂无收藏',
        visits: '次'
      }
    }
  } as const;

  const t = translations[language];
  const allowSystemEdit = user?.role === 'admin';
  const userId = user?.id ?? null;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.role !== 'admin') {
        try {
          const statusResponse = await api.get('/config/status');
          const currentVersion = statusResponse.data.data.status.version as number;
          const cachedVersion = Number(sessionStorage.getItem('configVersion') || '0');
          const shouldRefresh = !Number.isFinite(cachedVersion) || currentVersion > cachedVersion;
          if (shouldRefresh) {
            await api.post('/config/refresh');
            sessionStorage.setItem('configVersion', String(currentVersion));
          }
        } catch (syncError) {
          console.warn('配置同步失败（可能没有默认配置）:', syncError);
        }
      }

      linkService.clearCache();

      const [groupsData, linksData] = await Promise.all([
        groupService.getGroups(),
        linkService.getLinks()
      ]);

      setGroups(groupsData);
      setLinks(linksData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(t.errors.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [t.errors.loadFailed, user?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadUnreadCount = useCallback(async () => {
    if (!userId) {
      return;
    }
    try {
      const unread = await notificationService.getNotifications(true);
      setNotificationUnreadCount(unread.length);
    } catch (err) {
      console.warn('Failed to load notification count:', err);
    }
  }, [userId]);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      return;
    }
    try {
      setNotificationLoading(true);
      const data = await notificationService.getNotifications();
      setNotificationItems(data);
      setNotificationUnreadCount(data.filter(item => !item.readAt).length);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setNotificationLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  useEffect(() => {
    if (!notificationOpen) {
      return;
    }
    loadNotifications();
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen, loadNotifications]);

  const handleNotificationToggle = () => {
    setNotificationOpen(prev => !prev);
  };

  const handleNotificationRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotificationItems(prev =>
        prev.map(item => item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item)
      );
      setNotificationUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleLinkClick = async (link: WebsiteLink) => {
    try {
      linkService.trackAccess(link.id).catch(console.error);
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to open link:', err);
      showError(t.errorTitle, t.errors.openLinkFailed);
    }
  };

  const handleToggleFavorite = async (link: WebsiteLink) => {
    try {
      const updatedLink = await linkService.toggleFavorite(link.id, !link.isFavorite);
      setLinks(prevLinks => prevLinks.map(item => item.id === link.id ? updatedLink : item));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      showError(t.errorTitle, t.errors.toggleFavoriteFailed);
    }
  };

  const handleSaveLink = async (linkData: CreateLinkRequest | UpdateLinkRequest) => {
    if (linkModalMode === 'create') {
      const created = await linkService.createLink(linkData as CreateLinkRequest);
      setLinks(prev => [...prev, created]);
    } else if (selectedLink) {
      const updated = await linkService.updateLink(selectedLink.id, linkData as UpdateLinkRequest);
      setLinks(prev => prev.map(item => item.id === updated.id ? updated : item));
    }
  };

  const handleSaveGroup = async (groupData: CreateGroupRequest | UpdateGroupRequest) => {
    try {
      if (groupModalMode === 'create') {
        const created = await groupService.createGroup(groupData as CreateGroupRequest);
        setGroups(prev => [...prev, created]);
        showSuccess(t.notifications.groupCreatedTitle, t.notifications.groupCreatedMessage(created.name));
      } else if (selectedGroup) {
        const updated = await groupService.updateGroup(selectedGroup.id, groupData as UpdateGroupRequest);
        setGroups(prev => prev.map(item => item.id === updated.id ? updated : item));
        showSuccess(t.notifications.groupUpdatedTitle, t.notifications.groupUpdatedMessage(updated.name));
      }
    } catch (err: any) {
      showError(t.errors.saveGroupFailedTitle, err?.message || t.errors.saveGroupFailedMessage);
      throw err;
    }
  };

  const handleDeleteLink = async (link: WebsiteLink) => {
    if (!window.confirm(t.confirms.deleteLink(link.name))) {
      return;
    }
    try {
      await linkService.deleteLink(link.id);
      setLinks(prev => prev.filter(item => item.id !== link.id));
    } catch (err) {
      console.error('Failed to delete link:', err);
      showError(t.errorTitle, t.errors.deleteLinkFailed);
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    if (!window.confirm(t.confirms.deleteGroup(group.name))) {
      return;
    }
    try {
      await groupService.deleteGroup(group.id);
      setGroups(prev => prev.filter(item => item.id !== group.id));
      setLinks(prev => prev.filter(link => link.groupId !== group.id));
    } catch (err) {
      console.error('Failed to delete group:', err);
      showError(t.errorTitle, t.errors.deleteGroupFailed);
    }
  };

  const handleReorderLinks = async (linkOrders: LinkOrder[]) => {
    try {
      await linkService.reorderLinks(linkOrders);
      setLinks(prev =>
        prev.map(link => {
          const order = linkOrders.find(item => item.id === link.id);
          return order ? { ...link, sortOrder: order.sortOrder, groupId: order.groupId ?? link.groupId } : link;
        })
      );
    } catch (err) {
      console.error('Failed to reorder links:', err);
      showError(t.errorTitle, t.errors.reorderLinksFailed);
      loadData();
    }
  };

  const handleReorderGroups = async (groupOrders: { id: number; sortOrder: number }[]) => {
    try {
      await groupService.reorderGroups(groupOrders);
      setGroups(prev =>
        prev.map(group => {
          const order = groupOrders.find(item => item.id === group.id);
          return order ? { ...group, sortOrder: order.sortOrder } : group;
        })
      );
    } catch (err) {
      console.error('Failed to reorder groups:', err);
      showError(t.errorTitle, t.errors.reorderGroupsFailed);
      loadData();
    }
  };

  const handleLinkMoved = (linkId: number, newGroupId: number | null) => {
    setLinks(prev =>
      prev.map(link => link.id === linkId ? { ...link, groupId: Number(newGroupId) } : link)
    );
  };

  const handleCreateGroup = () => {
    setGroupModalMode('create');
    setSelectedGroup(null);
    setGroupModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setGroupModalMode('edit');
    setSelectedGroup(group);
    setGroupModalOpen(true);
  };

  const handleCreateLink = (groupId?: number | null) => {
    setLinkModalMode('create');
    setSelectedLink(null);
    setDefaultLinkGroupId(groupId ?? null);
    setLinkModalOpen(true);
  };

  const handleEditLink = (link: WebsiteLink) => {
    setLinkModalMode('edit');
    setSelectedLink(link);
    setDefaultLinkGroupId(null);
    setLinkModalOpen(true);
  };

  const mostVisitedLinks = useMemo(() => {
    return [...links]
      .filter(link => link.accessCount > 0)
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);
  }, [links]);

  const favoriteLinks = useMemo(() => {
    return [...links]
      .filter(link => link.isFavorite)
      .sort((a, b) => b.accessCount - a.accessCount);
  }, [links]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>{t.title}</h1>
        <div className="header-actions">
          {user?.role === 'admin' && (
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => navigate('/admin')}
            >
              {t.adminTools}
            </button>
          )}
          <div className="notification-bell" ref={notificationRef}>
            <button
              type="button"
              className="notification-bell-btn"
              onClick={handleNotificationToggle}
              aria-label={t.notificationsLabel}
            >
              <span className="notification-bell-icon">🔔</span>
              {notificationUnreadCount > 0 && (
                <span className="notification-badge">{notificationUnreadCount}</span>
              )}
            </button>
            {notificationOpen && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">{t.notificationsLabel}</div>
                <div className="notification-dropdown-list">
                  {notificationLoading ? (
                    <div className="notification-dropdown-empty">{t.notificationsLoading}</div>
                  ) : notificationItems.length === 0 ? (
                    <div className="notification-dropdown-empty">{t.notificationsEmpty}</div>
                  ) : (
                    notificationItems.map(item => (
                      <div
                        key={item.id}
                        className={`notification-dropdown-item ${item.readAt ? 'read' : 'unread'}`}
                      >
                        <div className="notification-dropdown-title">{item.title}</div>
                        <div className="notification-dropdown-message">{item.message}</div>
                        <div className="notification-dropdown-meta">
                          <span>{new Date(item.createdAt).toLocaleString()}</span>
                          {!item.readAt && (
                            <button
                              type="button"
                              className="notification-dropdown-action"
                              onClick={() => handleNotificationRead(item.id)}
                            >
                              {t.markRead}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <UserProfile compact showLogout={false} />
        </div>
      </header>

      {!error && (
        <Sidebar
          mostVisited={mostVisitedLinks}
          favorites={favoriteLinks}
          onLinkClick={handleLinkClick}
          onToggleFavorite={(linkId) => {
            const target = links.find(link => link.id === linkId);
            if (target) {
              handleToggleFavorite(target);
            }
          }}
          labels={t.sidebar}
        />
      )}

      <div className="search-section">
        <ModernSearchBar
          onLinkClick={handleLinkClick}
          onSearchResultsChange={(results: WebsiteLink[]) => {
            console.log('Search results:', results);
          }}
          onQueryChange={(query: string) => {
            console.log('Search query:', query);
          }}
          centered={true}
          showSearchEngines={true}
        />
      </div>

      <main className="dashboard-content">
        {error ? (
          <div className="error-message">
            <h3>{t.errorTitle}</h3>
            <p>{error}</p>
            <button onClick={loadData} className="retry-btn">
              {t.retry}
            </button>
          </div>
        ) : (
          <>
            <NavigationView
              groups={groups}
              links={links}
              loading={loading}
              onLinkClick={handleLinkClick}
              onEditLink={handleEditLink}
              onDeleteLink={handleDeleteLink}
              onToggleFavorite={handleToggleFavorite}
              onAddGroup={handleCreateGroup}
              onEditGroup={handleEditGroup}
              onDeleteGroup={handleDeleteGroup}
              onReorderLinks={handleReorderLinks}
              onReorderGroups={handleReorderGroups}
              onAddLinkClick={handleCreateLink}
              onOpenSettings={() => setShowSettings(true)}
              onLinkMoved={handleLinkMoved}
              allLinksLabel={t.groupsLabel}
              addGroupLabel={t.addGroup}
              addLinkLabel={t.addLink}
              settingsLabel={t.settings}
              viewModeGridLabel={t.viewGrid}
              viewModeListLabel={t.viewList}
              groupLayoutTabsLabel={t.groupLayoutTabs}
              groupLayoutListLabel={t.groupLayoutList}
              groupsLabel={t.groupsLabel}
              collapseGroupsLabel={t.collapseGroups}
              expandGroupsLabel={t.expandGroups}
              allowSystemEdit={allowSystemEdit}
              compactMode={compactMode}
              initialActiveGroupId={initialGroupId}
            />
          </>
        )}
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        compactMode={compactMode}
        onToggleCompactMode={() => setCompactMode(!compactMode)}
        transparentMode={transparentMode}
        onToggleTransparentMode={() => setTransparentMode(!transparentMode)}
        language={language}
        onLanguageChange={setLanguage}
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        user={user}
        labels={{
          title: t.settingsTitle,
          darkMode: t.darkMode,
          compactMode: t.compactMode,
          transparentMode: t.transparentMode,
          language: t.language,
          gridSize: t.gridSize,
          gridSizeSmall: t.gridSizeSmall,
          gridSizeMedium: t.gridSizeMedium,
          gridSizeLarge: t.gridSizeLarge,
          gridSizeExtraLarge: t.gridSizeExtraLarge,
          english: t.english,
          chinese: t.chinese,
          close: t.close,
          adminTools: t.adminTools
        }}
      />

      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSave={handleSaveGroup}
        group={selectedGroup || undefined}
        mode={groupModalMode}
        existingGroups={groups}
      />

      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSave={handleSaveLink}
        link={selectedLink || undefined}
        groups={groups}
        mode={linkModalMode}
        defaultGroupId={defaultLinkGroupId ?? undefined}
      />

      <Footer />
      <ScrollToTop />
    </div>
  );
}
