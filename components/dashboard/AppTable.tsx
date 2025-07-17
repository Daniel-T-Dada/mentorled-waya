'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useSession } from 'next-auth/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { enhanceTransactionDescriptions, formatTransactionForDisplay } from '@/lib/utils/transactionUtils';
import { ClipboardList } from 'lucide-react';
import { eventManager } from "@/lib/realtime";
import { WalletUpdatePayload, TransactionUpdatePayload, WayaEvent } from "@/lib/realtime/types";

interface ActivityRow {
    id: string;
    name: string;
    activity: string;
    amount: number;
    status: "completed" | "pending" | "cancelled" | "paid" | "processing";
    date: string;
}


const InfoState = () => (
    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Activities Info</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Your recent activities will be displayed here when available
        </p>
    </div>
);

const AppTable = memo(() => {
    const { data: session } = useSession();
    const [activities, setActivities] = useState<ActivityRow[]>([]);

    const [needsRetry, setNeedsRetry] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchActivities = useCallback(async () => {
        if (!session?.user?.accessToken) {
            return;
        }

        setNeedsRetry(false);

        try {
            // Fetch recent activities using the correct endpoint
            const url = getApiUrl(API_ENDPOINTS.TRANSACTIONS_RECENT);
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch recent activities');
            }

            const transactions = await response.json();
            console.log('Recent transactions:', transactions);

            // Enhance transaction descriptions with actual chore titles
            const enhancedTransactions = await enhanceTransactionDescriptions(
                transactions,
                session.user.accessToken
            );

            // Transform for display (transactions are already ordered from most recent to least recent)
            const transformedActivities: ActivityRow[] = enhancedTransactions.map((transaction) =>
                formatTransactionForDisplay(transaction)
            );

            setActivities(transformedActivities);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setNeedsRetry(true);
        }
    }, [session?.user?.accessToken]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    // Set up real-time transaction updates subscription
    useEffect(() => {
        if (!session?.user?.accessToken) return;

        const handleWalletUpdate = async (event: WayaEvent<WalletUpdatePayload>) => {
            console.log('AppTable: Received wallet update event:', event);
            const { payload } = event;

            // When a wallet transaction occurs (ADD_FUNDS or MAKE_PAYMENT), create a transaction record
            if (payload.action === "ADD_FUNDS" || payload.action === "MAKE_PAYMENT") {
                try {
                    // Create a new transaction record for real-time display
                    const newTransaction = {
                        id: payload.transactionId || `temp-${Date.now()}`,
                        name: payload.action === "ADD_FUNDS" ? "Family Wallet" : "Payment to Child",
                        activity: payload.action === "ADD_FUNDS" ? "Wallet Top-up" : "Payment Transfer",
                        amount: payload.amount || 0,
                        status: "completed" as const,
                        date: new Date().toISOString()
                    };

                    // Add the new transaction to the top of the list
                    setActivities(prev => [newTransaction, ...prev]);
                } catch (error) {
                    console.error('Error creating real-time transaction:', error);
                }
            }
        };

        const handleTransactionUpdate = (event: WayaEvent<TransactionUpdatePayload>) => {
            console.log('AppTable: Received transaction update event:', event);
            const { payload } = event;

            setActivities(prev => {
                switch (payload.action) {
                    case "CREATE":
                        if (payload.transaction) {
                            const formattedTransaction = formatTransactionForDisplay(payload.transaction);
                            return [formattedTransaction, ...prev];
                        }
                        break;
                    case "UPDATE":
                        if (payload.transaction && payload.transactionId) {
                            return prev.map(activity =>
                                activity.id === payload.transactionId
                                    ? { ...activity, ...formatTransactionForDisplay(payload.transaction) }
                                    : activity
                            );
                        }
                        break;
                    default:
                        break;
                }
                return prev;
            });
        };

        const unsubscribeWallet = eventManager.subscribe('WALLET_UPDATE', handleWalletUpdate);
        const unsubscribeTransaction = eventManager.subscribe('TRANSACTION_UPDATE', handleTransactionUpdate);

        return () => {
            unsubscribeWallet();
            unsubscribeTransaction();
        };
    }, [session?.user?.accessToken]);

    const indexOfLastActivity = currentPage * itemsPerPage;
    const indexOfFirstActivity = indexOfLastActivity - itemsPerPage;
    const currentActivities = activities.slice(indexOfFirstActivity, indexOfLastActivity);
    const totalPages = Math.ceil(activities.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const getStatusBadgeStyles = (status: ActivityRow['status']) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-gray-200 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };





    // Always show either the info state or the table, never a skeleton/loading state
    if (needsRetry || activities.length === 0) {
        return (
            <div className="w-full border rounded-lg bg-card text-card-foreground shadow-sm p-8 min-h-[500px]">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-lg font-semibold">Recent Activities</h3>
                </div>
                <InfoState />
            </div>
        );
    }

    return (
        <div className="w-full border rounded-lg bg-card text-card-foreground shadow-sm p-8 min-h-[500px]">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-lg font-semibold">Recent Activities</h3>
            </div>

            <div className="overflow-auto border rounded-lg p-8">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold p-6">Name</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentActivities.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell className="font-semibold p-6">{activity.name}</TableCell>
                                <TableCell>{activity.activity}</TableCell>
                                <TableCell>
                                    {activity.amount.toLocaleString('en-NG', {
                                        style: 'currency',
                                        currency: 'NGN',
                                        maximumFractionDigits: 0
                                    })}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyles(activity.status)}`}>
                                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                    </span>
                                </TableCell>
                                <TableCell>{activity.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {activities.length > itemsPerPage && totalPages > 1 && (
                <div className="flex justify-end items-center mt-4 space-x-2">
                    <span className="text-sm text-muted-foreground min-w-[120px] flex items-center">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) handlePageChange(currentPage - 1);
                                    }}
                                    aria-disabled={currentPage === 1}
                                    tabIndex={currentPage === 1 ? -1 : undefined}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>

                            {[...Array(totalPages)].map((_, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        href="#"
                                        isActive={currentPage === index + 1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(index + 1);
                                        }}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                    }}
                                    aria-disabled={currentPage === totalPages}
                                    tabIndex={currentPage === totalPages ? -1 : undefined}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
});

AppTable.displayName = 'AppTable';

export default AppTable; 