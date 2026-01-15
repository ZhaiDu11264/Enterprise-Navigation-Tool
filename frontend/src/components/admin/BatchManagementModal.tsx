import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import EnhancedNavigationView from '../navigation/EnhancedNavigationView';
import ImportExport from './ImportExport';
import { WebsiteLink, Group } from '../../types';
import { linkService } from '../../services/linkService';
import { groupService } from '../../services/groupService';
import './BatchManagementModal.css';

interface BatchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const BatchManagementModal: React.FC<BatchManagementModalProps> = ({
  isOpen,
  onClose,
  onRefresh
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [links, setLinks] = useState<WebsiteLink[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'selection' | 'import-export'>('selection');
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: 'Batch Management',
      description: 'Efficiently manage your navigation links with batch operations.',
      selectionTab: 'Batch Selection',
      importExportTab: 'Import/Export',
      selectionDesc: 'Select multiple links and perform batch operations like delete, move, edit, and export.',
      importExportDesc: 'Import links from CSV/Excel files or export your data for backup and migration.',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry'
    },
    zh: {
      title: '批量管理',
      description: '高效管理您的网址导航，支持批量选择、编辑、导入导出等功能。',
      selectionTab: '批量选择',
      importExportTab: '导入导出',
      selectionDesc: '选择多个链接并执行批量操作，如删除、移动、编辑和导出。',
      importExportDesc: '从CSV/Excel文件导入链接或导出数据进行备份和迁移。',
      close: '关闭',
      loading: '加载中...',
      error: '错误',
      retry: '重试'
    }
  };

  const t = translations[language];

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

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
    linkService.trackAccess(link.id).catch(console.error);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleEditLink = (link: WebsiteLink) => {
    // Implement edit functionality or emit event to parent
    console.log('Edit link:', link);
  };

  const handleDeleteLink = async (link: WebsiteLink) => {
    try {
      await linkService.deleteLink(link.id);
      await loadData(); // Refresh data
      onRefresh?.(); // Notify parent to refresh
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
      onRefresh?.(); // Notify parent to refresh
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      setError(err instanceof Error ? err.message : '更新收藏状态失败');
    }
  };

  const handleDataRefresh = async () => {
    await loadData();
    onRefresh?.(); // Notify parent to refresh main view
  };

  if (!isOpen) return null;

  return (
    <div className="batch-management-modal-overlay">
      <div className="batch-management-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2>{t.title}</h2>
            <p>{t.description}</p>
          </div>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t.close}
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'selection' ? 'active' : ''}`}
            onClick={() => setActiveTab('selection')}
          >
            📋 {t.selectionTab}
          </button>
          <button
            className={`tab-btn ${activeTab === 'import-export' ? 'active' : ''}`}
            onClick={() => setActiveTab('import-export')}
          >
            📊 {t.importExportTab}
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {activeTab === 'selection' && (
            <div className="selection-tab">
              <div className="tab-description">
                <p>{t.selectionDesc}</p>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>{t.loading}</p>
                </div>
              ) : (
                <EnhancedNavigationView
                  groups={groups}
                  links={links}
                  loading={loading}
                  onLinkClick={handleLinkClick}
                  onEditLink={handleEditLink}
                  onDeleteLink={handleDeleteLink}
                  onToggleFavorite={handleToggleFavorite}
                  onRefresh={handleDataRefresh}
                  className="modal-navigation"
                />
              )}
            </div>
          )}

          {activeTab === 'import-export' && (
            <div className="import-export-tab">
              <div className="tab-description">
                <p>{t.importExportDesc}</p>
              </div>

              <ImportExport />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchManagementModal;