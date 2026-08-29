import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './checkRole';
import { AuditLog, IAuditLog } from './AuditLog.model';

export interface AuditOptions {
  action: IAuditLog['action'];
  resource: IAuditLog['resource'];
  getTargetId?: (req: AuthenticatedRequest) => string;
  getDescription?: (req: AuthenticatedRequest) => string;
}

/**
 * Express middleware that automatically records an audit log entry upon successful response completion (status 2xx).
 */
export const auditLog = (options: AuditOptions) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Intercept res.send / res.json to log after successful response
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Fire and forget logging asynchronously
        recordAudit({
          req,
          action: options.action,
          resource: options.resource,
          targetId: options.getTargetId ? options.getTargetId(req) : (req.params.id || req.body?.id || ''),
          targetDescription: options.getDescription ? options.getDescription(req) : '',
          changes: req.body,
        }).catch((err) => console.error('[AuditLog Error]:', err));
      }
      return originalJson(body);
    };

    return next();
  };
};

/**
 * Directly record an audit log entry from anywhere in backend controller logic.
 */
export const recordAudit = async ({
  req,
  action,
  resource,
  targetId,
  targetDescription,
  changes,
}: {
  req: AuthenticatedRequest;
  action: IAuditLog['action'];
  resource: IAuditLog['resource'];
  targetId?: string;
  targetDescription?: string;
  changes?: Record<string, any>;
}) => {
  try {
    const user = req.user;
    if (!user) return;

    await AuditLog.create({
      adminId: user.id || user._id,
      adminEmail: user.email || 'unknown@charulata.com',
      adminName: user.name || '',
      adminRole: user.role || 'admin',
      action,
      resource,
      targetId: targetId || '',
      targetDescription: targetDescription || '',
      changes: changes ? sanitizeChanges(changes) : {},
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (err) {
    console.error('[AuditLog Creation Failed]:', err);
  }
};

/**
 * Strip sensitive credentials before writing to audit log
 */
function sanitizeChanges(data: Record<string, any>): Record<string, any> {
  const sanitized = { ...data };
  const sensitiveKeys = ['password', 'token', 'refreshToken', 'secret'];
  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}
