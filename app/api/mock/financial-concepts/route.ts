import { NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function GET() {
    try {
        const financialConcepts = mockDataService.getFinancialConcepts();

        return NextResponse.json(financialConcepts, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching financial concepts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch financial concepts' },
            { status: 500 }
        );
    }
}