'use client';

import { useSession } from "next-auth/react";
import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { API_ENDPOINTS, getApiUrl } from '@/lib/utils/api';
import FamilyWalletDashboard from "@/components/dashboard/parent/FamilyWalletDashboard";
import { AddFunds } from "@/components/modals/AddFunds";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAuthenticatedApi, useChoreApi } from "@/hooks/use-authenticated-api";
import { extractChoreId, enhanceTransactionDescriptions, formatTransactionForDisplay } from '@/lib/utils/transactionUtils';
import { ActivityRow } from "@/components/dashboard/AppTable";
import MakePayment from "@/components/modals/MakePayment";
import SetPin from "@/components/modals/SetPin";

interface Kid {
    id: string;
    name: string;
    username: string;
    parent: string;
    avatar?: string;
    created_at: string;
}

interface Chore {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    assignedToName: string;
    assignedToUsername: string;
    status: string;
    amount: string;
    createdAt: string;
    completedAt?: string;
    parentId: string;
    category: string;
    isRedeemed: boolean;
}

interface MakePaymentPayload {
    child_id: string;
    chore_id?: string;
    amount: string;
    pin: string;
}

interface ChartDataPoint {
    date: string;
    highest: number;
    lowest: number;
    highestName?: string;
    lowestName?: string;
}

function getArrayData<T>(data: any): T[] {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
}

