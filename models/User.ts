
import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
    SOLICITANTE = 'solicitante',
    ATENDENTE = 'atendente',
    SUPERVISOR_SETOR = 'supervisor_setor',
    GESTOR = 'gestor',
    AUDITOR = 'auditor',
    ADMINISTRADOR = 'administrador',
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    roles: UserRole[];
    sector?: string; // ID of the sector if applicable
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false },
        image: { type: String },
        roles: {
            type: [String],
            enum: Object.values(UserRole),
            default: [UserRole.SOLICITANTE],
        },
        sector: { type: Schema.Types.ObjectId, ref: 'Sector' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
