import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserProfile } from '../components/auth';
import { NavigationView, GroupModal, LinkModal, Sidebar } from '../components/navigation';
import { SearchInterface } from '../components/navigation/SearchInterface';
import { SettingsModal, useNotifications, ScrollToTop, FeedbackModal, NotificationModal } from '../components/common';
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
import notificationService from '../services/notificationService';
import { api } from '../services/api';
import lakeBackground from '../assets/difusionastrouc-lake-6295829_1920.jpg';
import './DashboardPage.css';

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { gridSize, setGridSize } = useSettings();
  const { darkMode, setDarkMode, compactMode, setCompactMode } = useSettings();
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
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const hotGroupEnsuredRef = useRef(false);

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
      notificationsCenter: 'Notification Center',
      notificationsClear: 'Clear all',
      notificationsDelete: 'Delete',
      feedbackLabel: 'Feedback',
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
      title: '\u4f01\u4e1a\u7f51\u5740\u5bfc\u822a',
      addLink: '\u6dfb\u52a0\u94fe\u63a5',
      addGroup: '\u6dfb\u52a0\u5206\u7ec4',
      adminTools: '\u7ba1\u7406\u5de5\u5177',
      settings: '\u8bbe\u7f6e',
      viewGrid: '\u5207\u6362\u5230\u5361\u7247\u89c6\u56fe',
      viewList: '\u5207\u6362\u5230\u5217\u8868\u89c6\u56fe',
      groupLayoutTabs: '\u5207\u6362\u5230\u5206\u7ec4\u6807\u7b7e',
      groupLayoutList: '\u5207\u6362\u5230\u5206\u7ec4\u5217\u8868',
      groupsLabel: '\u5168\u90e8',
      collapseGroups: '\u6298\u53e0\u5206\u7ec4',
      expandGroups: '\u5c55\u5f00\u5206\u7ec4',
      settingsTitle: '\u8bbe\u7f6e',
      darkMode: '\u6df1\u8272\u6a21\u5f0f',
      compactMode: '\u7d27\u51d1\u663e\u793a',
      language: '\u8bed\u8a00',
      gridSize: '\u56fe\u6807\u5927\u5c0f',
      gridSizeSmall: '\u5c0f(\u6bcf\u884c\u66f4\u591a)',
      gridSizeMedium: '\u4e2d(\u9ed8\u8ba4)',
      gridSizeLarge: '\u5927(\u6bcf\u884c\u66f4\u5c11)',
      gridSizeExtraLarge: '\u7279\u5927(\u6bcf\u884c\u6700\u5c11)',
      english: '\u82f1\u6587',
      chinese: '\u4e2d\u6587',
      close: '\u5173\u95ed',
      notificationsLabel: '\u901a\u77e5',
      notificationsCenter: '\u901a\u77e5\u4e2d\u5fc3',
      notificationsClear: '\u6e05\u7a7a\u5168\u90e8',
      notificationsDelete: '\u5220\u9664',
      feedbackLabel: '\u53cd\u9988',
      notificationsEmpty: '\u6682\u65e0\u901a\u77e5\u3002',
      notificationsLoading: '\u52a0\u8f7d\u901a\u77e5\u4e2d...',
      markRead: '\u6807\u8bb0\u5df2\u8bfb',
      errorTitle: '\u9519\u8bef',
      retry: '\u91cd\u8bd5',
      notifications: {
        linkAddedTitle: '\u94fe\u63a5\u5df2\u6dfb\u52a0',
        linkAddedMessage: (name: string) => `"${name}" \u5df2\u6dfb\u52a0\u3002`,
        linkUpdatedTitle: '\u94fe\u63a5\u5df2\u66f4\u65b0',
        linkUpdatedMessage: (name: string) => `"${name}" \u5df2\u66f4\u65b0\u3002`,
        groupCreatedTitle: '\u5206\u7ec4\u5df2\u521b\u5efa',
        groupCreatedMessage: (name: string) => `"${name}" \u5df2\u6dfb\u52a0\u3002`,
        groupUpdatedTitle: '\u5206\u7ec4\u5df2\u66f4\u65b0',
        groupUpdatedMessage: (name: string) => `"${name}" \u5df2\u66f4\u65b0\u3002`
      },
      confirms: {
        deleteLink: (name: string) => `\u786e\u8ba4\u5220\u9664\u201c${name}\u201d\uff1f`,
        deleteGroup: (name: string) => `\u786e\u8ba4\u5220\u9664\u5206\u7ec4\u201c${name}\u201d\uff1f`
      },
      errors: {
        loadFailed: '\u52a0\u8f7d\u5bfc\u822a\u6570\u636e\u5931\u8d25\uff0c\u8bf7\u5237\u65b0\u91cd\u8bd5\u3002',
        saveLinkFailedTitle: '\u4fdd\u5b58\u94fe\u63a5\u5931\u8d25',
        saveLinkFailedMessage: '\u8bf7\u91cd\u8bd5\u3002',
        saveGroupFailedTitle: '\u4fdd\u5b58\u5206\u7ec4\u5931\u8d25',
        saveGroupFailedMessage: '\u8bf7\u91cd\u8bd5\u3002',
        openLinkFailed: '\u6253\u5f00\u94fe\u63a5\u5931\u8d25\u3002',
        toggleFavoriteFailed: '\u5207\u6362\u6536\u85cf\u5931\u8d25\u3002',
        deleteLinkFailed: '\u5220\u9664\u94fe\u63a5\u5931\u8d25\u3002',
        deleteGroupFailed: '\u5220\u9664\u5206\u7ec4\u5931\u8d25\u3002',
        reorderLinksFailed: '\u94fe\u63a5\u6392\u5e8f\u5931\u8d25\u3002',
        reorderGroupsFailed: '\u5206\u7ec4\u6392\u5e8f\u5931\u8d25\u3002'
      },
      sidebar: {
        mostVisited: '\u6700\u5e38\u8bbf\u95ee',
        favorites: '\u6536\u85cf\u5939',
        noMostVisited: '\u6682\u65e0\u8bbf\u95ee\u8bb0\u5f55',
        noFavorites: '\u6682\u65e0\u6536\u85cf',
        visits: '\u6b21'
      }
    }
  } as const;

  const t = translations[language];
  const allowSystemEdit = user?.role === 'admin';
  const userId = user?.id ?? null;

  const HOT_GROUP_ZH = '热门推荐';
  const HOT_GROUP_EN = 'Trending';
  const HOT_SEED_KEY = 'ui_hot_recommended_seeded_v1';
  const hotLinksEnsuredRef = useRef(false);

  const faviconUrlFor = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    } catch {
      return undefined;
    }
  };

  const recommendedSeedSites = useMemo(() => ([
    { name: '百度', url: 'https://www.baidu.com' },
    { name: '知乎', url: 'https://www.zhihu.com' },
    { name: '微信', url: 'https://weixin.qq.com' },
    { name: '哔哩哔哩', url: 'https://www.bilibili.com' },
    { name: '抖音', url: 'https://www.douyin.com' },
    { name: '百度网盘', url: 'https://pan.baidu.com' },
    { name: '淘宝', url: 'https://www.taobao.com' },
    { name: '京东', url: 'https://www.jd.com' }
  ]), []);

  const refreshConfigIfNeeded = useCallback(async () => {
    if (user?.role === 'admin') {
      return false;
    }
    try {
      const statusResponse = await api.get('/config/status');
      const currentVersion = statusResponse.data.data.status.version as number;
      const cachedVersion = Number(sessionStorage.getItem('configVersion') || '0');
      const shouldRefresh = !Number.isFinite(cachedVersion) || currentVersion > cachedVersion;
      if (shouldRefresh) {
        await api.post('/config/refresh');
        sessionStorage.setItem('configVersion', String(currentVersion));
        return true;
      }
    } catch (syncError) {
      console.warn('Failed to refresh config:', syncError);
    }
    return false;
  }, [user?.role]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await refreshConfigIfNeeded();

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
  }, [t.errors.loadFailed, refreshConfigIfNeeded]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (user?.role === 'admin') {
      return;
    }
    const checkAndRefresh = async () => {
      const refreshed = await refreshConfigIfNeeded();
      if (refreshed) {
        loadData();
      }
    };

    const interval = setInterval(checkAndRefresh, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshConfigIfNeeded, loadData, user?.role]);

  useEffect(() => {
    if (!allowSystemEdit || loading || hotGroupEnsuredRef.current) {
      return;
    }
    const existing = groups.find(group =>
      group.name === HOT_GROUP_ZH || group.name === HOT_GROUP_EN
    );
    if (existing) {
      hotGroupEnsuredRef.current = true;
      return;
    }
    hotGroupEnsuredRef.current = true;
    groupService.createGroup({
      name: HOT_GROUP_ZH,
      description: '',
      isSystemGroup: true,
      isDeletable: false
    }).then((created) => {
      setGroups(prev => [...prev, created]);
    }).catch((err) => {
      console.warn('Failed to create recommended group:', err);
      hotGroupEnsuredRef.current = false;
    });
  }, [allowSystemEdit, groups, loading]);


  const loadUnreadCount = useCallback(async () => {
    if (!userId) {
      return;
    }
    try {
      const unread = await notificationService.getNotifications(true);
      setNotificationUnreadCount(unread.length);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  }, [userId]);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  const handleOpenNotifications = () => {
    setNotificationModalOpen(true);
    loadUnreadCount();
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

  const recommendedGroup = useMemo(() => {
    return groups.find(group => group.name === HOT_GROUP_ZH || group.name === HOT_GROUP_EN) || null;
  }, [groups]);

  const recommendedLinks = useMemo(() => {
    if (!recommendedGroup) {
      return [];
    }
    return links.filter(link => Number(link.groupId) === Number(recommendedGroup.id));
  }, [links, recommendedGroup]);

  const normalGroups = useMemo(() => {
    if (!recommendedGroup) {
      return groups;
    }
    return groups.filter(group => Number(group.id) !== Number(recommendedGroup.id));
  }, [groups, recommendedGroup]);

  const normalLinks = useMemo(() => {
    if (!recommendedGroup) {
      return links;
    }
    return links.filter(link => Number(link.groupId) !== Number(recommendedGroup.id));
  }, [links, recommendedGroup]);

  useEffect(() => {
    if (!allowSystemEdit || loading || hotLinksEnsuredRef.current) {
      return;
    }
    if (localStorage.getItem(HOT_SEED_KEY) === 'true') {
      return;
    }
    if (!recommendedGroup) {
      return;
    }
    const existing = links.filter(link => Number(link.groupId) === Number(recommendedGroup.id));
    if (existing.length > 0) {
      localStorage.setItem(HOT_SEED_KEY, 'true');
      hotLinksEnsuredRef.current = true;
      return;
    }
    hotLinksEnsuredRef.current = true;
    (async () => {
      try {
        const createdLinks: WebsiteLink[] = [];
        for (const site of recommendedSeedSites) {
          const created = await linkService.createLink({
            name: site.name,
            url: site.url,
            groupId: Number(recommendedGroup.id),
            iconUrl: faviconUrlFor(site.url)
          });
          createdLinks.push(created);
        }
        if (createdLinks.length > 0) {
          setLinks(prev => [...prev, ...createdLinks]);
          localStorage.setItem(HOT_SEED_KEY, 'true');
        } else {
          hotLinksEnsuredRef.current = false;
        }
      } catch (err) {
        console.warn('Failed to seed recommended links:', err);
        hotLinksEnsuredRef.current = false;
      }
    })();
  }, [allowSystemEdit, loading, links, recommendedGroup, recommendedSeedSites]);

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
    <div
      className="dashboard-page immersive"
      style={{
        backgroundImage: `linear-gradient(160deg, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.05)), url(${lakeBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
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
          <UserProfile
            compact
            showLogout={false}
            onOpenFeedback={() => setFeedbackOpen(true)}
            onOpenNotifications={handleOpenNotifications}
            notificationUnreadCount={notificationUnreadCount}
          />
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
        <SearchInterface
          onLinkClick={handleLinkClick}
          onSearchResultsChange={() => {}}
          onQueryChange={() => {}}
          placeholder={language === 'zh'
            ? '\u5728\u7f51\u9875\u4e2d\u641c\u7d22\uff0c\u6216\u8005\u8f93\u5165\u4e00\u4e2a\u7f51\u5740'
            : 'Search the web or enter a URL'}
          searchEngines={[
            {
              id: 'baidu',
              label: language === 'zh' ? '\u767e\u5ea6' : 'Baidu',
              buildUrl: (query) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`
            },
            {
              id: 'bing',
              label: language === 'zh' ? '\u5fc5\u5e94' : 'Bing',
              buildUrl: (query) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`
            },
            {
              id: 'google',
              label: language === 'zh' ? '\u8c37\u6b4c' : 'Google',
              buildUrl: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`
            },
            {
              id: 'sogou',
              label: language === 'zh' ? '\u641c\u72d7' : 'Sogou',
              buildUrl: (query) => `https://www.sogou.com/web?query=${encodeURIComponent(query)}`
            },
            {
              id: 'so360',
              label: language === 'zh' ? '360' : '360 Search',
              buildUrl: (query) => `https://www.so.com/s?q=${encodeURIComponent(query)}`
            },
            {
              id: 'duckduckgo',
              label: 'DuckDuckGo',
              buildUrl: (query) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
            }
          ]}
          aiSearchEngines={[
            {
              id: 'deepseek',
              label: 'DeepSeek',
              buildUrl: (query) => `https://chat.deepseek.com/?q=${encodeURIComponent(query)}`
            },
            {
              id: 'doubao',
              label: '\u8c46\u5305',
              buildUrl: (query) => `https://www.doubao.com/?q=${encodeURIComponent(query)}`
            },
            {
              id: 'qwen',
              label: '\u901a\u4e49\u5343\u95ee',
              buildUrl: (query) => `https://tongyi.aliyun.com/?q=${encodeURIComponent(query)}`
            },
            {
              id: 'yiyan',
              label: '\u6587\u5fc3\u4e00\u8a00',
              buildUrl: (query) => `https://yiyan.baidu.com/?q=${encodeURIComponent(query)}`
            },
            {
              id: 'xinghuo',
              label: '\u8baf\u98de\u661f\u706b',
              buildUrl: (query) => `https://xinghuo.xfyun.cn/?q=${encodeURIComponent(query)}`
            },
            {
              id: 'kimi',
              label: 'Kimi',
              buildUrl: (query) => `https://kimi.moonshot.cn/?q=${encodeURIComponent(query)}`
            },
            {
              id: 'chatglm',
              label: '\u667a\u8c31\u6e05\u8a00',
              buildUrl: (query) => `https://chatglm.cn/?q=${encodeURIComponent(query)}`
            }
          ]}
          externalSearchUrl={(query) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`}
          disableInternalSearch={true}
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
              groups={normalGroups}
              links={normalLinks}
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
              recommendedGroup={recommendedGroup}
              recommendedLinks={recommendedLinks}
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
        language={language}
        onLanguageChange={setLanguage}
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        user={user}
        labels={{
          title: t.settingsTitle,
          darkMode: t.darkMode,
          compactMode: t.compactMode,
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

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />

      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => {
          setNotificationModalOpen(false);
          loadUnreadCount();
        }}
        labels={{
          title: t.notificationsCenter,
          empty: t.notificationsEmpty,
          loading: t.notificationsLoading,
          markRead: t.markRead,
          delete: t.notificationsDelete,
          clearAll: t.notificationsClear
        }}
      />

      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSave={handleSaveGroup}
        group={selectedGroup || undefined}
        mode={groupModalMode}
        existingGroups={groups}
        allowSystemGroup={allowSystemEdit}
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

      <ScrollToTop />
    </div>
  );
}




















