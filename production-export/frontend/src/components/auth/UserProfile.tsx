import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { LogoutButton } from './LogoutButton';
import { API_BASE_URL } from '../../services/api';
import { userService } from '../../services/userService';
import notificationService, { UserNotification } from '../../services/notificationService';
import './UserProfile.css';

interface UserProfileProps {
  showLogout?: boolean;
  compact?: boolean;
}

export function UserProfile({ showLogout = true, compact = false }: UserProfileProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      admin: 'Administrator',
      user: 'User',
      joined: 'Joined:',
      lastLogin: 'Last login:',
      profile: 'Profile',
      displayName: 'Display name',
      displayNameHint: 'Shown in the header and profile',
      avatar: 'Avatar',
      uploadAvatar: 'Upload avatar',
      notifications: 'Notifications',
      notificationsEmpty: 'No notifications yet.',
      notificationsLoading: 'Loading notifications...',
      quickImportExport: 'Quick Import/Export',
      importCsv: 'Import CSV',
      importSelect: 'Choose CSV',
      importNow: 'Import',
      exportCsv: 'Export CSV',
      importHint: 'Only CSV files are supported.',
      importSuccess: (count: number) => `Imported ${count} links.`,
      importFailed: 'Import failed. Please check the file.',
      exportFailed: 'Export failed. Please try again.',
      importErrorSummary: (count: number, summary: string) => `${count} failed: ${summary}`,
      markRead: 'Mark read',
      unread: 'Unread',
      save: 'Save',
      cancel: 'Cancel',
      logout: 'Log out'
    },
    zh: {
      admin: '\u7ba1\u7406\u5458',
      user: '\u7528\u6237',
      joined: '\u6ce8\u518c\u65e5\u671f\uff1a',
      lastLogin: '\u4e0a\u6b21\u767b\u5f55\uff1a',
      profile: '\u7528\u6237\u4fe1\u606f',
      displayName: '\u6635\u79f0',
      displayNameHint: '\u5728\u4e3b\u9875\u548c\u4e2a\u4eba\u8d44\u6599\u4e2d\u663e\u793a',
      avatar: '\u5934\u50cf',
      uploadAvatar: '\u66f4\u6362\u5934\u50cf',
      notifications: '\u901a\u77e5',
      notificationsEmpty: '\u6682\u65e0\u901a\u77e5\u3002',
      notificationsLoading: '\u52a0\u8f7d\u901a\u77e5\u4e2d...',
      quickImportExport: '\u5feb\u901f\u5bfc\u5165/\u5bfc\u51fa',
      importCsv: '\u5bfc\u5165 CSV',
      importSelect: '\u9009\u62e9 CSV',
      importNow: '\u5bfc\u5165',
      exportCsv: '\u5bfc\u51fa CSV',
      importHint: '\u4ec5\u652f\u6301 CSV \u6587\u4ef6\u3002',
      importSuccess: (count: number) => `\u5df2\u5bfc\u5165 ${count} \u6761\u94fe\u63a5\u3002`,
      importFailed: '\u5bfc\u5165\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u6587\u4ef6\u3002',
      exportFailed: '\u5bfc\u51fa\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\u3002',
      importErrorSummary: (count: number, summary: string) => `${count} \u6761\u5931\u8d25\uff1a${summary}`,
      markRead: '\u6807\u8bb0\u5df2\u8bfb',
      unread: '\u672a\u8bfb',
      save: '\u4fdd\u5b58',
      cancel: '\u53d6\u6d88',
      logout: '\u9000\u51fa\u767b\u5f55'
    }
  } as const;
  const t = translations[language];
  const { user, refreshUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const resolvedDisplayName = user?.displayName?.trim() || user?.username || '';

  const userId = user?.id;
  const userAvatarUrl = user?.avatarUrl || null;

  useEffect(() => {
    if (!isModalOpen || !userId) {
      return;
    }
    setDisplayName(prev => (prev !== resolvedDisplayName ? resolvedDisplayName : prev));
    setAvatarFile(prev => (prev ? null : prev));
    setAvatarPreview(prev => (prev !== userAvatarUrl ? userAvatarUrl : prev));
    setImportFile(null);
    setImportMessage(null);
    setImportError(null);
  }, [isModalOpen, resolvedDisplayName, userId, userAvatarUrl]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.warn('Failed to load notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };
    loadNotifications();
  }, [isModalOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.classList.add('profile-modal-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('profile-modal-open');
    };
  }, [isModalOpen]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setImportFile(file);
    setImportMessage(null);
    setImportError(null);
  };

  const handleImportCsv = async () => {
    if (!importFile) {
      return;
    }
    setImportLoading(true);
    setImportMessage(null);
    setImportError(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/import/simple`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData
      });
      if (!response.ok) {
        throw new Error('Import failed');
      }
      const data = await response.json();
      const importedCount = Number(data?.imported || 0);
      const errorList = Array.isArray(data?.errors) ? data.errors : [];
      setImportMessage(t.importSuccess(importedCount));
      if (errorList.length > 0) {
        const summary = errorList.slice(0, 3).join('; ');
        setImportError(t.importErrorSummary(errorList.length, summary));
      }
      setImportFile(null);
    } catch (error) {
      console.warn('CSV import failed:', error);
      setImportError(t.importFailed);
    } finally {
      setImportLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExportLoading(true);
    setImportMessage(null);
    setImportError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/export/simple`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStamp = new Date().toISOString().split('T')[0] || 'export';
      link.download = `navigation-export-${dateStamp}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('CSV export failed:', error);
      setImportError(t.exportFailed);
    } finally {
      setExportLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const trimmedDisplayName = displayName.trim();
      const currentDisplayName = (user.displayName || '').trim();
      const payload: { displayName?: string; avatarUrl?: string | null } = {};

      if (trimmedDisplayName !== currentDisplayName) {
        payload.displayName = trimmedDisplayName;
      }

      let avatarUrl = user.avatarUrl;
      if (avatarFile) {
        const uploadResult = await userService.uploadAvatar(avatarFile);
        avatarUrl = uploadResult.avatarUrl || avatarUrl;
        if (avatarUrl) {
          payload.avatarUrl = avatarUrl;
        }
      }

      if (Object.keys(payload).length > 0) {
        await userService.updateProfile(payload);
      }

      await refreshUser();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(item =>
          item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item
        )
      );
    } catch (error) {
      console.warn('Failed to mark notification read:', error);
    }
  };

  if (!user) {
    return null;
  }

  if (compact) {
    const modal = isModalOpen ? (
      <div className="profile-modal-overlay">
        <div className="profile-modal" ref={modalRef}>
          <div className="profile-modal-header">
            <h2>{t.profile}</h2>
            <button
              type="button"
              className="profile-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="profile-modal-body">
            <div className="profile-avatar-row">
              <div className="profile-avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={resolvedDisplayName} />
                ) : (
                  <div className="avatar-placeholder">
                    {resolvedDisplayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="profile-avatar-actions">
                <span className="profile-label">{t.avatar}</span>
                <label className="profile-upload-btn">
                  {t.uploadAvatar}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="displayName">{t.displayName}</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={resolvedDisplayName}
              />
              <div className="profile-hint">{t.displayNameHint}</div>
            </div>

            <div className="profile-notifications">
              <div className="profile-notifications-header">
                <span>{t.notifications}</span>
              </div>
              <div className="profile-notifications-list">
                {notificationsLoading ? (
                  <div className="profile-notifications-empty">{t.notificationsLoading}</div>
                ) : notifications.length === 0 ? (
                  <div className="profile-notifications-empty">{t.notificationsEmpty}</div>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      className={`profile-notification-item ${item.readAt ? 'read' : 'unread'}`}
                    >
                      <div className="profile-notification-main">
                        <div className="profile-notification-title">
                          {item.title}
                          {!item.readAt && <span className="profile-notification-badge">{t.unread}</span>}
                        </div>
                        <div className="profile-notification-message">{item.message}</div>
                      </div>
                      {!item.readAt && (
                        <button
                          type="button"
                          className="profile-notification-action"
                          onClick={() => handleMarkRead(item.id)}
                        >
                          {t.markRead}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="profile-import-export">
              <div className="profile-import-export-header">
                <div className="profile-import-title">
                  <span className="profile-import-icon">⇅</span>
                  <span>{t.quickImportExport}</span>
                </div>
                <span className="profile-import-hint">{t.importHint}</span>
              </div>
              <div className="profile-import-export-body">
                <div className="profile-import-row">
                  <label className="profile-upload-btn profile-import-upload">
                    {t.importSelect}
                    <input type="file" accept=".csv" onChange={handleImportChange} />
                  </label>
                  <span className="profile-import-file">
                    {importFile ? importFile.name : t.importCsv}
                  </span>
                </div>
                <div className="profile-import-actions">
                  <button
                    type="button"
                    className="profile-btn primary"
                    onClick={handleImportCsv}
                    disabled={!importFile || importLoading}
                  >
                    {importLoading ? t.importNow : t.importNow}
                  </button>
                  <button
                    type="button"
                    className="profile-btn secondary"
                    onClick={handleExportCsv}
                    disabled={exportLoading}
                  >
                    {exportLoading ? t.exportCsv : t.exportCsv}
                  </button>
                </div>
                {importMessage && <div className="profile-import-message">{importMessage}</div>}
                {importError && <div className="profile-import-error">{importError}</div>}
              </div>
            </div>
          </div>
          <div className="profile-modal-footer">
            <LogoutButton className="profile-logout" />
            <div className="profile-actions">
              <button
                type="button"
                className="profile-btn secondary"
                onClick={() => setIsModalOpen(false)}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className="profile-btn primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

    return (
      <>
        <button
          className="user-profile compact"
          type="button"
          onClick={() => setIsModalOpen(true)}
          title={t.profile}
        >
          <div className="user-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={resolvedDisplayName} className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                {resolvedDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-info">
            <span className="username">{resolvedDisplayName}</span>
            {user.role === 'admin' && (
              <span className="user-role">{t.admin}</span>
            )}
          </div>
        </button>
        {modal ? createPortal(modal, document.body) : null}
      </>
    );
  }

  return (
    <div className="user-profile">
      <div className="user-avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={resolvedDisplayName} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            {resolvedDisplayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="user-details">
        <h3 className="username">{resolvedDisplayName}</h3>
        <p className="user-email">{user.email}</p>
        <div className="user-meta">
          <span className={`user-role ${user.role}`}>
            {user.role === 'admin' ? t.admin : t.user}
          </span>
          <span className="user-joined">
            {t.joined} {formatDate(user.createdAt)}
          </span>
          {user.lastLoginAt && (
            <span className="user-last-login">
              {t.lastLogin} {formatDate(user.lastLoginAt)}
            </span>
          )}
        </div>
      </div>

      {showLogout && (
        <div className="user-actions">
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
