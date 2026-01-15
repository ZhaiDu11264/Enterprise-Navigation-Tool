import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Group } from '../../types';
import './GroupTabs.css';

interface GroupTabsProps {
  groups: Group[];
  activeGroupId: number | null;
  onGroupSelect: (groupId: number | null) => void;
  onAddGroup?: () => void;
  onEditGroup?: (group: Group) => void;
  onDeleteGroup?: (group: Group) => void;
  showAllTab?: boolean;
  className?: string;
}

export function GroupTabs({
  groups,
  activeGroupId,
  onGroupSelect,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  showAllTab = true,
  className = ""
}: GroupTabsProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      allLinks: 'All Links',
      editGroup: 'Edit group',
      deleteGroup: 'Delete group',
      systemGroup: 'System group, cannot delete',
      addGroup: 'Add Group',
      addGroupTitle: 'Add new group'
    },
    zh: {
      allLinks: '\u5168\u90e8\u94fe\u63a5',
      editGroup: '\u7f16\u8f91\u5206\u7ec4',
      deleteGroup: '\u5220\u9664\u5206\u7ec4',
      systemGroup: '\u7cfb\u7edf\u5206\u7ec4\uff0c\u4e0d\u53ef\u5220\u9664',
      addGroup: '\u6dfb\u52a0\u5206\u7ec4',
      addGroupTitle: '\u6dfb\u52a0\u5206\u7ec4'
    }
  } as const;
  const t = translations[language];
  const sortedGroups = [...groups].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleTabClick = (groupId: number | null) => {
    onGroupSelect(groupId);
  };

  const handleEditClick = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    onEditGroup?.(group);
  };

  const handleDeleteClick = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    onDeleteGroup?.(group);
  };

  return (
    <div className={`group-tabs ${className}`}>
      <div className="tabs-container">
        <div className="tabs-scroll">
          {showAllTab && (
            <button
              className={`tab ${activeGroupId === null ? 'active' : ''}`}
              onClick={() => handleTabClick(null)}
            >
              <span className="tab-label">{t.allLinks}</span>
            </button>
          )}
          
          {sortedGroups.map((group) => (
            <div
              key={group.id}
              className={`tab ${activeGroupId === group.id ? 'active' : ''}`}
              onClick={() => handleTabClick(group.id)}
            >
              <span className="tab-label">{group.name}</span>
              
              {(onEditGroup || onDeleteGroup) && (
                <div className="tab-actions">
                  {onEditGroup && (
                    <button
                      className="tab-action edit"
                      onClick={(e) => handleEditClick(e, group)}
                      title={t.editGroup}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  )}
                  
                  {onDeleteGroup && group.isDeletable && (
                    <button
                      className="tab-action delete"
                      onClick={(e) => handleDeleteClick(e, group)}
                      title={t.deleteGroup}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  )}
                  
                  {!group.isDeletable && (
                    <div className="system-group-indicator" title={t.systemGroup}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {onAddGroup && (
          <button
            className="add-group-btn"
            onClick={onAddGroup}
            title={t.addGroupTitle}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>{t.addGroup}</span>
          </button>
        )}
      </div>
    </div>
  );
}