import { NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET() {
    try {
        const chores = mockDataService.getAllChores();
        return NextResponse.json(chores);
    } catch (error) {
        console.error('Error fetching chores:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chores data' },
            { status: 500 }
        );
    }
}

// GET chores by kid ID
export async function POST(request: Request) {
    try {
        const { kidId } = await request.json();

        if (!kidId) {
            return NextResponse.json(
                { error: 'Kid ID is required' },
                { status: 400 }
            );
        }

        const chores = mockDataService.getChoresByKidId(kidId);
        return NextResponse.json(chores);
    } catch (error) {
        console.error('Error fetching chores by kid ID:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chores data' },
            { status: 500 }
        );
    }
}
