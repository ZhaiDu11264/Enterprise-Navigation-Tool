import React, { useState, useCallback, useMemo } from 'react';
import { WebsiteLink, Group } from '../../types';
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
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<WebsiteLink[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter links based on active group
  const filteredLinks = useMemo(() => {
    if (activeGroupId === null) {
      return links;
    }
    return links.filter(link => link.groupId === activeGroupId);
  }, [links, activeGroupId]);

  // Selection handlers
  const handleSelectLink = useCallback((linkId: number, selected: boolean) => {
    const link = links.find(l => l.id === linkId);
    if (!link) return;

    setSelectedLinks(prev => {
      if (selected) {
        return prev.some(l => l.id === linkId) ? prev : [...prev, link];
      } else {
        return prev.filter(l => l.id !== linkId);
      }
    });
  }, [links]);

  const handleSelectAll = useCallback(() => {
    const currentLinks = activeGroupId 
      ? links.filter(link => link.groupId === activeGroupId)
      : links;
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

  // Batch operations handlers
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

  // Check if link is selected
  const isLinkSelected = useCallback((linkId: number) => {
    return selectedLinks.some(link => link.id === linkId);
  }, [selectedLinks]);

  if (loading) {
    return (
      <div className="enhanced-navigation-loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  return (
    <div className={`enhanced-navigation-view ${className || ''}`}>
      {/* Group Tabs */}
      <div className="navigation-header">
        <DraggableGroupTabs
          groups={groups}
          activeGroupId={activeGroupId}
          onGroupSelect={setActiveGroupId}
          onReorderGroups={() => {}} // Implement if needed
        />
        
        <div className="view-controls">
          <button
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="网格视图"
          >
            ⊞
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="列表视图"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Selection Toolbar */}
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

      {/* Batch Operations */}
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

      {/* Links Grid/List */}
      <div className={`links-container ${viewMode}`}>
        {filteredLinks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>暂无链接</h3>
            <p>
              {activeGroupId 
                ? '此分组中还没有链接' 
                : '还没有添加任何链接'
              }
            </p>
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

      {/* Stats Footer */}
      <div className="navigation-footer">
        <div className="stats-info">
          <span>
            显示 {filteredLinks.length} / {links.length} 个链接
          </span>
          {selectedLinks.length > 0 && (
            <span>
              已选择 {selectedLinks.length} 个
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedNavigationView;