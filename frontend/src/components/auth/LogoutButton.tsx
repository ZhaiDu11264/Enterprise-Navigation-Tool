import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import './LogoutButton.css';

interface LogoutButtonProps {
  className?: string;
  showConfirm?: boolean;
}

export function LogoutButton({ className = '', showConfirm = true }: LogoutButtonProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      confirmTitle: 'Confirm Logout',
      confirmMessage: 'Are you sure you want to sign out?',
      signingOut: 'Signing Out...',
      signOut: 'Sign Out',
      cancel: 'Cancel',
      title: (name: string) => `Sign out ${name}`
    },
    zh: {
      confirmTitle: '\u786e\u8ba4\u767b\u51fa',
      confirmMessage: '\u786e\u5b9a\u8981\u9000\u51fa\u767b\u5f55\u5417\uff1f',
      signingOut: '\u6b63\u5728\u767b\u51fa...',
      signOut: '\u9000\u51fa\u767b\u5f55',
      cancel: '\u53d6\u6d88',
      title: (name: string) => `\u9000\u51fa\u767b\u5f55 ${name}`
    }
  } as const;
  const t = translations[language];
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleLogout = async () => {
    if (showConfirm && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  if (showConfirmDialog) {
    return (
      <div className="logout-confirm-overlay">
        <div className="logout-confirm-dialog">
          <h3>{t.confirmTitle}</h3>
          <p>{t.confirmMessage}</p>
          <div className="logout-confirm-actions">
            <button
              className="logout-confirm-button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? t.signingOut : t.signOut}
            </button>
            <button
              className="logout-cancel-button"
              onClick={handleCancel}
              disabled={isLoggingOut}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={`logout-button ${className}`}
      onClick={handleLogout}
      disabled={isLoggingOut}
      title={t.title(user?.username || '')}
    >
      {isLoggingOut ? t.signingOut : t.signOut}
    </button>
  );
}
