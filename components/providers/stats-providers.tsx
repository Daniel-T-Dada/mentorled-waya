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

/**
 * This component handles fetching all summary data and renders the correct stats
 * for taskmaster/parent, wallet, insight, or dashboard (based on pathname).
 * Use this as a wrapper or call getStatsForPage elsewhere for more flexibility.
 */
const ParentStatsProvider = ({
    insightStats,
    familyWalletError,
    // childWalletError,
}: ParentStatsProviderProps) => {

    const pathname = usePathname();
    const { data: session } = useSession();

    // Fetch all needed data
    const choreSummaryQuery = useApiQuery<ChoreSummary>({
        endpoint: getApiUrl(API_ENDPOINTS.CHORE_SUMMARY),
        queryKey: ['chore-summary'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    const walletStatsQuery = useApiQuery<WalletDashboardStats>({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_DASHBOARD_STATS),
        queryKey: ['wallet-dashboard-stats'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    // If error flags are set (from parent), override error/loading handling
    const familyWalletValue = familyWalletError
        ? 0
        : Number(walletStatsQuery.data?.family_wallet_balance ?? 0);

    const totalRewardsSent = familyWalletError
        ? 0
        : Number(walletStatsQuery.data?.total_rewards_sent ?? 0);

    const totalRewardsPending = familyWalletError
        ? 0
        : Number(walletStatsQuery.data?.total_rewards_pending ?? 0);


    const choreSummary = choreSummaryQuery.data;
    // const walletStats = walletStatsQuery.data;

    // -- Stat Calculation Functions --

    // 1. Taskmaster page (parent summary)
    function getTaskmasterStats(): StatItem[] {
        return [
            {
                title: 'Total Number of Chores Assigned',
                value: `${choreSummary?.total ?? 0} Chores`
            },
            {
                title: 'Total Number of Completed Chores',
                value: `${choreSummary?.completed ?? 0} Chores`
            },
            {
                title: 'Total Number of Pending Chores',
                value: `${choreSummary?.pending ?? 0} Chores`
            },
        ];
    }

    // 2. Wallet Dashboard page
    function getWalletStats(): StatItem[] {
        return [
            {
                title: 'Total Amount in Family Wallet',
                value: formatNaira(familyWalletValue),
            },
            {
                title: 'Total Rewards Sent',
                value: formatNaira(totalRewardsSent),
            },
            {
                title: 'Total Rewards Pending',
                value: formatNaira(totalRewardsPending),
            },
        ];
    }

    // 3. Insight page
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

    // 4. Default/parents dashboard
    function getDefaultDashboardStats(): StatItem[] {
        return [
            {
                title: 'Total Amount in Family Wallet',
                value: formatNaira(familyWalletValue),
                percentageChange: 15,
                trend: 'up'
            },
            {
                title: 'Total Number of Chores Assigned',
                value: `${choreSummary?.total ?? 0} Chores`,
                percentageChange: -5,
                trend: 'down'
            },
            {
                title: 'Total Number of Pending Chores',
                value: `${choreSummary?.pending ?? 0} Chores`,
                percentageChange: 12,
                trend: 'up'
            },
        ];
    }

    // -- Choose which stats to show based on page --
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

    // Always render the cards with safe fallback values
    return <AppStatCard stats={stats} />;
};

export default ParentStatsProvider;