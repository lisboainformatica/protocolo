
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Workflow } from '@/models/Workflow';
import { WorkflowStage } from '@/models/WorkflowStage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/models/User';

// GET /api/admin/workflows - List all workflows
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.includes(UserRole.ADMINISTRADOR) && !session.user.roles.includes(UserRole.GESTOR)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    return NextResponse.json(workflows);
}

// POST /api/admin/workflows - Create a new workflow
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.includes(UserRole.ADMINISTRADOR)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        await connectToDatabase();

        const workflow = await Workflow.create({
            name: body.name,
            description: body.description,
            isActive: body.isActive ?? true,
        });

        return NextResponse.json(workflow, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
