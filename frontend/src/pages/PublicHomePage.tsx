import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { NavigationView } from '../components/navigation';
import { SearchInterface } from '../components/navigation/SearchInterface';
import { SettingsModal } from '../components/common';
import { GridSize } from '../contexts/SettingsContext';
import { Group, WebsiteLink } from '../types';
import { api } from '../services/api';
import lakeBackground from '../assets/difusionastrouc-lake-6295829_1920.jpg';
import './PublicHomePage.css';

type RecommendedSite = {
  name: string;
  url: string;
  iconUrl: string;
};

type PublicConfigGroup = {
  name: string;
  description?: string;
  sortOrder?: number;
  isSystemGroup?: boolean;
  isDeletable?: boolean;
};

type PublicConfigLink = {
  name: string;
  url: string;
  description?: string;
  iconUrl?: string;
  groupName: string;
  sortOrder?: number;
  isSystemLink?: boolean;
  isDeletable?: boolean;
};

const faviconUrlFor = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  } catch {
    return '';
  }
};

const createSites = (): RecommendedSite[] => ([
  { name: '\u767e\u5ea6', url: 'https://www.baidu.com', iconUrl: faviconUrlFor('https://www.baidu.com') },
  { name: '\u77e5\u4e4e', url: 'https://www.zhihu.com', iconUrl: faviconUrlFor('https://www.zhihu.com') },
  { name: '\u5fae\u4fe1', url: 'https://weixin.qq.com', iconUrl: faviconUrlFor('https://weixin.qq.com') },
  { name: '\u54d4\u54e9\u54d4\u54e9', url: 'https://www.bilibili.com', iconUrl: faviconUrlFor('https://www.bilibili.com') },
  { name: '\u6296\u97f3', url: 'https://www.douyin.com', iconUrl: faviconUrlFor('https://www.douyin.com') },
  { name: '\u767e\u5ea6\u7f51\u76d8', url: 'https://pan.baidu.com', iconUrl: faviconUrlFor('https://pan.baidu.com') },
  { name: '\u6dd8\u5b9d', url: 'https://www.taobao.com', iconUrl: faviconUrlFor('https://www.taobao.com') },
  { name: '\u4eac\u4e1c', url: 'https://www.jd.com', iconUrl: faviconUrlFor('https://www.jd.com') }
]);

