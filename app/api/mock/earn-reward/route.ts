import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Return the same structure as mockDataService.getEarnReward()
        const earnRewardData = [
            {
                id: 'reward-1',
                title: 'Earn Reward',
                description: 'Complete tasks to earn amazing rewards',
                icon: 'trophy',
                color: 'yellow',
                level: 1,
                isCompleted: false,
                rewards: [
                    {
                        type: 'money',
                        amount: 500,
                        name: 'Extra Allowance',
                        description: 'Earn extra money for completing bonus tasks'
                    },
                    {
                        type: 'privilege',
                        name: 'Extra Screen Time',
                        description: '30 minutes extra screen time on weekends'
                    }
                ]
            }
        ];

        return NextResponse.json(earnRewardData, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching earn reward data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch earn reward data' },
            { status: 500 }
        );
    }
}