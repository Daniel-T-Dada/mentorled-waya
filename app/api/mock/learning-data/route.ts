import { NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET() {
    try {
        const learningData = mockDataService.getLearningData();

        return NextResponse.json(learningData, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching learning data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch learning data' },
            { status: 500 }
        );
    }
}