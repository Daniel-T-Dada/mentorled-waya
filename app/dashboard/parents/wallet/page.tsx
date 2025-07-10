/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'



import { FamilyWalletLazy } from "@/components/lazy/pages/FamilyWalletLazy";
import { MakePaymentLazy as MakePayment } from "@/components/lazy/modals/MakePaymentLazy";
import { AddFundsLazy as AddFunds } from "@/components/lazy/modals/AddFundsLazy";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { eventManager } from "@/lib/realtime";
import { WalletUpdatePayload, TransactionUpdatePayload, WayaEvent } from "@/lib/realtime/types";


interface Transaction {
    id: string;
    type: 'topup' | 'withdrawal';
    amount: number;
    description: string;
    createdAt: string;
    status: string;
}

interface Wallet {
    id: string;
    kidId: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

const FamilyWalletPage = () => {
    const { data: session } = useSession();
    const [isMakePaymentOpen, setIsMakePaymentOpen] = useState(false);
    const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Calculate total balance from all wallets, ensure wallets is an array
    const totalBalance = Array.isArray(wallets)
        ? wallets.reduce((sum, wallet) => sum + (typeof wallet.balance === 'number' ? wallet.balance : 0), 0)
        : 0;
    // Fetch wallet data - memoized to prevent unnecessary re-renders
    const fetchWalletData = useCallback(async () => {
        if (!session?.user?.accessToken) return;

        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.CHILDREN_WALLETS), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch wallet data');
            const data = await response.json();
            setWallets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching wallet:', error);
            toast.error('Failed to load wallet data');
            setWallets([]);
        }
    }, [session?.user?.accessToken]);

    // Fetch transactions - memoized to prevent unnecessary re-renders
    const fetchTransactions = useCallback(async () => {
        if (!session?.user?.accessToken) return;

        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.TRANSACTIONS), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch transactions');
            const data = await response.json();
            // Handle paginated response - use data.results for the transactions array
            setTransactions(Array.isArray(data.results) ? data.results : []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
            setTransactions([]);
        }
    }, [session?.user?.accessToken]);

    // Fetch notifications - memoized to prevent unnecessary re-renders
    const fetchNotifications = useCallback(async () => {
        if (!session?.user?.accessToken) return;

        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.NOTIFICATIONS_LIST), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
            setNotifications([]);
        }
    }, [session?.user?.accessToken]);


    useEffect(() => {
        if (session) {
            fetchWalletData();
            fetchTransactions();
            fetchNotifications();
        }
    }, [session, fetchWalletData, fetchTransactions, fetchNotifications]);

    // Set up real-time transaction and wallet updates subscription
    useEffect(() => {
        if (!session?.user?.id) return;

        const handleWalletUpdate = (event: WayaEvent<WalletUpdatePayload>) => {
            console.log('FamilyWalletPage: Received wallet update event:', event);
            // Refresh wallet data when wallet updates occur
            fetchWalletData();
        };

        const handleTransactionUpdate = (event: WayaEvent<TransactionUpdatePayload>) => {
            console.log('FamilyWalletPage: Received transaction update event:', event);
            const { payload } = event;

            if (payload.action === "CREATE" && payload.transaction) {
                // Add new transaction to the top of the list
                setTransactions(prev => [payload.transaction, ...prev]);
            } else {
                // For other actions, refresh transactions
                fetchTransactions();
            }
        };

        // Subscribe to both wallet and transaction events
        const unsubscribeWallet = eventManager.subscribe('WALLET_UPDATE', handleWalletUpdate);
        const unsubscribeTransaction = eventManager.subscribe('TRANSACTION_UPDATE', handleTransactionUpdate);

        return () => {
            unsubscribeWallet();
            unsubscribeTransaction();
        };
    }, [session?.user?.id, fetchWalletData, fetchTransactions]);


    return (
        <div>
            <FamilyWalletLazy
                onAddAllowanceClick={() => setIsMakePaymentOpen(true)}
                onAddFundsClick={() => setIsAddFundsOpen(true)}
            />
            <MakePayment
                isOpen={isMakePaymentOpen}
                onClose={() => setIsMakePaymentOpen(false)}
                onSuccess={() => {
                    // Real-time updates will handle data refresh automatically
                    console.log('Payment completed - real-time updates will handle refresh');
                }}
            />
            <AddFunds
                isOpen={isAddFundsOpen}
                onClose={() => setIsAddFundsOpen(false)}
                onSuccess={() => {
                    // Real-time updates will handle data refresh automatically
                    console.log('Funds added - real-time updates will handle refresh');
                }}
            />
        </div>
    )
}

export default FamilyWalletPage;