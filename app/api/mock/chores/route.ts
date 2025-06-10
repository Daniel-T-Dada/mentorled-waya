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

// Update chore status
export async function PATCH(request: Request) {
    try {
        const { choreId, status } = await request.json();

        if (!choreId) {
            return NextResponse.json(
                { error: 'Chore ID is required' },
                { status: 400 }
            );
        }

        // Validate status
        if (!status || !['completed', 'pending', 'cancelled'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be completed, pending, or cancelled' },
                { status: 400 }
            );
        }

        // Update chore status using mockDataService
        const updatedChore = mockDataService.updateChoreStatus(choreId, status);

        if (!updatedChore) {
            return NextResponse.json(
                { error: 'Chore not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedChore,
            message: `Chore status updated to ${status}`
        });

    } catch (error) {
        console.error('Error updating chore status:', error);
        return NextResponse.json(
            { error: 'Failed to update chore status' },
            { status: 500 }
        );
    }
}
