
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Workflow } from '@/models/Workflow';
import { WorkflowStage } from '@/models/WorkflowStage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/models/User';

// GET /api/admin/workflows/[id] - Get workflow details with stages
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    const workflow = await Workflow.findById(params.id);

    if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const stages = await WorkflowStage.find({ workflowId: params.id }).sort({ order: 1 }).populate('responsibleSectorId');

    return NextResponse.json({ ...workflow.toObject(), stages });
}

// PUT /api/admin/workflows/[id] - Update workflow
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.includes(UserRole.ADMINISTRADOR)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        await connectToDatabase();

        // Update Workflow basic info
        const workflow = await Workflow.findByIdAndUpdate(params.id, {
            name: body.name,
            description: body.description,
            isActive: body.isActive
        }, { new: true });

        // Handle Stages update if provided (Full replacement or partial? Assuming full replacement logic for simplicity in MVP or separate endpoint. User spec implies specific endpoints for everything. I'll stick to updating basic info here and stages via separate endpoint or specific logic if needed).
        // Actually, common pattern is to manage stages separately or nested. 
        // I will support simple stage update here if `stages` array is present.

        if (body.stages && Array.isArray(body.stages)) {
            // Transaction would be better here
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                // Delete existing stages
                await WorkflowStage.deleteMany({ workflowId: params.id }, { session });

                // Re-create stages
                const newStages = body.stages.map((s: any, idx: number) => ({
                    workflowId: params.id,
                    name: s.name,
                    order: s.order || idx + 1,
                    responsibleSectorId: s.responsibleSectorId,
                    slaHours: s.slaHours,
                    isMandatory: s.isMandatory
                }));

                await WorkflowStage.insertMany(newStages, { session });
                await session.commitTransaction();
            } catch (err) {
                await session.abortTransaction();
                throw err;
            } finally {
                session.endSession();
            }
        }

        return NextResponse.json(workflow);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/admin/workflows/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.includes(UserRole.ADMINISTRADOR)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await connectToDatabase();
        // Check if used in protocols?
        // const used = await Protocol.exists({ workflowId: params.id });
        // if (used) throw new Error("Cannot delete active workflow with protocols");

        await Workflow.findByIdAndDelete(params.id);
        await WorkflowStage.deleteMany({ workflowId: params.id });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
