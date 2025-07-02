/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'



import FamilyWalletDashboard from "@/components/dashboard/parent/FamilyWalletDashboard"
import { AddAllowance } from "@/components/modals/AddAllowance";

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
    const [isAddAllowanceOpen, setIsAddAllowanceOpen] = useState(false);
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
        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.TRANSACTIONS));
            if (!response.ok) throw new Error('Failed to fetch transactions');
            const data = await response.json();
            setTransactions(data.transactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.NOTIFICATIONS));
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
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
            <FamilyWalletDashboard onAddAllowanceClick={() => setIsAddAllowanceOpen(true)} />
            <AddAllowance
                isOpen={isAddAllowanceOpen}
                onClose={() => setIsAddAllowanceOpen(false)}
                onSuccess={() => {
                    fetchWalletData(); fetchTransactions();
                }} />
        </div>
    )
}

export default FamilyWalletPage;