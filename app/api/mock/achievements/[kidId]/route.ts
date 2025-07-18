import { NextRequest, NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ kidId: string }> }
) {
    try {
        const { kidId } = await params;
        const achievements = mockDataService.getAchievementsByKidId(kidId);

        return NextResponse.json(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return NextResponse.json(
            { error: 'Failed to fetch achievements' },
            { status: 500 }
        );
    }
}
