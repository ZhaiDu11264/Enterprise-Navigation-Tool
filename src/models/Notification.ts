import { executeQuery } from '../config/database';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: number;
  title: string;
  message: string;
  level: NotificationLevel;
  createdBy: number | null;
  createdAt: Date;
}

export interface NotificationRecipient {
  id: number;
  notificationId: number;
  userId: number;
  readAt: Date | null;
  deliveredAt: Date;
}

export interface NotificationListItem {
  id: number;
  title: string;
  message: string;
  level: NotificationLevel;
  createdAt: Date;
  readAt: Date | null;
}

const mapNotification = (row: any): Notification => ({
  id: row.id,
  title: row.title,
  message: row.message,
  level: row.level,
  createdBy: row.created_by,
  createdAt: row.created_at
});

export class NotificationService {
  static async createNotification(
    createdBy: number | null,
    title: string,
    message: string,
    level: NotificationLevel,
    userIds: number[]
  ): Promise<Notification> {
    const insertNotificationQuery = `
      INSERT INTO notifications (title, message, level, created_by)
      VALUES (?, ?, ?, ?)
    `;
    const result = await executeQuery<{ insertId: number }>(insertNotificationQuery, [
      title,
      message,
      level,
      createdBy
    ]);
    const notificationId = (result as any).insertId as number;

    if (userIds.length > 0) {
      const values = userIds.map(() => '(?, ?)').join(', ');
      const params: Array<number> = [];
      userIds.forEach((userId) => {
        params.push(notificationId, userId);
      });
      await executeQuery(
        `INSERT INTO notification_recipients (notification_id, user_id) VALUES ${values}`,
        params
      );
    }

    const [row] = await executeQuery('SELECT * FROM notifications WHERE id = ?', [notificationId]);
    return mapNotification(row);
  }

  static async listUserNotifications(userId: number, unreadOnly = false): Promise<NotificationListItem[]> {
    const whereClause = unreadOnly ? 'AND nr.read_at IS NULL' : '';
    const rows = await executeQuery(
      `
      SELECT n.id, n.title, n.message, n.level, n.created_at, nr.read_at
      FROM notification_recipients nr
      JOIN notifications n ON n.id = nr.notification_id
      WHERE nr.user_id = ?
      ${whereClause}
      ORDER BY n.created_at DESC
      `,
      [userId]
    );

    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      level: row.level,
      createdAt: row.created_at,
      readAt: row.read_at
    }));
  }

  static async markAsRead(userId: number, notificationId: number): Promise<void> {
    await executeQuery(
      `
      UPDATE notification_recipients
      SET read_at = NOW()
      WHERE user_id = ? AND notification_id = ?
      `,
      [userId, notificationId]
    );
  }

  static async listAdminNotifications(limit = 50): Promise<Notification[]> {
    const rows = await executeQuery(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows.map(mapNotification);
  }
}
