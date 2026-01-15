import api from './api';

export interface UserNotification {
  id: number;
  title: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  readAt: string | null;
}

class NotificationService {
  async getNotifications(unreadOnly = false): Promise<UserNotification[]> {
    const response = await api.get('/notifications', {
      params: unreadOnly ? { unread: true } : undefined
    });
    return (response.data as any).data.notifications;
  }

  async markAsRead(notificationId: number): Promise<void> {
    await api.post(`/notifications/${notificationId}/read`);
  }
}

const notificationService = new NotificationService();

export default notificationService;
