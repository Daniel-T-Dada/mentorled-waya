import { NextRequest, NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET(
    request: NextRequest,
    { params }: { params: { kidId: string } }
) {
    try {
        const { kidId } = params;
        const goals = mockDataService.getGoalsByKidId(kidId);

        return NextResponse.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        return NextResponse.json(
            { error: 'Failed to fetch goals' },
            { status: 500 }
        );
    }
}
