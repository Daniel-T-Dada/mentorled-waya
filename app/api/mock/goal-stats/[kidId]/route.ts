import { NextRequest, NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET(
    request: NextRequest,
    { params }: { params: { kidId: string } }
) {
    try {
        const { kidId } = params;
        const goalStats = mockDataService.getGoalStatsByKidId(kidId);

        return NextResponse.json(goalStats);
    } catch (error) {
        console.error('Error fetching goal stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch goal stats' },
            { status: 500 }
        );
    }
}
