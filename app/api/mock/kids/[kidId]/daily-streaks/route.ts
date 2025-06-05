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

        return NextResponse.json(kid.dailyStreaks || { weeklyProgress: [] });
    } catch (error) {
        console.error('Error fetching daily streaks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch daily streaks data' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ kidId: string }> }
) {
    try {
        const { kidId } = await params;
        const { day, completed } = await request.json();

        const kid = mockDataService.getKidById(kidId);

        if (!kid) {
            return NextResponse.json(
                { error: 'Kid not found' },
                { status: 404 }
            );
        }

        // Update the daily streak for the specific day
        if (kid.dailyStreaks?.weeklyProgress) {
            const dayIndex = kid.dailyStreaks.weeklyProgress.findIndex(d => d.day === day);
            if (dayIndex !== -1) {
                kid.dailyStreaks.weeklyProgress[dayIndex].completed = completed;
            }
        }

        return NextResponse.json(kid.dailyStreaks);
    } catch (error) {
        console.error('Error updating daily streak:', error);
        return NextResponse.json(
            { error: 'Failed to update daily streak' },
            { status: 500 }
        );
    }
}
