
import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from './User';

export interface IAuditLog extends Document {
    action: string; // e.g., 'CREATE_PROTOCOL', 'APPROVE_STAGE', 'LOGIN'
    userId?: mongoose.Types.ObjectId; // User who performed the action
    resourceId?: mongoose.Types.ObjectId; // ID of the resource affected (Protocol, Workflow, etc.)
    resourceType: string; // 'Protocol', 'Workflow', 'User'
    details?: Record<string, any>; // JSON details
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        action: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        resourceId: { type: Schema.Types.ObjectId },
        resourceType: { type: String, required: true },
        details: { type: Schema.Types.Mixed },
        ipAddress: { type: String },
        userAgent: { type: String },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

export const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
