
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Protocol } from '@/models/Protocol';
import { ProtocolStageExecution } from '@/models/ProtocolStageExecution';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/protocols/[id] - Get protocol details and history
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const protocol = await Protocol.findById(params.id)
        .populate('workflowId', 'name')
        .populate('currentStageId', 'name slaHours responsibleSectorId') // Need sector to check permission
        .populate('requesterId', 'name email')
        .populate('files');

    if (!protocol) {
        return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    // Check visibility (Same as List)
    // ...

    const history = await ProtocolStageExecution.find({ protocolId: params.id })
        .populate('stageId', 'name')
        .populate('sectorId', 'name')
        .populate('responsibleUserId', 'name')
        .sort({ startDate: 1 });

    return NextResponse.json({ ...protocol.toObject(), history });
}
