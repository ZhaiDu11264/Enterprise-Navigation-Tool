import React, { useEffect, useRef } from 'react';
import { User } from '../../types';
import { GridSize } from '../../contexts/SettingsContext';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  compactMode: boolean;
  onToggleCompactMode: () => void;
  transparentMode: boolean;
  onToggleTransparentMode: () => void;
  language: 'en' | 'zh';
  onLanguageChange: (language: 'en' | 'zh') => void;
  gridSize: GridSize;
  onGridSizeChange: (size: GridSize) => void;
  user: User | null;
  onOpenBatchManagement?: () => void;
  labels: {
    title: string;
    darkMode: string;
    compactMode: string;
    transparentMode: string;
    language: string;
    gridSize: string;
    gridSizeSmall: string;
    gridSizeMedium: string;
    gridSizeLarge: string;
    gridSizeExtraLarge: string;
    english: string;
    chinese: string;
    close: string;
    batchManagement?: string;
    adminTools?: string;
  };
}

export function SettingsModal({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  compactMode,
  onToggleCompactMode,
  transparentMode,
  onToggleTransparentMode,
  language,
  onLanguageChange,
  gridSize,
  onGridSizeChange,
  user,
  onOpenBatchManagement,
  labels
}: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal" ref={modalRef}>
        <div className="settings-modal-header">
          <h2>{labels.title}</h2>
          <button className="settings-modal-close" onClick={onClose} type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="settings-modal-body">
          <section className="settings-section">
            <div className="settings-section-title">{labels.darkMode}</div>
            <label className="toggle">
              <input type="checkbox" checked={darkMode} onChange={onToggleDarkMode} />
              <span className="toggle-slider"></span>
            </label>
          </section>

          <section className="settings-section">
            <div className="settings-section-title">{labels.compactMode}</div>
            <label className="toggle">
              <input type="checkbox" checked={compactMode} onChange={onToggleCompactMode} />
              <span className="toggle-slider"></span>
            </label>
          </section>

          <section className="settings-section">
            <div className="settings-section-title">{labels.transparentMode}</div>
            <label className="toggle">
              <input type="checkbox" checked={transparentMode} onChange={onToggleTransparentMode} />
              <span className="toggle-slider"></span>
            </label>
          </section>

          <section className="settings-section">
            <div className="settings-section-title">{labels.language}</div>
            <div className="settings-select">
              <select
                value={language}
                onChange={(event) => onLanguageChange(event.target.value as 'en' | 'zh')}
              >
                <option value="en">{labels.english}</option>
                <option value="zh">{labels.chinese}</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-title">{labels.gridSize}</div>
            <div className="settings-select">
              <select
                value={gridSize}
                onChange={(event) => onGridSizeChange(event.target.value as GridSize)}
              >
                <option value="small">{labels.gridSizeSmall}</option>
                <option value="medium">{labels.gridSizeMedium}</option>
                <option value="large">{labels.gridSizeLarge}</option>
                <option value="extra-large">{labels.gridSizeExtraLarge}</option>
              </select>
            </div>
          </section>

          {user?.role === 'admin' && onOpenBatchManagement && (
            <>
              <div className="settings-divider"></div>
              <section className="settings-section">
                <div className="settings-section-title">{labels.adminTools || '管理工具'}</div>
              </section>
              <section className="settings-section settings-action">
                <button 
                  className="settings-action-btn"
                  onClick={() => {
                    onOpenBatchManagement();
                    onClose();
                  }}
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                  <span>{labels.batchManagement || '批量管理'}</span>
                </button>
              </section>
            </>
          )}

        </div>

        <div className="settings-modal-footer">
          <button className="settings-close-btn" onClick={onClose} type="button">
            {labels.close}
          </button>
        </div>
      </div>
    </div>
  );
}
