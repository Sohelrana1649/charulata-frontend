import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminEmail: string;
  adminName?: string;
  adminRole: string;
  action: 'DELETE' | 'REFUND' | 'ROLE_CHANGE' | 'SETTINGS_UPDATE' | 'BULK_DELETE' | 'FORCE_STATUS_CHANGE';
  resource: 'PRODUCT' | 'CATEGORY' | 'COUPON' | 'BANNER' | 'REVIEW' | 'CUSTOMER' | 'USER' | 'ORDER' | 'SETTINGS';
  targetId?: string;
  targetDescription?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
    },
    adminName: {
      type: String,
      default: '',
    },
    adminRole: {
      type: String,
      required: true,
      enum: ['super_admin', 'admin', 'staff'],
    },
    action: {
      type: String,
      required: true,
      enum: ['DELETE', 'REFUND', 'ROLE_CHANGE', 'SETTINGS_UPDATE', 'BULK_DELETE', 'FORCE_STATUS_CHANGE'],
      index: true,
    },
    resource: {
      type: String,
      required: true,
      enum: ['PRODUCT', 'CATEGORY', 'COUPON', 'BANNER', 'REVIEW', 'CUSTOMER', 'USER', 'ORDER', 'SETTINGS'],
      index: true,
    },
    targetId: {
      type: String,
      default: '',
      index: true,
    },
    targetDescription: {
      type: String,
      default: '',
    },
    changes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// TTL or Indexing
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
