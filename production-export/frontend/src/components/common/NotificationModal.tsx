import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import notificationService, { UserNotification } from '../../services/notificationService';
import './NotificationModal.css';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: {
    title: string;
    empty: string;
    loading: string;
    markRead: string;
    delete: string;
    clearAll: string;
  };
}

export function NotificationModal({ isOpen, onClose, labels }: NotificationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<UserNotification[]>([]);
  const unreadCount = useMemo(() => items.filter(item => !item.readAt).length, [items]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setItems(data);
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    loadNotifications();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setItems(prev => prev.map(item => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
    } catch (error) {
      console.warn('Failed to mark read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.warn('Failed to delete notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAll();
      setItems([]);
    } catch (error) {
      console.warn('Failed to clear notifications:', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  const modal = (
    <div className="notification-modal-overlay">
      <div className="notification-modal" ref={modalRef}>
        <div className="notification-modal-header">
          <div>
            <h2>{labels.title}</h2>
            <p>{unreadCount > 0 ? `未读 ${unreadCount}` : ''}</p>
          </div>
          <div className="notification-modal-actions">
            <button type="button" onClick={handleClearAll} disabled={items.length === 0}>
              {labels.clearAll}
            </button>
            <button type="button" className="close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        <div className="notification-modal-body">
          {loading ? (
            <div className="notification-modal-empty">{labels.loading}</div>
          ) : items.length === 0 ? (
            <div className="notification-modal-empty">{labels.empty}</div>
          ) : (
            items.map(item => (
              <div key={item.id} className={`notification-modal-item ${item.readAt ? 'read' : 'unread'}`}>
                <div className="notification-modal-main">
                  <div className="notification-modal-title">{item.title}</div>
                  <div className="notification-modal-message">{item.message}</div>
                  <div className="notification-modal-time">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="notification-modal-ops">
                  {!item.readAt && (
                    <button type="button" onClick={() => handleMarkRead(item.id)}>
                      {labels.markRead}
                    </button>
                  )}
                  <button type="button" className="danger" onClick={() => handleDelete(item.id)}>
                    {labels.delete}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