const useMakePaymentMutation = (accessToken: string) => {
    const { makeAuthenticatedCall } = useAuthenticatedApi();
    return useMutation({
        mutationFn: async (payload: MakePaymentPayload) => {
            const res = await makeAuthenticatedCall({
                endpoint: getApiUrl(API_ENDPOINTS.WALLET_MAKE_PAYMENT),
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
            if (!res.success) throw new Error(res.error ?? 'Payment failed');
            return res.data;
        }
    });
};

const useSetPinMutation = (accessToken: string) => {
    const { makeAuthenticatedCall } = useAuthenticatedApi();
    return useMutation({
        mutationFn: async (pin: string) => {
            const res = await makeAuthenticatedCall({
                endpoint: getApiUrl(API_ENDPOINTS.WALLET_SET_PIN),
                method: 'POST',
                body: JSON.stringify({ pin }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
            if (!res.success) throw new Error(res.error ?? 'Failed to set PIN');
            return res.data;
        }
    });
};

const useChoreDetailQueries = (choreIds: string[], accessToken: string) => {
    const { makeAuthenticatedCall } = useChoreApi();
    return useQueries({
        queries: choreIds.map(choreId => ({
            queryKey: ['chore-detail', choreId, accessToken],
            queryFn: async () => {
                const res = await makeAuthenticatedCall({
                    endpoint: getApiUrl(API_ENDPOINTS.TASK_DETAIL.replace(':taskId', choreId)),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });
                if (!res.success) throw new Error(res.error ?? 'Failed to fetch chore detail');
                return res.data;
            },
            enabled: !!accessToken && !!choreId,
            staleTime: 1000 * 60 * 10,
        }))
    });
};

const FamilyWalletPage = () => {
    const { data: session } = useSession();
    const accessToken = session?.user?.accessToken ?? "";

    const [isMakePaymentOpen, setIsMakePaymentOpen] = useState(false);
    const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
    const [isSetPinOpen, setIsSetPinOpen] = useState(false);
    const [barChartRange, setBarChartRange] = useState("7");

    // --- Add Funds State ---
    const [addFundsAmount, setAddFundsAmount] = useState("");
    const [addFundsDescription, setAddFundsDescription] = useState("Add funds to parent wallet");
    const [paystackAuthorizationUrl, setPaystackAuthorizationUrl] = useState<string | undefined>();
    const [reference, setReference] = useState<string | undefined>();

    const queryClient = useQueryClient();

    // --- PIN Status ---
    const pinStatusQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_PIN_STATUS),
        queryKey: ['wallet-pin-status', accessToken]
    });

    const pinSet: boolean = pinStatusQuery.data?.pin_set ?? false;

    // --- Kids and Chores ---
    const kidsQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.LIST_CHILDREN),
        queryKey: ['children', accessToken]
    });
    const kids: Kid[] = getArrayData<Kid>(kidsQuery.data);

    const choresQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.LIST_TASKS),
        queryKey: ['chores', accessToken]
    });
    const chores: Chore[] = getArrayData<Chore>(choresQuery.data);

    // --- Other Queries ---
    const rewardBarChartQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_REWARD_BAR_CHART),
        queryKey: ['reward-bar-chart', accessToken]
    });

    const savingsBreakdownQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_SAVINGS_BREAKDOWN),
        queryKey: ['savings-breakdown', accessToken]
    });

    const recentActivitiesQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.TRANSACTIONS_RECENT),
        queryKey: ['recent-activities', accessToken],
        refetchInterval: 5000
    });

    // --- Chore Details ---
    const choreIds = useMemo(() => {
        const transactions = recentActivitiesQuery.data || [];
        const ids = new Set<string>();
        transactions.forEach((tx: any) => {
            const choreId = extractChoreId(tx.description);
            if (choreId) ids.add(choreId);
        });
        return Array.from(ids);
    }, [recentActivitiesQuery.data]);

    const choreDetailsResults = useChoreDetailQueries(choreIds, accessToken);

    const choreDetailsMap = useMemo(() => {
        const map = new Map<string, any>();
        choreIds.forEach((choreId, idx) => {
            const result = choreDetailsResults[idx];
            if (result && result.data) {
                map.set(choreId, result.data);
            }
        });
        return map;
    }, [choreIds, choreDetailsResults]);

    // --- Activities ---
    const enhancedTransactions = useMemo(() => {
        const transactions = recentActivitiesQuery.data || [];
        return enhanceTransactionDescriptions(transactions, choreDetailsMap);
    }, [recentActivitiesQuery.data, choreDetailsMap]);

    const activities: ActivityRow[] = useMemo(() => {
        return enhancedTransactions.map(formatTransactionForDisplay);
    }, [enhancedTransactions]);

    // --- Chart Data ---
    const barChartEarnersData = useMemo(() => {
        const chartDataRaw = rewardBarChartQuery.data?.chart_data || {};
        const daysToShow = parseInt(barChartRange, 10) || 7;
        const today = new Date();
        const result: ChartDataPoint[] = [];

        for (let i = daysToShow - 1; i >= 0; i--) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() - i);
            const dateFormats = [
                targetDate.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
                targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            ];
            let dayData = null;
            for (const dateFormat of dateFormats) {
                if (chartDataRaw[dateFormat]) {
                    dayData = chartDataRaw[dateFormat];
                    break;
                }
            }
            if (dayData) {
                const earnings = Object.entries(dayData);
                const sorted = earnings.sort((a, b) => Number(b[1]) - Number(a[1]));
                const [highestName, highestVal] = sorted[0];
                const [lowestName, lowestVal] = sorted[sorted.length - 1];
                result.push({
                    date: targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).replace(',', ''),
                    highest: Number(highestVal),
                    lowest: Number(lowestVal),
                    highestName,
                    lowestName,
                });
            } else {
                result.push({
                    date: targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).replace(',', ''),
                    highest: 0,
                    lowest: 0,
                    highestName: "",
                    lowestName: "",
                });
            }
        }
        return result;
    }, [rewardBarChartQuery.data, barChartRange]);

    const pieChartData = useMemo(() => {
        const savingsBreakdown = savingsBreakdownQuery.data || [];
        const totalSaved = savingsBreakdown.reduce((sum: number, child: any) => sum + (child.reward_saved || 0), 0);
        const totalSpent = savingsBreakdown.reduce((sum: number, child: any) => sum + (child.reward_spent || 0), 0);
        return [
            { name: "Saved", value: totalSaved, color: "#7DE2D1" },
            { name: "Spent", value: totalSpent, color: "#FFB800" },
        ];
    }, [savingsBreakdownQuery.data]);

    // --- Payment Mutation ---
    const makePaymentMutation = useMakePaymentMutation(accessToken);
    const setPinMutation = useSetPinMutation(accessToken);

    // --- Add Funds: Initiate Query ---
    const [initiateEnabled, setInitiateEnabled] = useState(false);
    const initiateQuery = useApiQuery<{
        authorization_url: string;
        reference: string;
    }>({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_PAYSTACK_INITIATE),
        queryKey: ['paystack-initiate', addFundsAmount, addFundsDescription, accessToken],
        enabled: initiateEnabled && !!addFundsAmount,
        fetchOptions: {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ amount: addFundsAmount, description: addFundsDescription }),
        },
    });

    // --- Add Funds: Verify Query ---
    const [verifyEnabled, setVerifyEnabled] = useState(false);
    const verifyQuery = useApiQuery<{ message: string }>({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_PAYSTACK_VERIFY),
        queryKey: ['paystack-verify', reference, accessToken],
        enabled: verifyEnabled && !!reference,
        fetchOptions: {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ reference }),
        },
    });

    // --- Add Funds Logic ---

    // 1. When initiateQuery returns data, set URL and reference, and store reference in localStorage
    useEffect(() => {
        if (initiateQuery.data?.authorization_url && initiateQuery.data?.reference) {
            setPaystackAuthorizationUrl(initiateQuery.data.authorization_url);
            setReference(initiateQuery.data.reference);
            localStorage.setItem("paystack_fund_reference", initiateQuery.data.reference);
            setInitiateEnabled(false);
        }
    }, [initiateQuery.data]);

    // 2. On mount or when AddFunds opens, recover reference from localStorage
    useEffect(() => {
        if (isAddFundsOpen && !reference) {
            const ref = localStorage.getItem("paystack_fund_reference");
            if (ref) setReference(ref);
        }
    }, [isAddFundsOpen, reference]);

    // 3. On successful verification, clear reference state and localStorage
    useEffect(() => {
        if (verifyQuery.data?.message === "Wallet funded successfully!") {
            localStorage.removeItem("paystack_fund_reference");
            setReference(undefined);
            setPaystackAuthorizationUrl(undefined);
            setVerifyEnabled(false);
        }
    }, [verifyQuery.data]);

    // 4. On modal close, clear reference and URL and localStorage
    const handleCloseAddFunds = () => {
        setIsAddFundsOpen(false);
        setReference(undefined);
        setPaystackAuthorizationUrl(undefined);
        setInitiateEnabled(false); // Reset initiate state
        setVerifyEnabled(false); // Reset verify state
        localStorage.removeItem("paystack_fund_reference");
    };

    // Add Funds: Handler to initiate payment
    const handleInitiateAddFunds = (amount: string, description: string) => {
        // Reset all payment-related state before initiating a new one
        setReference(undefined);
        setPaystackAuthorizationUrl(undefined);
        setVerifyEnabled(false);
        localStorage.removeItem("paystack_fund_reference");

        setAddFundsAmount(amount);
        setAddFundsDescription(description);
        setInitiateEnabled(true); // Enable the query
    };

    // Add Funds: Handler to verify payment
    const handleVerifyAddFunds = (ref: string) => {
        setReference(ref);
        setVerifyEnabled(true);
    };

    const handleMakePayment = (payload: MakePaymentPayload) => {
        makePaymentMutation.mutate(payload, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['recent-activities', accessToken] });
                queryClient.invalidateQueries({ queryKey: ['savings-breakdown', accessToken] });
                queryClient.invalidateQueries({ queryKey: ['children', accessToken] });
                queryClient.invalidateQueries({ queryKey: ['chores', accessToken] });
            }
        });
    };

    const handleWalletActionClick = () => {
        if (!pinSet) {
            setIsSetPinOpen(true);
        } else {
            setIsMakePaymentOpen(true);
        }
    };

    const handleSetPin = (pin: string) => {
        setPinMutation.mutate(pin, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['children', accessToken] });
                queryClient.invalidateQueries({ queryKey: ['savings-breakdown', accessToken] });
                queryClient.invalidateQueries({ queryKey: ['reward-bar-chart', accessToken] });
                queryClient.invalidateQueries({ queryKey: ['recent-activities', accessToken] });
                queryClient.invalidateQueries({ queryKey: ['wallet-pin-status', accessToken] });
                setIsSetPinOpen(false);
                setIsMakePaymentOpen(true);
            }
        });
    };

    const activitiesLoading = recentActivitiesQuery.isLoading || choreDetailsResults.some(r => r.isLoading);
    const activitiesError = recentActivitiesQuery.isError || choreDetailsResults.some(r => r.isError);

    return (
        <div>
            <FamilyWalletDashboard
                barChartEarnersData={barChartEarnersData}
                barChartRange={barChartRange}
                onBarChartRangeChange={setBarChartRange}
                barChartEarnersLoading={rewardBarChartQuery.isLoading}
                barChartEarnersError={rewardBarChartQuery.isError}
                pieChartData={pieChartData}
                pieChartLoading={savingsBreakdownQuery.isLoading}
                pieChartError={savingsBreakdownQuery.isError}
                activities={activities}
                activitiesLoading={activitiesLoading}
                activitiesError={activitiesError}
                onAddAllowanceClick={() => setIsMakePaymentOpen(true)}
                onAddFundsClick={() => setIsAddFundsOpen(true)}
                pinSet={pinSet}
                onSetPinClick={handleWalletActionClick}
            />
            <MakePayment
                isOpen={isMakePaymentOpen}
                onClose={() => setIsMakePaymentOpen(false)}
                kids={kids}
                chores={chores}
                isLoading={makePaymentMutation.isPending}
                error={makePaymentMutation.error ? (makePaymentMutation.error as Error) : null}
                onMakePayment={handleMakePayment}
            />
            <AddFunds
                isOpen={isAddFundsOpen}
                onClose={handleCloseAddFunds}
                loading={initiateQuery.isLoading || verifyQuery.isLoading}
                error={initiateQuery.error?.message || verifyQuery.error?.message || undefined}
                success={verifyQuery.data?.message === "Wallet funded successfully!"}
                authorizationUrl={paystackAuthorizationUrl}
                reference={reference}
                onInitiate={handleInitiateAddFunds}
                onVerify={handleVerifyAddFunds}
                // userEmail={session?.user?.email ?? ""}
            />
            <SetPin
                isOpen={isSetPinOpen}
                onClose={() => setIsSetPinOpen(false)}
                isLoading={setPinMutation.isPending}
                error={setPinMutation.error ? (setPinMutation.error as Error) : null}
                onSetPin={handleSetPin}
            />
        </div>
    );
};

export default FamilyWalletPage;