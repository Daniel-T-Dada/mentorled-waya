import { NextResponse } from 'next/server';
import mockData from '@/mockdata/mockData.json';

export async function GET() {
    try {
        // Mock children wallets data based on the structure expected by AppStatCard
        const mockChildrenWallets = mockData.parent.children.map(child => ({
            id: `wallet-${child.id}`,
            child: {
                id: child.id,
                username: child.name,
                avatar: child.avatar
            },
            balance: child.balance,
            total_earned: child.balance + 2000, // Mock some earned amount
            total_spent: 1000, // Mock some spent amount
            savings_rate: Math.round((child.balance / (child.balance + 1000)) * 100), // Calculate savings rate
            created_at: "2024-01-01T00:00:00Z",
            updated_at: new Date().toISOString(),
            recent_transactions: [
                {
                    id: `tx-${child.id}-1`,
                    transaction_type: "reward",
                    amount: "500.00",
                    description: "Chore reward",
                    status: "completed",
                    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    child: {
                        id: child.id,
                        username: child.name,
                        avatar: child.avatar
                    }
                }
            ]
        }));

        return NextResponse.json(mockChildrenWallets);
    } catch (error) {
        console.error('Error in mock children-wallets endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to fetch children wallets' },
            { status: 500 }
        );
    }
}
