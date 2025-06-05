import { NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET() {
    try {
        const parent = mockDataService.getParent();
        const kids = parent.children;

        return NextResponse.json(kids);
    } catch (error) {
        console.error('Error fetching kids:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kids data' },
            { status: 500 }
        );
    }
}
