import { NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET() {
    try {
        const parent = mockDataService.getParent();
        return NextResponse.json(parent);
    } catch (error) {
        console.error('Error fetching parent:', error);
        return NextResponse.json(
            { error: 'Failed to fetch parent data' },
            { status: 500 }
        );
    }
}
