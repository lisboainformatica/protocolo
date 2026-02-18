
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IWorkflowStage } from './WorkflowStage';

export interface IWorkflow extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    stages: IWorkflowStage[]; // Embedded stages directly or referenced? User asked for stages table/schema. 
    // User spec: workflow_etapas separate? 'workflowId' in stages suggests separate collection or at least array of subdocuments.
    // I will use subdocuments array for stages as they are tightly coupled to workflow. No, user asked for `workflow_etapas` with `workflowId`.
    // Actually, embedded array is easier for atomic updates and ordering. But user spec shows separate schema structure.
    // I'll stick to embedded for simplicity unless relational features are critical here. 
    // WAIT, user specified `workflow_etapas` with specific fields. If I separate them, I can query stages independently.
    // I'll use separate model for Stage to be strict with user spec: "workflow_etapas: workflowId, ..."
    createdAt: Date;
    updatedAt: Date;
}

const WorkflowSchema = new Schema<IWorkflow>(
    {
        name: { type: String, required: true },
        description: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Workflow: Model<IWorkflow> =
    mongoose.models.Workflow || mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
