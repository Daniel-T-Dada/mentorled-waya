import { NextResponse } from 'next/server';
import { mockDataService } from '@/lib/services/mockDataService';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ kidId: string; rewardId: string }> }
) {
    try {
        const { kidId, rewardId } = await params;
        const { isRedeemed } = await request.json();

        const kid = mockDataService.getKidById(kidId);

        if (!kid) {
            return NextResponse.json(
                { error: 'Kid not found' },
                { status: 404 }
            );
        }

        // Update the specific reward's redemption status
        if (kid.rewards) {
            const rewardIndex = kid.rewards.findIndex(r => r.id === rewardId);
            if (rewardIndex !== -1) {
                kid.rewards[rewardIndex].isRedeemed = isRedeemed;
                return NextResponse.json(kid.rewards[rewardIndex]);
            } else {
                return NextResponse.json(
                    { error: 'Reward not found' },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: 'No rewards found for this kid' },
            { status: 404 }
        );
    } catch (error) {
        console.error('Error updating reward:', error);
        return NextResponse.json(
            { error: 'Failed to update reward' },
            { status: 500 }
        );
    }
}
