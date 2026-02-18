
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISector extends Document {
    name: string;
    description?: string;
    managerId?: mongoose.Types.ObjectId; // User ID of 'gestor' or 'supervisor'
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SectorSchema = new Schema<ISector>(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        managerId: { type: Schema.Types.ObjectId, ref: 'User' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Sector: Model<ISector> =
    mongoose.models.Sector || mongoose.model<ISector>('Sector', SectorSchema);
