import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { LogoutButton } from './LogoutButton';
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
