
import mongoose, { Schema, Document, Model } from 'mongoose';

export enum ProtocolStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    COMPLETED = 'completed',
    ARCHIVED = 'archived',
}

export enum ProtocolPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export interface IProtocol extends Document {
    protocolNumber: string; // Sequential ID
    workflowId: mongoose.Types.ObjectId;
    currentStageId?: mongoose.Types.ObjectId; // The workflow stage ID currently active
    requesterId: mongoose.Types.ObjectId; // User ID (solicitante)
    subject: string;
    description: string;
    priority: ProtocolPriority;
    status: ProtocolStatus;
    files: mongoose.Types.ObjectId[]; // Array of File IDs
    createdAt: Date;
    updatedAt: Date;
}

const ProtocolSchema = new Schema<IProtocol>(
    {
        protocolNumber: { type: String, required: true, unique: true },
        workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
        currentStageId: { type: Schema.Types.ObjectId, ref: 'WorkflowStage' }, // Can be null if finished
        requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        subject: { type: String, required: true },
        description: { type: String },
        priority: { type: String, enum: Object.values(ProtocolPriority), default: ProtocolPriority.MEDIUM },
        status: { type: String, enum: Object.values(ProtocolStatus), default: ProtocolStatus.PENDING },
        files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    },
    { timestamps: true }
);

// Index for searching and filtering
ProtocolSchema.index({ status: 1 });
ProtocolSchema.index({ requesterId: 1 });
ProtocolSchema.index({ protocolNumber: 1 });

export const Protocol: Model<IProtocol> =
    mongoose.models.Protocol || mongoose.model<IProtocol>('Protocol', ProtocolSchema);
