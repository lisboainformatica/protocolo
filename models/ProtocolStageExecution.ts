
import mongoose, { Schema, Document, Model } from 'mongoose';

export enum StageStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    RETURNED = 'returned',
}

export interface IProtocolStageExecution extends Document {
    protocolId: mongoose.Types.ObjectId;
    stageId: mongoose.Types.ObjectId; // WorkflowStage ID
    sectorId: mongoose.Types.ObjectId; // Responsible sector at the time
    responsibleUserId?: mongoose.Types.ObjectId; // User who acted on it
    startDate: Date;
    endDate?: Date;
    status: StageStatus;
    notes?: string;
    systemNotes?: string; // For automated actions (e.g. validade SLA)
}

const ProtocolStageExecutionSchema = new Schema<IProtocolStageExecution>(
    {
        protocolId: { type: Schema.Types.ObjectId, ref: 'Protocol', required: true, index: true },
        stageId: { type: Schema.Types.ObjectId, ref: 'WorkflowStage', required: true },
        sectorId: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
        responsibleUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        status: { type: String, enum: Object.values(StageStatus), default: StageStatus.PENDING },
        notes: { type: String },
        systemNotes: { type: String },
    },
    { timestamps: false }
);

export const ProtocolStageExecution: Model<IProtocolStageExecution> =
    mongoose.models.ProtocolStageExecution || mongoose.model<IProtocolStageExecution>('ProtocolStageExecution', ProtocolStageExecutionSchema);
