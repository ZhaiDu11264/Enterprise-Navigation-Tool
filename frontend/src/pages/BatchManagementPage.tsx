import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EnhancedNavigationView from '../components/navigation/EnhancedNavigationView';
import ImportExport from '../components/admin/ImportExport';
import { WebsiteLink, Group } from '../types';
import { linkService } from '../services/linkService';
import { groupService } from '../services/groupService';
import './BatchManagementPage.css';

const BatchManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState<WebsiteLink[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'navigation' | 'import-export'>('navigation');
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

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
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (link: WebsiteLink) => {
    // Update access count and open link
    // linkService.incrementAccessCount(link.id).catch(console.error);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleEditLink = (link: WebsiteLink) => {
    // Implement edit functionality
    console.log('Edit link:', link);
  };

  const handleDeleteLink = async (link: WebsiteLink) => {
    try {
      await linkService.deleteLink(link.id);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to delete link:', err);
      setError(err instanceof Error ? err.message : '删除链接失败');
    }
  };

  const handleToggleFavorite = async (link: WebsiteLink) => {
    try {
      await linkService.updateLink(link.id, { 
        isFavorite: !link.isFavorite 
      });
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      setError(err instanceof Error ? err.message : '更新收藏状态失败');
    }
  };

  if (!user) {
    return (
      <div className="batch-management-page">
        <div className="error-state">
          <h2>请先登录</h2>
          <p>您需要登录才能使用批量管理功能。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-management-page">
      <div className="page-header">
        <h1>批量管理</h1>
        <p>高效管理您的网址导航，支持批量选择、编辑、导入导出等功能。</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="page-tabs">
        <button
          className={`tab-button ${activeTab === 'navigation' ? 'active' : ''}`}
          onClick={() => setActiveTab('navigation')}
        >
          📋 批量选择管理
        </button>
        <button
          className={`tab-button ${activeTab === 'import-export' ? 'active' : ''}`}
          onClick={() => setActiveTab('import-export')}
        >
          📊 导入导出工具
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'navigation' && (
          <div className="navigation-tab">
            <div className="tab-description">
              <h3>批量选择管理</h3>
              <p>
                使用批量选择功能可以同时操作多个链接，包括删除、移动分组、编辑属性、导出等操作。
                点击"批量选择"按钮进入选择模式，然后选择需要操作的链接。
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
              <h3>导入导出工具</h3>
              <p>
                使用导入导出工具可以批量管理您的链接数据。支持CSV和Excel格式，
                可以导入新链接、导出现有数据，以及进行高级的批量操作。
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
            <span className="stat-label">总链接数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{groups.length}</span>
            <span className="stat-label">总分组数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{links.filter(l => l.isFavorite).length}</span>
            <span className="stat-label">收藏链接</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{links.filter(l => l.isSystemLink).length}</span>
            <span className="stat-label">系统链接</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchManagementPage;