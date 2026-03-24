import React, { useState, useCallback, useMemo } from 'react';
import { WebsiteLink, Group } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import SelectionToolbar from './SelectionToolbar';
import BatchOperations from '../admin/BatchOperations';
import SelectableLinkCard from './SelectableLinkCard';
import { DraggableGroupTabs } from './DraggableGroupTabs';
import batchService from '../../services/batchService';
import './EnhancedNavigationView.css';

interface EnhancedNavigationViewProps {
  groups: Group[];
  links: WebsiteLink[];
  loading?: boolean;
  onLinkClick: (link: WebsiteLink) => void;
  onEditLink?: (link: WebsiteLink) => void;
  onDeleteLink?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  onRefresh?: () => void;
  className?: string;
}

const EnhancedNavigationView: React.FC<EnhancedNavigationViewProps> = ({
  groups,
  links,
  loading = false,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onRefresh,
  className
}) => {
  const { language } = useLanguage();
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<WebsiteLink[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const t = language === 'zh'
    ? {
        loading: '加载中...',
        gridView: '网格视图',
        listView: '列表视图',
        emptyTitle: '暂无链接',
        emptyGroup: '此分组中还没有链接',
        emptyAll: '还没有添加任何链接',
        showing: (current: number, total: number) => `显示 ${current} / ${total} 个链接`,
        selected: (count: number) => `已选择 ${count} 个`
      }
    : {
        loading: 'Loading...',
        gridView: 'Grid View',
        listView: 'List View',
        emptyTitle: 'No Links Yet',
        emptyGroup: 'There are no links in this group yet',
        emptyAll: 'No links have been added yet',
        showing: (current: number, total: number) => `Showing ${current} / ${total} links`,
        selected: (count: number) => `${count} selected`
      };

  const filteredLinks = useMemo(() => {
    if (activeGroupId === null) {
      return links;
    }
    return links.filter(link => link.groupId === activeGroupId);
  }, [links, activeGroupId]);

  const handleSelectLink = useCallback((linkId: number, selected: boolean) => {
    const link = links.find(l => l.id === linkId);
    if (!link) return;

    setSelectedLinks(prev => {
      if (selected) {
        return prev.some(l => l.id === linkId) ? prev : [...prev, link];
      }
      return prev.filter(l => l.id !== linkId);
    });
  }, [links]);

  const handleSelectAll = useCallback(() => {
    const currentLinks = activeGroupId ? links.filter(link => link.groupId === activeGroupId) : links;
    setSelectedLinks(currentLinks);
  }, [links, activeGroupId]);

  const handleSelectNone = useCallback(() => {
    setSelectedLinks([]);
  }, []);

  const handleSelectByGroup = useCallback((groupId: number) => {
    const groupLinks = links.filter(link => link.groupId === groupId);
    setSelectedLinks(groupLinks);
  }, [links]);

  const handleSelectFavorites = useCallback(() => {
    const favoriteLinks = links.filter(link => link.isFavorite);
    setSelectedLinks(favoriteLinks);
  }, [links]);

  const handleToggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      setSelectedLinks([]);
    }
  }, [selectionMode]);

  const handleBatchDelete = useCallback(async (linkIds: number[]) => {
    try {
      await batchService.batchDelete(linkIds);
      setSelectedLinks([]);
      onRefresh?.();
    } catch (error) {
      console.error('Batch delete failed:', error);
      throw error;
    }
  }, [onRefresh]);

  const handleBatchMove = useCallback(async (linkIds: number[], targetGroupId: number) => {
    try {
      await batchService.batchMove(linkIds, targetGroupId);
      setSelectedLinks([]);
      onRefresh?.();
    } catch (error) {
      console.error('Batch move failed:', error);
      throw error;
    }
  }, [onRefresh]);

  const handleBatchEdit = useCallback(async (linkIds: number[], updates: Partial<WebsiteLink>) => {
    try {
      await batchService.batchEdit(linkIds, updates);
      setSelectedLinks([]);
      onRefresh?.();
    } catch (error) {
      console.error('Batch edit failed:', error);
      throw error;
    }
  }, [onRefresh]);

  const handleBatchExport = useCallback(async (linkIds: number[], format: 'csv' | 'xlsx') => {
    try {
      await batchService.batchExport(linkIds, format, true);
    } catch (error) {
      console.error('Batch export failed:', error);
      throw error;
    }
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedLinks([]);
  }, []);

  const isLinkSelected = useCallback((linkId: number) => {
    return selectedLinks.some(link => link.id === linkId);
  }, [selectedLinks]);

  if (loading) {
    return (
      <div className="enhanced-navigation-loading">
        <div className="loading-spinner">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className={`enhanced-navigation-view ${className || ''}`}>
      <div className="navigation-header">
        <DraggableGroupTabs
          groups={groups}
          activeGroupId={activeGroupId}
          onGroupSelect={setActiveGroupId}
          onReorderGroups={() => {}}
        />

        <div className="view-controls">
          <button
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title={t.gridView}
          >
            ⊞
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title={t.listView}
          >
            ☰
          </button>
        </div>
      </div>

      <SelectionToolbar
        allLinks={links}
        selectedLinks={selectedLinks}
        currentGroupId={activeGroupId}
        onSelectAll={handleSelectAll}
        onSelectNone={handleSelectNone}
        onSelectByGroup={handleSelectByGroup}
        onSelectFavorites={handleSelectFavorites}
        onToggleSelectionMode={handleToggleSelectionMode}
        selectionMode={selectionMode}
        groups={groups}
      />

      {selectionMode && selectedLinks.length > 0 && (
        <BatchOperations
          selectedLinks={selectedLinks}
          allGroups={groups}
          onBatchDelete={handleBatchDelete}
          onBatchMove={handleBatchMove}
          onBatchEdit={handleBatchEdit}
          onBatchExport={handleBatchExport}
          onClearSelection={handleClearSelection}
        />
      )}

      <div className={`links-container ${viewMode}`}>
        {filteredLinks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📨</div>
            <h3>{t.emptyTitle}</h3>
            <p>{activeGroupId ? t.emptyGroup : t.emptyAll}</p>
          </div>
        ) : (
          <div className={`links-grid ${viewMode}`}>
            {filteredLinks.map(link => (
              <SelectableLinkCard
                key={link.id}
                link={link}
                isSelected={isLinkSelected(link.id)}
                onSelect={handleSelectLink}
                onEdit={onEditLink}
                onDelete={onDeleteLink}
                onToggleFavorite={onToggleFavorite}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        )}
      </div>

      <div className="navigation-footer">
        <div className="stats-info">
          <span>{t.showing(filteredLinks.length, links.length)}</span>
          {selectedLinks.length > 0 && <span>{t.selected(selectedLinks.length)}</span>}
        </div>
      </div>
    </div>
  );
};

export default EnhancedNavigationView;
