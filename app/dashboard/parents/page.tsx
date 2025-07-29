
'use client'

import ParentDashboardOverview from '@/components/dashboard/parent/ParentDashboardOverview';
import CreateKidAccount from '@/components/modals/CreateKidAccount';
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { usePaginatedApiQuery } from "@/hooks/usePagination";
import { toast } from "sonner";
import { usePathname } from 'next/navigation';

// --- Types ---
interface Kid {
    id: string;
    name: string;
    username: string;
    firstName: string;
    displayName?: string;
    avatar?: string | null;
    level: number;
    balance: number;
    progress: number;
    completedChoreCount: number;
    pendingChoreCount: number;
    created_at?: string;
    parent?: string;
    child_id: string;
    child_name: string;
}

export interface ChartDataPoint {
    date: string;
    allowanceGiven: number;
    allowanceSpent: number;
}

interface WalletDashboardStats {
    family_wallet_balance: string;
    total_rewards_sent: string;
    total_rewards_pending: string;
    children_count: number;
    total_children_balance: string;
}

interface ChoreSummary {
    pending: number;
    completed: number;
    missed?: number;
    total: number;
}

const CHORES_PER_PAGE = 10;
const FRONTEND_KIDS_PER_PAGE = 3;
const BACKEND_KIDS_PER_PAGE = 10;

const ZERO_WALLET_STATS = {
    family_wallet_balance: "0",
    total_rewards_sent: "0",
    total_rewards_pending: "0",
    children_count: 0,
    total_children_balance: "0"
};

const fetchChores = async (page: number, accessToken?: string) => {
    const res = await fetch(getApiUrl(API_ENDPOINTS.LIST_TASKS) + `?page=${page}`, {
        headers: { Authorization: `Bearer ${accessToken ?? ""}` },
    });
    if (!res.ok) throw new Error("Failed to fetch chores");
    return res.json();
};

const ParentsPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data: session, status: sessionStatus } = useSession();
    const [page, setPage] = useState(1);        // chores page
    const [kidsPage, setKidsPage] = useState(1);// kids frontend page
    const pathname = usePathname();
    const isWalletPage = pathname.includes('/wallet');
    const [barChartRange, setBarChartRange] = useState("7");

    const backendKidsPage = Math.floor((kidsPage - 1) * FRONTEND_KIDS_PER_PAGE / BACKEND_KIDS_PER_PAGE) + 1;

    // --- Queries ---
    const paginatedKidsQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.LIST_CHILDREN) + `?page=${backendKidsPage}&page_size=${BACKEND_KIDS_PER_PAGE}`,
        queryKey: ['paginated-kids', backendKidsPage, BACKEND_KIDS_PER_PAGE],
        enabled: !!session?.user?.accessToken,
    });

    const choreSummaryQuery = useApiQuery<ChoreSummary>({
        endpoint: getApiUrl(API_ENDPOINTS.CHORE_SUMMARY),
        queryKey: ['chore-summary'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    const savingsBreakdownQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_SAVINGS_BREAKDOWN),
        queryKey: ['savings-breakdown'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    const transactionsQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.TRANSACTIONS),
        queryKey: ['transactions', session?.user?.accessToken],
        enabled: !!session?.user?.accessToken,
    });

    const allowancesQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.ALLOWANCES),
        queryKey: ['allowances', session?.user?.accessToken],
        enabled: !!session?.user?.accessToken,
    });

    const walletStatsQuery = useApiQuery<WalletDashboardStats>({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_DASHBOARD_STATS),
        queryKey: ['wallet-dashboard-stats'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    const choresQuery = usePaginatedApiQuery(
        'chores-list',
        (page) => fetchChores(page, session?.user?.accessToken),
        page
    );

    const childrenWalletsQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.CHILDREN_WALLETS),
        queryKey: ['children-wallets'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    // Debug logging for query states
    useEffect(() => {
        console.log('Session Status:', sessionStatus, 'Access Token:', !!session?.user?.accessToken);
        console.log('Query States:', {
            paginatedKidsQuery: { isLoading: paginatedKidsQuery.isLoading, isError: paginatedKidsQuery.isError, error: paginatedKidsQuery.error },
            choreSummaryQuery: { isLoading: choreSummaryQuery.isLoading, isError: choreSummaryQuery.isError, error: choreSummaryQuery.error },
            walletStatsQuery: { isLoading: walletStatsQuery.isLoading, isError: walletStatsQuery.isError, error: walletStatsQuery.error },
            choresQuery: { isLoading: choresQuery.isLoading, isError: choresQuery.isError, error: choresQuery.error },
            childrenWalletsQuery: { isLoading: childrenWalletsQuery.isLoading, isError: childrenWalletsQuery.isError, error: childrenWalletsQuery.error },
            transactionsQuery: { isLoading: transactionsQuery.isLoading, isError: transactionsQuery.isError, error: transactionsQuery.error },
            allowancesQuery: { isLoading: allowancesQuery.isLoading, isError: allowancesQuery.isError, error: allowancesQuery.error },
            savingsBreakdownQuery: { isLoading: savingsBreakdownQuery.isLoading, isError: savingsBreakdownQuery.isError, error: savingsBreakdownQuery.error },
        });
    }, [
        sessionStatus,
        session?.user?.accessToken,
        paginatedKidsQuery.isLoading,
        paginatedKidsQuery.isError,
        paginatedKidsQuery.error,
        choreSummaryQuery.isLoading,
        choreSummaryQuery.isError,
        choreSummaryQuery.error,
        walletStatsQuery.isLoading,
        walletStatsQuery.isError,
        walletStatsQuery.error,
        choresQuery.isLoading,
        choresQuery.isError,
        choresQuery.error,
        childrenWalletsQuery.isLoading,
        childrenWalletsQuery.isError,
        childrenWalletsQuery.error,
        transactionsQuery.isLoading,
        transactionsQuery.isError,
        transactionsQuery.error,
        allowancesQuery.isLoading,
        allowancesQuery.isError,
        allowancesQuery.error,
        savingsBreakdownQuery.isLoading,
        savingsBreakdownQuery.isError,
        savingsBreakdownQuery.error,
    ]);

    // --- Data ---
    const kidsCount = paginatedKidsQuery.data?.count || 0;
    const kidsTotalPages = Math.max(1, Math.ceil(kidsCount / FRONTEND_KIDS_PER_PAGE));
    const childrenWallets = (childrenWalletsQuery.data?.results || childrenWalletsQuery.data || []);
    const totalPages = choresQuery.data ? Math.ceil(choresQuery.data.count / CHORES_PER_PAGE) : 1;

    // Normalize walletStats
    const walletStats: WalletDashboardStats = walletStatsQuery.data || ZERO_WALLET_STATS;

    const backendKidsResults = paginatedKidsQuery.data?.results || [];

    // --- Processed Kids ---
    const processedKids: Kid[] = backendKidsResults.map((kid: any) => {
        const displayName = kid.name || kid.displayName || kid.child_name || kid.username || "";
        const firstName = displayName.trim().split(" ")[0];

        const walletData = childrenWallets.find(
            (wallet: any) =>
                wallet.child_name === displayName ||
                wallet.child_name === kid.username
        ) || {};

        const kidChores = Array.isArray(choresQuery.data?.results)
            ? choresQuery.data.results.filter(
                (task: any) =>
                    task.assignedTo === kid.id ||
                    task.assignedTo === kid.username
            )
            : [];
        const completedChoreCount = kidChores.filter(
            (chore: any) => chore.status === "completed"
        ).length;
        const pendingChoreCount = kidChores.filter(
            (chore: any) => chore.status === "pending"
        ).length;

        const totalEarned = walletData.total_earned || 0;
        const balance = walletData.balance || 0;
        const totalChores = kidChores.length;
        const progress =
            totalChores > 0
                ? Math.round((completedChoreCount / totalChores) * 100)
                : 0;

        return {
            ...kid,
            username: kid.username || "",
            displayName,
            firstName,
            balance,
            completedChoreCount,
            pendingChoreCount,
            progress,
            child_id: kid.id, // always set
            child_name: displayName,
            level: Math.max(1, Math.floor(totalEarned / 1000) + 1),
        };
    });

    // --- Tasks with firstName (for UI compatibility) ---
    const tasks = Array.isArray(choresQuery.data?.results)
        ? choresQuery.data.results.map((task: any) => {
            const assignedKid = processedKids.find(k =>
                k.id === task.assignedTo || k.username === task.assignedTo
            );
            return {
                ...task,
                firstName: assignedKid?.firstName || "",
            };
        })
        : [];

    // --- Sorted & Paginated Kids ---
    const sortedKids = [...processedKids].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
    });

    const start = (kidsPage - 1) * FRONTEND_KIDS_PER_PAGE;
    const end = start + FRONTEND_KIDS_PER_PAGE;
    const pagedKids = sortedKids.slice(start, end);

    useEffect(() => {
        if (kidsPage > kidsTotalPages) setKidsPage(kidsTotalPages);
    }, [kidsPage, kidsTotalPages]);

    const handleKidsPageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > kidsTotalPages) return;
        setKidsPage(nextPage);
    };

    // --- Bar Chart Data Aggregation ---
    const allowanceChartData: ChartDataPoint[] = useMemo(() => {
        if (!transactionsQuery.data || !childrenWalletsQuery.data || !allowancesQuery.data) return [];

        const transactions = Array.isArray(transactionsQuery.data) ? transactionsQuery.data : transactionsQuery.data.results || [];
        const childWallets = Array.isArray(childrenWalletsQuery.data) ? childrenWalletsQuery.data : childrenWalletsQuery.data.results || [];
        const allowances = Array.isArray(allowancesQuery.data) ? allowancesQuery.data : allowancesQuery.data.results || [];

        const possibleAllowanceTypes = ['allowance_payment', 'allowance', 'payment', 'topup'];
        let allowancePayments = transactions.filter((tx: any) => tx.type === 'allowance_payment');
        if (allowancePayments.length === 0) {
            for (const type of possibleAllowanceTypes) {
                const payments = transactions.filter((tx: any) => tx.type === type);
                if (payments.length > 0) {
                    allowancePayments = payments;
                    break;
                }
            }
        }
        if (allowancePayments.length === 0) {
            allowancePayments = allowances.map((allowance: any) => ({
                ...allowance,
                type: 'allowance',
                amount: allowance.amount || allowance.total_amount || 0,
                created_at: allowance.created_at || allowance.date_created || new Date().toISOString()
            }));
        }

        const totalSpent = childWallets.reduce((sum: number, wallet: any) => sum + parseFloat(wallet.total_spent || 0), 0);

        const allowanceByDate = allowancePayments.reduce((acc: any, payment: any) => {
            const date = new Date(payment.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
            }).replace(',', '');
            if (!acc[date]) {
                acc[date] = { given: 0, spent: 0 };
            }
            acc[date].given += parseFloat(payment.amount);
            return acc;
        }, {});

        const today = new Date();
        const chartData: ChartDataPoint[] = [];
        const daysToShow = parseInt(barChartRange);

        for (let i = daysToShow - 1; i >= 0; i--) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() - i);
            const dateKey = targetDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
            }).replace(',', '');
            const dayData = allowanceByDate[dateKey] || { given: 0, spent: 0 };
            chartData.push({
                date: dateKey,
                allowanceGiven: dayData.given,
                allowanceSpent: dayData.spent
            });
        }

        const totalGiven = chartData.reduce((sum, item) => sum + item.allowanceGiven, 0);
        if (totalGiven > 0) {
            chartData.forEach(item => {
                if (item.allowanceGiven > 0) {
                    item.allowanceSpent = Math.round((item.allowanceGiven / totalGiven) * totalSpent);
                } else {
                    item.allowanceSpent = 0;
                }
            });
        }

        return chartData;
    }, [transactionsQuery.data, childrenWalletsQuery.data, allowancesQuery.data, barChartRange]);

    // --- Loading/Error states for Bar Chart ---
    const barChartLoading = transactionsQuery.isLoading || childrenWalletsQuery.isLoading || allowancesQuery.isLoading;
    const barChartError = transactionsQuery.isError || childrenWalletsQuery.isError || allowancesQuery.isError;

    // --- General Loading/Error ---
    const isLoading =
        sessionStatus === 'loading' ||
        paginatedKidsQuery.isLoading ||
        choreSummaryQuery.isLoading ||
        walletStatsQuery.isLoading ||
        choresQuery.isLoading ||
        childrenWalletsQuery.isLoading;

    const isError =
        !!choreSummaryQuery.error ||
        !!choresQuery.error ||
        !!childrenWalletsQuery.error ||
        !!walletStatsQuery.error;

    // Even on error/loading, supply fallbacks to static props for overview
    return (
        <div className="">
            <ParentDashboardOverview
                onCreateKidClick={() => setIsCreateModalOpen(true)}
                tasks={tasks}
                kids={processedKids}
                pagedKids={pagedKids}
                kidsCount={kidsCount}
                kidsPage={kidsPage}
                kidsTotalPages={kidsTotalPages}
                onKidsPageChange={handleKidsPageChange}
                choreSummary={!isWalletPage ? choreSummaryQuery.data : undefined}
                walletStats={walletStats}
                savingsBreakdown={isWalletPage ? savingsBreakdownQuery.data ?? null : undefined}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={isLoading}
                isError={isError}
                barChartData={allowanceChartData}
                barChartRange={barChartRange}
                onBarChartRangeChange={setBarChartRange}
                barChartLoading={barChartLoading}
                barChartError={barChartError}
            />

            <CreateKidAccount
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    toast.success("Kid account created successfully");
                }}
            />
        </div>
    );
};

export default ParentsPage;
