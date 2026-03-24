import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import EnhancedNavigationView from '../components/navigation/EnhancedNavigationView';
import ImportExport from '../components/admin/ImportExport';
import { WebsiteLink, Group } from '../types';
import { linkService } from '../services/linkService';
import { groupService } from '../services/groupService';
import './BatchManagementPage.css';

const BatchManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [links, setLinks] = useState<WebsiteLink[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'navigation' | 'import-export'>('navigation');
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      errors: {
        loadDataFailed: 'Failed to load data',
        deleteLinkFailed: 'Failed to delete link',
        updateFavoriteFailed: 'Failed to update favorite status'
      },
      auth: {
        loginRequiredTitle: 'Please sign in first',
        loginRequiredDesc: 'You need to sign in to use batch management.'
      },
      page: {
        title: 'Batch Management',
        subtitle: 'Manage navigation links efficiently with batch selection, editing, import, and export.',
        closeError: 'Close error'
      },
      tabs: {
        navigation: 'Batch Selection',
        importExport: 'Import / Export'
      },
      sections: {
        navigationTitle: 'Batch Selection Management',
        navigationDesc: 'Use batch selection to operate on multiple links at once, including delete, move, edit, and export.',
        navigationDesc2: 'Click the batch selection button to enter selection mode, then choose the links you want to manage.',
        importExportTitle: 'Import / Export Tools',
        importExportDesc: 'Import/export tools help manage link data in bulk. CSV and Excel formats are supported.',
        importExportDesc2: 'You can import new links, export existing data, and perform advanced batch operations.'
      },
      stats: {
        totalLinks: 'Total Links',
        totalGroups: 'Total Groups',
        favoriteLinks: 'Favorites',
        systemLinks: 'System Links'
      }
    },
    zh: {
      errors: {
        loadDataFailed: '加载数据失败',
        deleteLinkFailed: '删除链接失败',
        updateFavoriteFailed: '更新收藏状态失败'
      },
      auth: {
        loginRequiredTitle: '请先登录',
        loginRequiredDesc: '您需要登录才能使用批量管理功能。'
      },
      page: {
        title: '批量管理',
        subtitle: '高效管理您的网址导航，支持批量选择、编辑、导入导出等功能。',
        closeError: '关闭错误'
      },
      tabs: {
        navigation: '批量选择管理',
        importExport: '导入导出工具'
      },
      sections: {
        navigationTitle: '批量选择管理',
        navigationDesc: '使用批量选择功能可以同时操作多个链接，包括删除、移动分组、编辑属性、导出等操作。',
        navigationDesc2: '点击“批量选择”按钮进入选择模式，然后选择需要操作的链接。',
        importExportTitle: '导入导出工具',
        importExportDesc: '使用导入导出工具可以批量管理您的链接数据。支持 CSV 和 Excel 格式。',
        importExportDesc2: '可以导入新链接、导出现有数据，以及进行高级的批量操作。'
      },
      stats: {
        totalLinks: '总链接数',
        totalGroups: '总分组数',
        favoriteLinks: '收藏链接',
        systemLinks: '系统链接'
      }
    }
  } as const;

  const t = translations[language];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [linksData, groupsData] = await Promise.all([
        linkService.getLinks(),
        groupService.getGroups()
      ]);

      setLinks(linksData);
      setGroups(groupsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : t.errors.loadDataFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (link: WebsiteLink) => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleEditLink = (link: WebsiteLink) => {
    console.log('Edit link:', link);
  };

  const handleDeleteLink = async (link: WebsiteLink) => {
    try {
      await linkService.deleteLink(link.id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete link:', err);
      setError(err instanceof Error ? err.message : t.errors.deleteLinkFailed);
    }
  };

  const handleToggleFavorite = async (link: WebsiteLink) => {
    try {
      await linkService.updateLink(link.id, {
        isFavorite: !link.isFavorite
      });
      await loadData();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      setError(err instanceof Error ? err.message : t.errors.updateFavoriteFailed);
    }
  };

  if (!user) {
    return (
      <div className="batch-management-page">
        <div className="error-state">
          <h2>{t.auth.loginRequiredTitle}</h2>
          <p>{t.auth.loginRequiredDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-management-page">
      <div className="page-header">
        <h1>{t.page.title}</h1>
        <p>{t.page.subtitle}</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label={t.page.closeError}>×</button>
        </div>
      )}

      <div className="page-tabs">
        <button
          className={`tab-button ${activeTab === 'navigation' ? 'active' : ''}`}
          onClick={() => setActiveTab('navigation')}
        >
          {t.tabs.navigation}
        </button>
        <button
          className={`tab-button ${activeTab === 'import-export' ? 'active' : ''}`}
          onClick={() => setActiveTab('import-export')}
        >
          {t.tabs.importExport}
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'navigation' && (
          <div className="navigation-tab">
            <div className="tab-description">
              <h3>{t.sections.navigationTitle}</h3>
              <p>
                {t.sections.navigationDesc} {t.sections.navigationDesc2}
              </p>
            </div>

            <EnhancedNavigationView
              groups={groups}
              links={links}
              loading={loading}
              onLinkClick={handleLinkClick}
              onEditLink={handleEditLink}
              onDeleteLink={handleDeleteLink}
              onToggleFavorite={handleToggleFavorite}
              onRefresh={loadData}
            />
          </div>
        )}

        {activeTab === 'import-export' && (
          <div className="import-export-tab">
            <div className="tab-description">
              <h3>{t.sections.importExportTitle}</h3>
              <p>
                {t.sections.importExportDesc} {t.sections.importExportDesc2}
              </p>
            </div>

            <ImportExport />
          </div>
        )}
      </div>

      <div className="page-footer">
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-value">{links.length}</span>
            <span className="stat-label">{t.stats.totalLinks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{groups.length}</span>
            <span className="stat-label">{t.stats.totalGroups}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{links.filter(l => l.isFavorite).length}</span>
            <span className="stat-label">{t.stats.favoriteLinks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{links.filter(l => l.isSystemLink).length}</span>
            <span className="stat-label">{t.stats.systemLinks}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchManagementPage;
