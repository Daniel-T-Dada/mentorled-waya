
export interface Transaction {
    id: string;
    type: 'earn' | 'spend' | 'allowance' | 'bonus';
    amount: number;
    description: string;
    date: string;
    relatedTaskId?: string;
}

export interface WalletStats {
    totalEarned: number;
    totalSpent: number;
}

export interface AllowanceForm {
    amount: number;
    description: string;
}

export interface BonusForm {
    amount: number;
    description: string;
}

export interface KidWalletData {
    transactions: Transaction[];
    stats: WalletStats;
    isLoading: boolean;
    error: string | null;
}
