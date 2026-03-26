import React, { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      onClose();
    }
  }, [isOpen, isAuthenticated, onClose]);

  if (!isOpen) {
    return null;
  }

  const closeLabel = language === 'zh' ? '关闭' : 'Close';

  return (
    <div
      className="login-modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // 点击遮罩区域关闭（不拦截点击对话框内部）
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="login-modal">
        <div className="login-modal-header">
          <h2>{language === 'zh' ? '网址导航' : 'Website Navigation'}</h2>
          <button
            type="button"
            className="login-modal-close"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        <div className="login-modal-content">
          <LoginForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}

