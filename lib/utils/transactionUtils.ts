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
 * Enhance transaction descriptions using a provided map of chore details
 * (choreDetailsMap should be built in parent/page via useApiQuery for all needed chore IDs)
 */
export const enhanceTransactionDescriptions = (
    transactions: any[],
    choreDetailsMap: Map<string, any>
): EnhancedTransaction[] => {
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