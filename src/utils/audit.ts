import { Request } from 'express';
import { AuditLogService } from '../models/AuditLog';

interface AuditPayload {
  userId: number | null;
  action: string;
  entityType?: string | null;
  entityId?: number | null;
  description?: string | null;
}

export const logAudit = async (req: Request, payload: AuditPayload): Promise<void> => {
  try {
    await AuditLogService.createLog({
      userId: payload.userId,
      action: payload.action,
      entityType: payload.entityType ?? null,
      entityId: payload.entityId ?? null,
      description: payload.description ?? null,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] || null
    });
  } catch (error) {
    console.warn('Failed to write audit log:', error);
  }
};