export function PublicHomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const sites = useMemo(() => createSites(), []);

  const t = language === 'zh'
    ? {
      title: '\u4f01\u4e1a\u7f51\u5740\u5bfc\u822a',
        login: '\u767b\u5f55',
        settings: '\u8bbe\u7f6e',
        groupsLabel: '\u5168\u90e8',
        groupName: '\u70ed\u95e8\u63a8\u8350',
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
        editDisabledHint: '\u767b\u5f55\u540e\u53ef\u542f\u7528\u7f16\u8f91\u529f\u80fd'
      }
    : {
        title: 'Enterprise Navigation',
        login: 'Login',
        settings: 'Settings',
        groupsLabel: 'All',
        groupName: '热门推荐',
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
        editDisabledHint: 'Sign in to enable editing'
      };

  const [guestIconScale] = useState(() => {
    const raw = sessionStorage.getItem('guestIconScale');
    const value = raw ? Number(raw) : 1;
    return Number.isFinite(value) ? value : 1;
  });

  const GUEST_DEFAULTS_VERSION = 'v2';
  const shouldApplyGuestDefaults = () => {
    return sessionStorage.getItem('guestDefaultsVersion') !== GUEST_DEFAULTS_VERSION;
  };

  const [guestGridSize, setGuestGridSize] = useState<GridSize>(() => {
    if (shouldApplyGuestDefaults()) {
      return 'small';
    }
    const raw = sessionStorage.getItem('guestGridSize') as GridSize | null;
    return raw === 'small' || raw === 'medium' || raw === 'large' || raw === 'extra-large'
      ? raw
      : 'small';
  });

  const [guestDarkMode, setGuestDarkMode] = useState(() => {
    return sessionStorage.getItem('guestDarkMode') === 'true';
  });

  const [guestCompactMode, setGuestCompactMode] = useState(() => {
    if (shouldApplyGuestDefaults()) {
      return true;
    }
    return sessionStorage.getItem('guestCompactMode') === 'true';
  });

  const [showSettings, setShowSettings] = useState(false);

  const guestGridConfigs = {
    'small': {
      minWidth: '140px',
      compactMinWidth: '100px',
      iconScale: 0.7,
      textScale: 0.8,
      paddingScale: 0.7
    },
    'medium': {
      minWidth: '180px',
      compactMinWidth: '130px',
      iconScale: 0.85,
      textScale: 0.9,
      paddingScale: 0.85
    },
    'large': {
      minWidth: '220px',
      compactMinWidth: '160px',
      iconScale: 1,
      textScale: 1,
      paddingScale: 1
    },
    'extra-large': {
      minWidth: '280px',
      compactMinWidth: '200px',
      iconScale: 1.2,
      textScale: 1.1,
      paddingScale: 1.15
    }
  } as const;

  const activeGridConfig = guestGridConfigs[guestGridSize];
  const mergedIconScale = Number((activeGridConfig.iconScale * guestIconScale).toFixed(2));

  React.useEffect(() => {
    if (!shouldApplyGuestDefaults()) {
      return;
    }
    sessionStorage.setItem('guestDefaultsVersion', GUEST_DEFAULTS_VERSION);
    sessionStorage.setItem('guestGridSize', 'small');
    sessionStorage.setItem('guestCompactMode', 'true');
  }, []);

  const searchEngines = useMemo(() => ([
    {
      id: 'baidu',
      label: language === 'zh' ? '\u767e\u5ea6' : 'Baidu',
      buildUrl: (query: string) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`
    },
    {
      id: 'bing',
      label: language === 'zh' ? '\u5fc5\u5e94' : 'Bing',
      buildUrl: (query: string) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`
    },
    {
      id: 'google',
      label: language === 'zh' ? '\u8c37\u6b4c' : 'Google',
      buildUrl: (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`
    },
    {
      id: 'sogou',
      label: language === 'zh' ? '\u641c\u72d7' : 'Sogou',
      buildUrl: (query: string) => `https://www.sogou.com/web?query=${encodeURIComponent(query)}`
    },
    {
      id: 'so360',
      label: language === 'zh' ? '360' : '360 Search',
      buildUrl: (query: string) => `https://www.so.com/s?q=${encodeURIComponent(query)}`
    },
    {
      id: 'duckduckgo',
      label: 'DuckDuckGo',
      buildUrl: (query: string) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
    }
  ]), [language]);

  const aiSearchEngines = useMemo(() => ([
    {
      id: 'deepseek',
      label: 'DeepSeek',
      buildUrl: (query: string) => `https://chat.deepseek.com/?q=${encodeURIComponent(query)}`
    },
    {
      id: 'doubao',
      label: '\u8c46\u5305',
      buildUrl: (query: string) => `https://www.doubao.com/?q=${encodeURIComponent(query)}`
    },
    {
      id: 'qwen',
      label: '\u901a\u4e49\u5343\u95ee',
      buildUrl: (query: string) => `https://tongyi.aliyun.com/?q=${encodeURIComponent(query)}`
    },
    {
      id: 'yiyan',
      label: '\u6587\u5fc3\u4e00\u8a00',
      buildUrl: (query: string) => `https://yiyan.baidu.com/?q=${encodeURIComponent(query)}`
    },
    {
      id: 'xinghuo',
      label: '\u8baf\u98de\u661f\u706b',
      buildUrl: (query: string) => `https://xinghuo.xfyun.cn/?q=${encodeURIComponent(query)}`
    },
    {
      id: 'kimi',
      label: 'Kimi',
      buildUrl: (query: string) => `https://kimi.moonshot.cn/?q=${encodeURIComponent(query)}`
    },
    {
      id: 'chatglm',
      label: '\u667a\u8c31\u6e05\u8a00',
      buildUrl: (query: string) => `https://chatglm.cn/?q=${encodeURIComponent(query)}`
    }
  ]), []);

  const data = useMemo(() => {
    const now = new Date().toISOString();
    const groups: Group[] = [
      {
        id: 1,
        userId: 0,
        name: t.groupName,
        description: '',
        sortOrder: 0,
        isActive: true,
        isSystemGroup: true,
        isDeletable: false,
        createdAt: now,
        updatedAt: now
      }
    ];

    const links: WebsiteLink[] = sites.map((site, index) => ({
      id: index + 1,
      userId: 0,
      name: site.name,
      url: site.url,
      description: undefined,
      iconUrl: site.iconUrl || undefined,
      groupId: 1,
      sortOrder: index,
      isActive: true,
      isFavorite: false,
      accessCount: 0,
      isSystemLink: true,
      isDeletable: false,
      createdAt: now,
      updatedAt: now
    }));

    return { groups, links };
  }, [sites, t.groupName]);

  const [publicGroups, setPublicGroups] = useState<Group[] | null>(null);
  const [publicLinks, setPublicLinks] = useState<WebsiteLink[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadPublicConfig = async () => {
      try {
        const response = await api.get<{
          success: boolean;
          data: { groups: PublicConfigGroup[]; links: PublicConfigLink[] };
        }>('/public/config');
        const payload = response.data?.data;
        if (!payload || !Array.isArray(payload.groups) || !Array.isArray(payload.links)) {
          return;
        }

        const now = new Date().toISOString();
        const groupNameToId = new Map<string, number>();
        const mappedGroups: Group[] = payload.groups
          .filter(group => group.name !== '内部办公')
          .map((group, index) => {
          const id = index + 1;
          groupNameToId.set(group.name, id);
          return {
            id,
            userId: 0,
            name: group.name,
            description: group.description || '',
            sortOrder: group.sortOrder ?? index,
            isActive: true,
            isSystemGroup: group.isSystemGroup ?? true,
            isDeletable: group.isDeletable ?? false,
            createdAt: now,
            updatedAt: now
          };
        });

        const mappedLinks = payload.links.reduce<WebsiteLink[]>((acc, link, index) => {
          if (link.groupName === '内部办公') {
            return acc;
          }
          const groupId = groupNameToId.get(link.groupName);
          if (!groupId) {
            return acc;
          }
          acc.push({
            id: index + 1,
            userId: 0,
            name: link.name,
            url: link.url,
            description: link.description ?? undefined,
            iconUrl: link.iconUrl ?? undefined,
            groupId,
            sortOrder: link.sortOrder ?? index,
            isActive: true,
            isFavorite: false,
            accessCount: 0,
            isSystemLink: link.isSystemLink ?? true,
            isDeletable: link.isDeletable ?? false,
            createdAt: now,
            updatedAt: now
          });
          return acc;
        }, []);

        if (!cancelled) {
          setPublicGroups(mappedGroups.length ? mappedGroups : null);
          setPublicLinks(mappedLinks.length ? mappedLinks : null);
        }
      } catch (error) {
        console.warn('Failed to load public config:', error);
      }
    };

    loadPublicConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-page guest-home">
        <div className="public-loading">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLinkClick = (link: WebsiteLink) => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="dashboard-page guest-home"
      style={{
        backgroundImage: `linear-gradient(160deg, rgba(15, 23, 42, ${guestDarkMode ? '0.55' : '0.35'}), rgba(15, 23, 42, ${guestDarkMode ? '0.15' : '0.05'})), url(${lakeBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        ['--icon-scale' as any]: mergedIconScale,
        ['--grid-min-width' as any]: activeGridConfig.minWidth,
        ['--grid-compact-min-width' as any]: activeGridConfig.compactMinWidth,
        ['--text-scale' as any]: activeGridConfig.textScale,
        ['--padding-scale' as any]: activeGridConfig.paddingScale
      }}
    >
      <header className="dashboard-header guest-header">
        <h1>{t.title}</h1>
        <div className="header-actions">
          <Link to="/login" className="admin-link-btn">
            {t.login}
          </Link>
        </div>
      </header>

      <div className="search-section guest-search">
        <SearchInterface
          onLinkClick={handleLinkClick}
          onSearchResultsChange={() => {}}
          onQueryChange={() => {}}
          placeholder={language === 'zh'
            ? '\u5728\u767e\u5ea6\u4e2d\u641c\u7d22\uff0c\u6216\u8005\u8f93\u5165\u4e00\u4e2a\u7f51\u5740'
            : 'Search with Baidu or enter a URL'}
          searchEngines={searchEngines}
          aiSearchEngines={aiSearchEngines}
          externalSearchUrl={(query) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`}
          disableInternalSearch={true}
        />
      </div>

      <main className="dashboard-content guest-content">
        <NavigationView
          groups={publicGroups ?? data.groups}
          links={publicLinks ?? data.links}
          loading={false}
          onLinkClick={handleLinkClick}
          allLinksLabel={t.groupsLabel}
          groupsLabel={t.groupsLabel}
          showEditToggle={true}
          editToggleDisabled={true}
          editToggleDisabledTitle={t.editDisabledHint}
          onOpenSettings={() => setShowSettings(true)}
          settingsLabel={t.settings}
          compactMode={guestCompactMode}
        />
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={guestDarkMode}
        onToggleDarkMode={() => {
          setGuestDarkMode(prev => {
            const next = !prev;
            sessionStorage.setItem('guestDarkMode', String(next));
            return next;
          });
        }}
        compactMode={guestCompactMode}
        onToggleCompactMode={() => {
          setGuestCompactMode(prev => {
            const next = !prev;
            sessionStorage.setItem('guestCompactMode', String(next));
            return next;
          });
        }}
        language={language}
        onLanguageChange={setLanguage}
        gridSize={guestGridSize}
        onGridSizeChange={(size) => {
          setGuestGridSize(size);
          sessionStorage.setItem('guestGridSize', size);
        }}
        user={null}
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
          close: t.close
        }}
      />
    </div>
  );
}
