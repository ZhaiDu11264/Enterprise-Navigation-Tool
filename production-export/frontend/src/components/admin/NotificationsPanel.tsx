import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import adminService, { AdminNotification } from '../../services/adminService';
import { User } from '../../types';
import './NotificationsPanel.css';

type AudienceMode = 'all' | 'selected';

const NotificationsPanel: React.FC = () => {
  const { language } = useLanguage();
  const translations = {
    en: {
      title: 'Send Notification',
      audience: 'Audience',
      allUsers: 'All Users',
      selectedUsers: 'Selected Users',
      titleLabel: 'Title',
      messageLabel: 'Message',
      levelLabel: 'Level',
      send: 'Send',
      sending: 'Sending...',
      recent: 'Recent Notifications',
      empty: 'No notifications yet.',
      success: 'Notification sent',
      error: 'Failed to send notification',
      selectUsers: 'Select users',
      searchUsers: 'Search users',
      selectAll: 'Select all',
      clearSelection: 'Clear',
      selectedCount: (selected: number, total: number) => `Selected ${selected} / ${total}`
    },
    zh: {
      title: '发送通知',
      audience: '接收范围',
      allUsers: '全部用户',
      selectedUsers: '指定用户',
      titleLabel: '标题',
      messageLabel: '内容',
      levelLabel: '级别',
      send: '发送',
      sending: '发送中...',
      recent: '最近通知',
      empty: '暂无通知。',
      success: '通知已发送',
      error: '发送通知失败',
      selectUsers: '选择用户',
      searchUsers: '搜索用户',
      selectAll: '全选',
      clearSelection: '清空',
      selectedCount: (selected: number, total: number) => `已选 ${selected} / ${total}`
    }
  } as const;
  const t = translations[language];

  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [userKeyword, setUserKeyword] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, notificationsData] = await Promise.all([
          adminService.getAllUsers(),
          adminService.listAdminNotifications()
        ]);
        setUsers(usersData);
        setNotifications(notificationsData);
      } catch (error) {
        console.warn('Failed to load notification data:', error);
      }
    };
    loadData();
  }, []);

  const handleToggleUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = users.filter((user) => {
    const keyword = userKeyword.trim().toLowerCase();
    if (!keyword) {
      return true;
    }
    const value = `${user.displayName || ''} ${user.username} ${user.email}`.toLowerCase();
    return value.includes(keyword);
  });

  const handleSelectAll = () => {
    const ids = filteredUsers.map(user => user.id);
    setSelectedUsers(ids);
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      return;
    }
    try {
      setIsSending(true);
      setStatusMessage(null);
      await adminService.sendNotification({
        title: title.trim(),
        message: message.trim(),
        level,
        userIds: audienceMode === 'selected' ? selectedUsers : undefined
      });
      setStatusMessage(t.success);
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
      const updated = await adminService.listAdminNotifications();
      setNotifications(updated);
    } catch (error) {
      console.warn('Failed to send notification:', error);
      setStatusMessage(t.error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="notifications-panel">
      <div className="notifications-card">
        <h4>{t.title}</h4>
        <div className="notifications-form">
          <div className="notifications-row">
            <label>{t.audience}</label>
            <div className="notifications-audience">
              <label className="radio">
                <input
                  type="radio"
                  name="audience"
                  checked={audienceMode === 'all'}
                  onChange={() => setAudienceMode('all')}
                />
                {t.allUsers}
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="audience"
                  checked={audienceMode === 'selected'}
                  onChange={() => setAudienceMode('selected')}
                />
                {t.selectedUsers}
              </label>
            </div>
          </div>

          {audienceMode === 'selected' && (
            <div className="notifications-row">
              <label>{t.selectUsers}</label>
              <div className="notifications-user-select">
                <div className="notifications-user-toolbar">
                  <input
                    type="text"
                    placeholder={t.searchUsers}
                    value={userKeyword}
                    onChange={(event) => setUserKeyword(event.target.value)}
                  />
                  <div className="notifications-user-actions">
                    <button type="button" onClick={handleSelectAll}>{t.selectAll}</button>
                    <button type="button" onClick={handleClearSelection}>{t.clearSelection}</button>
                  </div>
                </div>
                <div className="notifications-user-count">
                  {t.selectedCount(selectedUsers.length, filteredUsers.length)}
                </div>
                <div className="notifications-user-list">
                  {filteredUsers.map(user => (
                    <label key={user.id} className="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleToggleUser(user.id)}
                      />
                      {user.displayName || user.username || user.email}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="notifications-row">
            <label htmlFor="notification-title">{t.titleLabel}</label>
            <input
              id="notification-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="notifications-row">
            <label htmlFor="notification-message">{t.messageLabel}</label>
            <textarea
              id="notification-message"
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
          <div className="notifications-row">
            <label htmlFor="notification-level">{t.levelLabel}</label>
            <select
              id="notification-level"
              value={level}
              onChange={(event) => setLevel(event.target.value as any)}
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          {statusMessage && <div className="notifications-status">{statusMessage}</div>}
          <button
            type="button"
            className="notifications-send"
            onClick={handleSend}
            disabled={isSending || !title.trim() || !message.trim()}
          >
            {isSending ? t.sending : t.send}
          </button>
        </div>
      </div>

      <div className="notifications-card">
        <h4>{t.recent}</h4>
        <div className="notifications-history">
          {notifications.length === 0 ? (
            <div className="notifications-empty">{t.empty}</div>
          ) : (
            notifications.map(item => (
              <div key={item.id} className={`notifications-history-item level-${item.level}`}>
                <div className="notifications-history-title">{item.title}</div>
                <div className="notifications-history-message">{item.message}</div>
                <div className="notifications-history-meta">
                  <span>{item.level.toUpperCase()}</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
