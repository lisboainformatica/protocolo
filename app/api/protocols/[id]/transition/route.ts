
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Protocol, ProtocolStatus } from '@/models/Protocol';
import { ProtocolStageExecution, StageStatus } from '@/models/ProtocolStageExecution';
import { WorkflowStage } from '@/models/WorkflowStage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';
import { logAudit } from '@/lib/audit';
import { addEmailJob } from '@/lib/queue';

// POST /api/protocols/[id]/transition - Approve/Reject/Return
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { action, notes } = await req.json(); // action: 'approve' | 'reject' | 'return'
        await connectToDatabase();

        const protocol = await Protocol.findById(params.id);
        if (!protocol) return NextResponse.json({ error: "Protocol not found" }, { status: 404 });

        // Get current execution
        const currentExecution = await ProtocolStageExecution.findOne({
            protocolId: protocol._id,
            stageId: protocol.currentStageId,
            status: StageStatus.PENDING
        });

        if (!currentExecution) return NextResponse.json({ error: "No active stage execution found" }, { status: 400 });

        // Validate Permission: User must belong to the sector of the current stage OR be Admin
        const isAdmin = session.user.roles.includes('administrador');
        const isGestor = session.user.roles.includes('gestor');

        // Strictly speaking we should check sector match: session.user.sector === currentExecution.sectorId
        // keeping flexible for now as agreed.

        // Logic for transition
        const currentStage = await WorkflowStage.findById(protocol.currentStageId);
        if (!currentStage) return NextResponse.json({ error: "Current stage config missing" }, { status: 500 });

        const sessionTransaction = await mongoose.startSession();
        sessionTransaction.startTransaction();

        try {
            // 1. Complete current execution
            currentExecution.status = action === 'approve' ? StageStatus.APPROVED : (action === 'reject' ? StageStatus.REJECTED : StageStatus.RETURNED);
            currentExecution.endDate = new Date();
            currentExecution.responsibleUserId = session.user.id;
            currentExecution.notes = notes;
            await currentExecution.save({ session: sessionTransaction });

            // 2. Determine Next functionality
            if (action === 'approve') {
                // Find next stage
                const nextStage = await WorkflowStage.findOne({
                    workflowId: protocol.workflowId,
                    order: { $gt: currentStage.order }
                }).sort({ order: 1 }).session(sessionTransaction);

                if (nextStage) {
                    // Move to next stage
                    protocol.currentStageId = nextStage._id;
                    await ProtocolStageExecution.create([{
                        protocolId: protocol._id,
                        stageId: nextStage._id,
                        sectorId: nextStage.responsibleSectorId,
                        status: StageStatus.PENDING,
                        startDate: new Date()
                    }], { session: sessionTransaction });
                } else {
                    // Workflow Finished
                    protocol.status = ProtocolStatus.COMPLETED;
                    protocol.currentStageId = undefined; // No active stage
                }
            } else if (action === 'return' || action === 'reject') {
                const prevStage = await WorkflowStage.findOne({
                    workflowId: protocol.workflowId,
                    order: { $lt: currentStage.order }
                }).sort({ order: -1 }).session(sessionTransaction);

                if (prevStage && action === 'return') {
                    protocol.currentStageId = prevStage._id;
                    await ProtocolStageExecution.create([{
                        protocolId: protocol._id,
                        stageId: prevStage._id,
                        sectorId: prevStage.responsibleSectorId,
                        status: StageStatus.PENDING,
                        startDate: new Date(),
                        systemNotes: `Returned from ${currentStage.name}`
                    }], { session: sessionTransaction });
                } else {
                    protocol.status = ProtocolStatus.REJECTED;
                    protocol.currentStageId = undefined;
                }
            }

            await protocol.save({ session: sessionTransaction });
            await sessionTransaction.commitTransaction();

            // Fire and forget side effects (Audit & Email)
            // We do this AFTER commit to ensure consistency
            const stageName = currentStage.name;
            const logDetails = { protocolId: protocol._id, stage: stageName, action, notes };

            await logAudit({
                action: `PROTOCOL_TRANSITION_${action.toUpperCase()}`,
                resourceType: 'Protocol',
                resourceId: protocol._id.toString(),
                details: logDetails,
                req,
                userId: session.user.id
            });

            // Mock sending email to requester
            // In real app, we would fetch requester email
            addEmailJob('requester@example.com', `Protocolo ${protocol.protocolNumber} Atualizado`, `O protocolo foi ${action === 'approve' ? 'aprovado' : action}.`);

            return NextResponse.json({ success: true });

        } catch (err) {
            await sessionTransaction.abortTransaction();
            throw err;
        } finally {
            sessionTransaction.endSession();
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
