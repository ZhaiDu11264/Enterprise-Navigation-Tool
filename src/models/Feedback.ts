import { executeQuery } from '../config/database';
import {
  Feedback,
  FeedbackListItem,
  FeedbackQuery,
  FeedbackRow,
  FeedbackStats,
  FeedbackStatus,
  FeedbackType
} from './interfaces';

const mapFeedbackRow = (row: FeedbackRow): Feedback => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  message: row.message,
  status: row.status,
  createdAt: row.created_at
});

export class FeedbackService {
  static async createFeedback(userId: number, type: FeedbackType, message: string): Promise<Feedback> {
    const query = `
      INSERT INTO user_feedback (user_id, type, message, status)
      VALUES (?, ?, ?, 'new')
    `;
    const result = await executeQuery<{ insertId: number }>(query, [userId, type, message]);
    const insertedId = (result as any).insertId;
    const rows = await executeQuery<FeedbackRow>('SELECT * FROM user_feedback WHERE id = ?', [insertedId]);
    const row = rows[0];
    if (!row) {
      throw new Error('Failed to load inserted feedback');
    }
    return mapFeedbackRow(row);
  }

  static async listFeedback(query: FeedbackQuery): Promise<{ items: FeedbackListItem[]; total: number }> {
    const where: string[] = ['1=1'];
    const params: any[] = [];

    if (query.userId !== undefined) {
      where.push('f.user_id = ?');
      params.push(query.userId);
    }
    if (query.type) {
      where.push('f.type = ?');
      params.push(query.type);
    }
    if (query.status) {
      where.push('f.status = ?');
      params.push(query.status);
    }
    if (query.keyword) {
      where.push('(f.message LIKE ? OR u.username LIKE ? OR u.email LIKE ? OR u.display_name LIKE ?)');
      const keyword = `%${query.keyword}%`;
      params.push(keyword, keyword, keyword, keyword);
    }
    if (query.from) {
      where.push('f.created_at >= ?');
      params.push(query.from);
    }
    if (query.to) {
      where.push('f.created_at <= ?');
      params.push(query.to);
    }

    const limit = Number.isFinite(query.limit) ? Number(query.limit) : 50;
    const offset = Number.isFinite(query.offset) ? Number(query.offset) : 0;

    const listQuery = `
      SELECT f.id, f.user_id, f.type, f.message, f.status, f.created_at,
             u.username, u.display_name, u.email
      FROM user_feedback f
      JOIN users u ON u.id = f.user_id
      WHERE ${where.join(' AND ')}
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const listParams = [...params, limit, offset];
    const items = await executeQuery<any>(listQuery, listParams);

    const totalRows = await executeQuery<{ total: number }>(
      `
      SELECT COUNT(*) as total
      FROM user_feedback f
      JOIN users u ON u.id = f.user_id
      WHERE ${where.join(' AND ')}
      `,
      params
    );

    const total = totalRows[0]?.total ?? 0;
    const listItems: FeedbackListItem[] = items.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type as FeedbackType,
      message: row.message,
      status: row.status as FeedbackStatus,
      createdAt: row.created_at,
      username: row.username,
      displayName: row.display_name,
      email: row.email
    }));

    return { items: listItems, total };
  }

  static async getStats(): Promise<FeedbackStats> {
    const totalRows = await executeQuery<{ total: number }>(
      'SELECT COUNT(*) as total FROM user_feedback'
    );
    const total = totalRows[0]?.total ?? 0;

    const typeRows = await executeQuery<{ type: FeedbackType; count: number }>(
      'SELECT type, COUNT(*) as count FROM user_feedback GROUP BY type'
    );
    const byType = typeRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.type] = row.count;
      return acc;
    }, {});

    const statusRows = await executeQuery<{ status: FeedbackStatus; count: number }>(
      'SELECT status, COUNT(*) as count FROM user_feedback GROUP BY status'
    );
    const byStatus = statusRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    const recentRows = await executeQuery<{ date: string; count: number }>(
      `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM user_feedback
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
      `
    );

    return {
      total,
      byType,
      byStatus,
      recent: recentRows.map(row => ({ date: row.date, count: row.count }))
    };
  }
}
