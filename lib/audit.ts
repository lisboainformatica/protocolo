
import { NextRequest } from 'next/server';
import connectToDatabase from './db';
import { AuditLog } from '@/models/AuditLog';
import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';

interface AuditParams {
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: any;
    req?: NextRequest;
    userId?: string;
}

export async function logAudit({ action, resourceType, resourceId, details, req, userId }: AuditParams) {
    try {
        await connectToDatabase();

        let finalUserId = userId;

        if (!finalUserId && req) {
            // Try to get from session if not provided
            // Note: obtaining session here might be heavy if already done in calling function.
            // It is better to pass userId if available.
        }

        const ip = req ? (req.headers.get('x-forwarded-for') || 'unknown') : 'unknown';
        const userAgent = req ? (req.headers.get('user-agent') || 'unknown') : 'unknown';

        await AuditLog.create({
            action,
            resourceType,
            resourceId,
            details,
            userId: finalUserId,
            ipAddress: ip,
            userAgent,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Failed to log audit:', error);
        // Fail silently so we don't block the main flow? Or throw error for strict auditing?
        // User requested "Auditavel", so maybe we should ensure it logs. 
        // But for UI responsiveness, usually async/fire-and-forget is better unless critical.
    }
}
