import { NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ kidId: string }> }
) {
    try {
        const { kidId } = await params;
        const chores = mockDataService.getChoresByKidId(kidId);

        return NextResponse.json(chores);
    } catch (error) {
        console.error('Error fetching kid chores:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kid chores data' },
            { status: 500 }
        );
    }
}
