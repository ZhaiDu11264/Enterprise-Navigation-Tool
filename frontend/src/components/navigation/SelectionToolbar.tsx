import React, { useState, useCallback } from 'react';
import { WebsiteLink, Group } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import './SelectionToolbar.css';

interface SelectionToolbarProps {
  allLinks: WebsiteLink[];
  selectedLinks: WebsiteLink[];
  currentGroupId: number | null;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectByGroup: (groupId: number) => void;
  onSelectFavorites: () => void;
  onToggleSelectionMode: () => void;
  selectionMode: boolean;
  groups: Group[];
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  allLinks,
  selectedLinks,
  currentGroupId,
  onSelectAll,
  onSelectNone,
  onSelectByGroup,
  onSelectFavorites,
  onToggleSelectionMode,
  selectionMode,
  groups
}) => {
  const { language } = useLanguage();
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const t = language === 'zh'
    ? {
        exitSelectionMode: '退出选择模式',
        enterSelectionMode: '进入选择模式',
        batchSelect: '批量选择',
        selectedCount: (selected: number, total: number) => `已选择 ${selected} / ${total} 个链接`,
        deselectAll: '全不选',
        selectAll: '全选',
        quickSelect: '快速选择',
        selectFavorites: '选择收藏',
        selectByGroup: '按分组选择',
        clearSelection: '清除选择'
      }
    : {
        exitSelectionMode: 'Exit selection mode',
        enterSelectionMode: 'Enter selection mode',
        batchSelect: 'Batch Select',
        selectedCount: (selected: number, total: number) => `Selected ${selected} / ${total} links`,
        deselectAll: 'Deselect All',
        selectAll: 'Select All',
        quickSelect: 'Quick Select',
        selectFavorites: 'Select Favorites',
        selectByGroup: 'Select by Group',
        clearSelection: 'Clear Selection'
      };

  const currentGroupLinks = currentGroupId
    ? allLinks.filter(link => link.groupId === currentGroupId)
    : allLinks;

  const favoriteLinks = allLinks.filter(link => link.isFavorite);
  const allSelected = currentGroupLinks.length > 0 &&
    currentGroupLinks.every(link => selectedLinks.some(selected => selected.id === link.id));
  const someSelected = selectedLinks.length > 0;

  const handleSelectCurrentGroup = useCallback(() => {
    if (currentGroupId) {
      onSelectByGroup(currentGroupId);
    } else {
      onSelectAll();
    }
  }, [currentGroupId, onSelectByGroup, onSelectAll]);

  const getSelectionStats = useCallback(() => {
    const total = currentGroupLinks.length;
    const selected = selectedLinks.length;
    const percentage = total > 0 ? Math.round((selected / total) * 100) : 0;
    return { total, selected, percentage };
  }, [currentGroupLinks.length, selectedLinks.length]);

  const stats = getSelectionStats();

  return (
    <div className="selection-toolbar">
      <div className="toolbar-main">
        <div className="selection-toggle">
          <button
            className={`toggle-btn ${selectionMode ? 'active' : ''}`}
            onClick={onToggleSelectionMode}
            title={selectionMode ? t.exitSelectionMode : t.enterSelectionMode}
          >
            {selectionMode ? '✓' : '☐'} {t.batchSelect}
          </button>
        </div>

        {selectionMode && (
          <>
            <div className="selection-stats">
              <span className="stats-text">{t.selectedCount(stats.selected, stats.total)}</span>
              {stats.selected > 0 && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${stats.percentage}%` }} />
                </div>
              )}
            </div>

            <div className="quick-actions">
              <button
                className="quick-btn"
                onClick={allSelected ? onSelectNone : handleSelectCurrentGroup}
                disabled={currentGroupLinks.length === 0}
              >
                {allSelected ? t.deselectAll : t.selectAll}
              </button>

              <div className="quick-select-dropdown">
                <button
                  className="quick-btn dropdown-toggle"
                  onClick={() => setShowQuickSelect(!showQuickSelect)}
                >
                  {t.quickSelect} ▼
                </button>

                {showQuickSelect && (
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        onSelectFavorites();
                        setShowQuickSelect(false);
                      }}
                      disabled={favoriteLinks.length === 0}
                    >
                      {t.selectFavorites} ({favoriteLinks.length})
                    </button>

                    <div className="dropdown-divider" />

                    <div className="dropdown-section">
                      <span className="dropdown-label">{t.selectByGroup}:</span>
                      {groups.map(group => {
                        const groupLinks = allLinks.filter(link => link.groupId === group.id);
                        return (
                          <button
                            key={group.id}
                            className="dropdown-item group-item"
                            onClick={() => {
                              onSelectByGroup(group.id);
                              setShowQuickSelect(false);
                            }}
                            disabled={groupLinks.length === 0}
                          >
                            {group.name} ({groupLinks.length})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {someSelected && (
                <button className="quick-btn clear-btn" onClick={onSelectNone}>
                  {t.clearSelection}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showQuickSelect && (
        <div className="dropdown-backdrop" onClick={() => setShowQuickSelect(false)} />
      )}
    </div>
  );
};

export default SelectionToolbar;
