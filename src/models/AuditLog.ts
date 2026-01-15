import { executeQuery } from '../config/database';

export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface AuditLogQuery {
  userId?: number;
  action?: string;
  entityType?: string;
  keyword?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

const mapRowToAuditLog = (row: any): AuditLog => ({
  id: row.id,
  userId: row.user_id,
  action: row.action,
  entityType: row.entity_type,
  entityId: row.entity_id,
  description: row.description,
  ipAddress: row.ip_address,
  userAgent: row.user_agent,
  createdAt: row.created_at
});

export class AuditLogService {
  static async createLog(payload: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
    const query = `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, description, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await executeQuery(query, [
      payload.userId,
      payload.action,
      payload.entityType,
      payload.entityId,
      payload.description,
      payload.ipAddress,
      payload.userAgent
    ]);
  }

  static async queryLogs(filters: AuditLogQuery): Promise<{ logs: AuditLog[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (typeof filters.userId === 'number') {
      conditions.push('user_id = ?');
      values.push(filters.userId);
    }
    if (filters.action) {
      conditions.push('action = ?');
      values.push(filters.action);
    }
    if (filters.entityType) {
      conditions.push('entity_type = ?');
      values.push(filters.entityType);
    }
    if (filters.keyword) {
      conditions.push('description LIKE ?');
      values.push(`%${filters.keyword}%`);
    }
    if (filters.from) {
      conditions.push('created_at >= ?');
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push('created_at <= ?');
      values.push(filters.to);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const totalRows = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
      values
    );
    const total = totalRows[0]?.count ?? 0;

    const rows = await executeQuery(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return { logs: rows.map(mapRowToAuditLog), total };
  }
}
