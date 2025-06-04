
import { useState, useEffect } from 'react';
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import { type Transaction, type WalletStats } from './types';

export const useKidWalletData = (kidId: string) => {
    const [kid, setKid] = useState<Kid | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const kidData = mockDataService.getKidById(kidId);
                if (kidData) {
                    setKid(kidData);

                    // Generate mock transactions for demonstration
                    const mockTransactions: Transaction[] = [
                        {
                            id: '1',
                            type: 'allowance',
                            amount: 1000,
                            description: 'Weekly allowance',
                            date: '2024-01-08'
                        },
                        {
                            id: '2',
                            type: 'earn',
                            amount: 500,
                            description: 'Completed: Clean room',
                            date: '2024-01-07',
                            relatedTaskId: 'task1'
                        },
                        {
                            id: '3',
                            type: 'earn',
                            amount: 300,
                            description: 'Completed: Do dishes',
                            date: '2024-01-06',
                            relatedTaskId: 'task2'
                        },
                        {
                            id: '4',
                            type: 'spend',
                            amount: -200,
                            description: 'Bought a toy',
                            date: '2024-01-05'
                        },
                        {
                            id: '5',
                            type: 'bonus',
                            amount: 800,
                            description: 'Good behavior bonus',
                            date: '2024-01-04'
                        },
                        {
                            id: '6',
                            type: 'allowance',
                            amount: 1000,
                            description: 'Weekly allowance',
                            date: '2024-01-01'
                        }
                    ];

                    setTransactions(mockTransactions);
                } else {
                    setError('Kid not found');
                }
            } catch {
                setError('Failed to load wallet data');
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [kidId]);

    const calculateStats = (): WalletStats => {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        const thisMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        });

        const totalEarned = thisMonthTransactions
            .filter(t => t.type === 'earn' || t.type === 'allowance' || t.type === 'bonus')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalSpent = thisMonthTransactions
            .filter(t => t.type === 'spend')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return { totalEarned, totalSpent };
    };

    const addTransaction = (transaction: Transaction) => {
        setTransactions(prev => [transaction, ...prev]);

        // Update kid's balance
        if (kid) {
            const updatedBalance = kid.balance + transaction.amount;
            setKid({ ...kid, balance: updatedBalance });
        }
    };

    return {
        kid,
        setKid,
        transactions,
        addTransaction,
        stats: calculateStats(),
        isLoading,
        error
    };
};
