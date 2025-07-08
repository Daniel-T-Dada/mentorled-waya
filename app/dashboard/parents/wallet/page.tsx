/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'



import FamilyWalletDashboard from "@/components/dashboard/parent/FamilyWalletDashboard"
import { MakePayment } from "@/components/modals/MakePayment";
import { AddFunds } from "@/components/modals/AddFunds";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';


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
    // Fetch wallet data
    const fetchWalletData = async () => {
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
    };

    // Fetch transactions
    const fetchTransactions = async () => {
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
    };

    // Fetch notifications
    const fetchNotifications = async () => {
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
    };


    useEffect(() => {
        if (session) {
            fetchWalletData();
            fetchTransactions();
            fetchNotifications();
        }
    }, [session]);


    return (
        <div>
            <FamilyWalletDashboard
                onAddAllowanceClick={() => setIsMakePaymentOpen(true)}
                onAddFundsClick={() => setIsAddFundsOpen(true)}
            />
            <MakePayment
                isOpen={isMakePaymentOpen}
                onClose={() => setIsMakePaymentOpen(false)}
                onSuccess={() => {
                    fetchWalletData();
                    fetchTransactions();
                }}
            />
            <AddFunds
                isOpen={isAddFundsOpen}
                onClose={() => setIsAddFundsOpen(false)}
                onSuccess={() => {
                    fetchWalletData();
                    fetchTransactions();
                }}
            />
        </div>
    )
}

export default FamilyWalletPage;