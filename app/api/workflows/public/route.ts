
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Workflow } from '@/models/Workflow';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/workflows/public - List workflows for solicitantes
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const workflows = await Workflow.find({ isActive: true }).select('name description createdAt');
    return NextResponse.json(workflows);
}
