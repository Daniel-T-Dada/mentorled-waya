
'use client'

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { formatNaira } from "@/lib/utils/currency";
import AppStatCard, { StatItem } from "../dashboard/AppStatCard";

// Types
interface ChoreSummary {
    pending: number;
    completed: number;
    missed: number;
    total: number;
}
interface WalletDashboardStats {
    family_wallet_balance: string;
    total_rewards_sent: string;
    total_rewards_pending: string;
    children_count: number;
    total_children_balance: string;
}
interface InsightStats {
    total_chores_assigned: number;
    total_completed_chores: number;
    total_pending_chores: number;
}

interface ParentStatsProviderProps {
    insightStats?: InsightStats | null;
    familyWalletError?: boolean;
    childWalletError?: boolean;
}

const ZERO_CHORE_SUMMARY = {
    pending: 0,
    completed: 0,
    missed: 0,
    total: 0
};

const ParentStatsProvider = ({
    insightStats,
}: ParentStatsProviderProps) => {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Wallet Stats Query
    const walletStatsQuery = useApiQuery<WalletDashboardStats>({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_DASHBOARD_STATS),
        queryKey: ['wallet-dashboard-stats'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    // Defensive fallback for wallet stats
    const walletStats: WalletDashboardStats = walletStatsQuery.data || {
        family_wallet_balance: "0",
        total_rewards_sent: "0",
        total_rewards_pending: "0",
        children_count: 0,
        total_children_balance: "0"
    };

    // Chore Summary Query
    const choreSummaryQuery = useApiQuery<ChoreSummary>({
        endpoint: getApiUrl(API_ENDPOINTS.CHORE_SUMMARY),
        queryKey: ['chore-summary'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    const choreSummary: ChoreSummary = choreSummaryQuery.data || ZERO_CHORE_SUMMARY;

    // --- Stat Calculation Functions ---
    function getTaskmasterStats(): StatItem[] {
        return [
            {
                title: 'Total Number of Chores Assigned',
                value: `${choreSummary.total} Chores`
            },
            {
                title: 'Total Number of Completed Chores',
                value: `${choreSummary.completed} Chores`
            },
            {
                title: 'Total Number of Pending Chores',
                value: `${choreSummary.pending} Chores`
            },
        ];
    }

    function getWalletStats(): StatItem[] {
        return [
            {
                title: 'Total Amount in Family Wallet',
                value: formatNaira(walletStats.family_wallet_balance),
            },
            {
                title: 'Total Rewards Sent',
                value: formatNaira(walletStats.total_rewards_sent),
            },
            {
                title: 'Total Rewards Pending',
                value: formatNaira(walletStats.total_rewards_pending),
            },
        ];
    }

    function getInsightStats(): StatItem[] {
        return [
            {
                title: 'Total Number of Chores Assigned',
                value: `${insightStats?.total_chores_assigned ?? 0} Chores`,
            },
            {
                title: 'Total Number of Completed Chores',
                value: `${insightStats?.total_completed_chores ?? 0} Chores`,
            },
            {
                title: 'Total Number of Pending Chores',
                value: `${insightStats?.total_pending_chores ?? 0} Chores`,
            },
        ];
    }

    function getDefaultDashboardStats(): StatItem[] {
        return [
            {
                title: 'Total Amount in Family Wallet',
                value: formatNaira(walletStats.family_wallet_balance),
                percentageChange: 15,
                trend: 'up'
            },
            {
                title: 'Total Number of Chores Assigned',
                value: `${choreSummary.total} Chores`,
                percentageChange: -5,
                trend: 'down'
            },
            {
                title: 'Total Number of Pending Chores',
                value: `${choreSummary.pending} Chores`,
                percentageChange: 12,
                trend: 'up'
            },
        ];
    }

    // --- Choose which stats to show based on page ---
    let stats: StatItem[];
    if (pathname.includes('/taskmaster')) {
        stats = getTaskmasterStats();
    } else if (pathname.includes('/wallet')) {
        stats = getWalletStats();
    } else if (pathname.includes('/insights')) {
        stats = getInsightStats();
    } else {
        stats = getDefaultDashboardStats();
    }

    return (
        <>
            <AppStatCard stats={stats} />
        </>
    );
};

export default ParentStatsProvider;
