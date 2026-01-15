import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger',
  loading = false
}: ConfirmDialogProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      processing: 'Processing...'
    },
    zh: {
      confirm: '\u786e\u8ba4',
      cancel: '\u53d6\u6d88',
      processing: '\u5904\u7406\u4e2d...'
    }
  } as const;
  const t = translations[language];
  const resolvedConfirmText = confirmText ?? t.confirm;
  const resolvedCancelText = cancelText ?? t.cancel;
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle click outside dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
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

  // Handle escape key
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

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
    }
  };

  return (
    <div className="confirm-overlay">
      <div className={`confirm-dialog ${type}`} ref={dialogRef}>
        <div className="confirm-header">
          <div className="confirm-icon">
            {getIcon()}
          </div>
          <h3>{title}</h3>
        </div>
        
        <div className="confirm-content">
          <p>{message}</p>
        </div>
        
        <div className="confirm-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel"
            disabled={loading}
          >
            {resolvedCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn-confirm ${type}`}
            disabled={loading}
          >
            {loading ? t.processing : resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
