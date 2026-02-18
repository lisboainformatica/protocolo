
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Protocol, ProtocolStatus } from '@/models/Protocol';
import { ProtocolStageExecution, StageStatus } from '@/models/ProtocolStageExecution';
import { Workflow } from '@/models/Workflow';
import { WorkflowStage } from '@/models/WorkflowStage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// POST /api/protocols - Create a new protocol
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        await connectToDatabase();

        // 1. Validate Workflow
        const workflow = await Workflow.findById(body.workflowId);
        if (!workflow || !workflow.isActive) {
            return NextResponse.json({ error: 'Invalid workflow' }, { status: 400 });
        }

        // 2. Get First Stage
        const firstStage = await WorkflowStage.findOne({ workflowId: workflow._id }).sort({ order: 1 });
        if (!firstStage) {
            return NextResponse.json({ error: 'Workflow has no stages' }, { status: 400 });
        }

        // 3. Generate Protocol Number (YYYY-SEQ)
        const year = new Date().getFullYear();
        const count = await Protocol.countDocuments({
            createdAt: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) }
        });
        const protocolNumber = `${year}-${(count + 1).toString().padStart(6, '0')}`;

        // 4. Create Protocol
        const protocol = await Protocol.create({
            protocolNumber,
            workflowId: workflow._id,
            currentStageId: firstStage._id,
            requesterId: session.user.id,
            subject: body.subject,
            description: body.description,
            priority: body.priority,
            files: body.files, // IDs of uploaded files
            status: ProtocolStatus.PENDING,
        });

        // 5. Create Stage Execution for the first stage
        await ProtocolStageExecution.create({
            protocolId: protocol._id,
            stageId: firstStage._id,
            sectorId: firstStage.responsibleSectorId,
            status: StageStatus.PENDING,
            startDate: new Date(),
        });

        return NextResponse.json(protocol, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// GET /api/protocols - List user protocols
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // Filter logic:
    // - Solicitante: sees own protocols
    // - Atendente/Supervisor: sees protocols currently in their sector? Or all depending on permissions.
    // Simplifying: 
    // If Admin/Gestor/Auditor -> All
    // If Solicitante -> Own
    // If Atendente -> Own + In their sector?

    const { searchParams } = new URL(req.url);
    const filter: any = {};

    if (!session.user.roles.includes('administrador') && !session.user.roles.includes('gestor') && !session.user.roles.includes('auditor')) {
        // If regular user, check if they are requester OR if they are working on it?
        // For simplicity:
        if (session.user.roles.includes('solicitante')) { // Primary role usually
            filter.requesterId = session.user.id;
        }
        // TODO: Add logic for sector visibility
    }

    const protocols = await Protocol.find(filter)
        .populate('workflowId', 'name')
        .populate('currentStageId', 'name')
        .sort({ createdAt: -1 })
        .limit(50);

    return NextResponse.json(protocols);
}
