
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFile extends Document {
    originalName: string;
    mimeType: string;
    size: number;
    url: string; // Cloudinary/S3 URL
    publicId?: string; // Cloudinary Public ID or S3 Key
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const FileSchema = new Schema<IFile>(
    {
        originalName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        url: { type: String, required: true },
        publicId: { type: String },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const File: Model<IFile> =
    mongoose.models.File || mongoose.model<IFile>('File', FileSchema);
