import { getApiUrl, API_ENDPOINTS } from './api';

/**
 * Enhanced transaction interface with better descriptions
 */
export interface EnhancedTransaction {
    id: string;
    type: string;
    amount: string;
    status: string;
    description: string;
    created_at: string;
    child_name?: string;
    chore_title?: string;
}

/**
 * Extract chore ID from transaction description
 */
export const extractChoreId = (description: string): string | null => {
    if (description && description.includes('Reward for chore ')) {
        return description.replace('Reward for chore ', '').trim();
    }
    return null;
};

/**
 * Fetch chore details by ID
 */
export const fetchChoreDetails = async (choreId: string, accessToken: string) => {
    try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.TASK_DETAIL.replace(':taskId', choreId)), {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn(`Failed to fetch chore ${choreId}:`, error);
    }
    return null;
};

/**
 * Enhance transaction descriptions by replacing generic chore references with actual chore titles
 */
export const enhanceTransactionDescriptions = async (
    transactions: any[],
    accessToken: string
): Promise<EnhancedTransaction[]> => {
    // Extract unique chore IDs
    const choreIds = new Set<string>();
    transactions.forEach((transaction) => {
        const choreId = extractChoreId(transaction.description);
        if (choreId) {
            choreIds.add(choreId);
        }
    });

    // Fetch chore details for all unique chore IDs
    const choreDetailsMap = new Map<string, any>();
    if (choreIds.size > 0) {
        try {
            const chorePromises = Array.from(choreIds).map(async (choreId) => {
                const choreDetail = await fetchChoreDetails(choreId, accessToken);
                return choreDetail ? { choreId, choreDetail } : null;
            });

            const choreResults = await Promise.all(chorePromises);
            choreResults.forEach((result) => {
                if (result) {
                    choreDetailsMap.set(result.choreId, result.choreDetail);
                }
            });
        } catch (error) {
            console.warn('Error fetching chore details:', error);
        }
    }

    // Transform transactions with enhanced descriptions
    return transactions.map((transaction): EnhancedTransaction => {
        let description = transaction.description || 'Transaction';
        let childName = transaction.child_name || 'N/A';
        let choreTitle = undefined;

        const choreId = extractChoreId(transaction.description);
        if (choreId) {
            const choreDetail = choreDetailsMap.get(choreId);
            if (choreDetail) {
                description = choreDetail.title || choreDetail.name || 'Chore Reward';
                childName = choreDetail.assignedToName || childName;
                choreTitle = choreDetail.title || choreDetail.name;
            }
        }

        return {
            id: transaction.id,
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            description,
            created_at: transaction.created_at,
            child_name: childName,
            chore_title: choreTitle,
        };
    });
};

/**
 * Format transaction for display in tables/lists
 */
export const formatTransactionForDisplay = (transaction: EnhancedTransaction) => {
    // Map status to valid ActivityRow status values
    const mapStatus = (status: string): "completed" | "pending" | "cancelled" | "paid" | "processing" => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'paid';
            case 'pending':
                return 'pending';
            case 'cancelled':
            case 'canceled':
                return 'cancelled';
            case 'processing':
                return 'processing';
            case 'completed':
                return 'completed';
            default:
                return 'completed'; // Default fallback
        }
    };

    return {
        id: transaction.id,
        name: transaction.child_name || 'N/A',
        activity: transaction.description,
        amount: parseFloat(transaction.amount) || 0,
        status: mapStatus(transaction.status),
        date: transaction.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    };
};
