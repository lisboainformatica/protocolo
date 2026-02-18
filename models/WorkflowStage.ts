
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkflowStage extends Document {
    workflowId: mongoose.Types.ObjectId;
    name: string;
    order: number;
    responsibleSectorId: mongoose.Types.ObjectId;
    slaHours: number;
    isMandatory: boolean;
    actionsOnSlaBreach?: string[]; // e.g., 'notify_manager', 'escalate'
}

const WorkflowStageSchema = new Schema<IWorkflowStage>(
    {
        workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true, index: true },
        name: { type: String, required: true },
        order: { type: Number, required: true },
        responsibleSectorId: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
        slaHours: { type: Number, default: 24 },
        isMandatory: { type: Boolean, default: true },
        actionsOnSlaBreach: { type: [String] },
    },
    { timestamps: false } // User didn't ask for timestamps on stages, but useful. I'll omit to be strict or lightweight.
);

// Compound index for unique order per workflow
WorkflowStageSchema.index({ workflowId: 1, order: 1 }, { unique: true });

export const WorkflowStage: Model<IWorkflowStage> =
    mongoose.models.WorkflowStage || mongoose.model<IWorkflowStage>('WorkflowStage', WorkflowStageSchema);
