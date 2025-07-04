import { NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ kidId: string }> }
) {
    try {
        const { kidId } = await params;
        const kid = mockDataService.getKidById(kidId);

        if (!kid) {
            return NextResponse.json(
                { error: 'Kid not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(kid.rewards || []);
    } catch (error) {
        console.error('Error fetching rewards:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rewards data' },
            { status: 500 }
        );
    }
}
