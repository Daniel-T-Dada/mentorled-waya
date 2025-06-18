'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { ClipboardList } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityRow {
    id: string;
    name: string;
    activity: string;
    amount: number;
    status: "completed" | "pending" | "cancelled" | "paid" | "processing";
    date: string;
}

interface AppTableProps {
    parentId?: string;
}

const LoadingState = () => (
    <div className="space-y-4">
        <div className="overflow-auto border rounded-lg p-8">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-semibold p-6"><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-semibold p-6"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
);

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

const AppTable = ({ parentId }: AppTableProps) => {
    const [activities, setActivities] = useState<ActivityRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [needsRetry, setNeedsRetry] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchActivities = useCallback(async () => {
        if (!parentId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setNeedsRetry(false);

        try {
            const url = getApiUrl(API_ENDPOINTS.ACTIVITIES);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format');
            }

            setActivities(data);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setNeedsRetry(true);
        } finally {
            setIsLoading(false);
        }
    }, [parentId]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

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

    if (isLoading) {
        return (
            <div className="w-full border rounded-lg bg-card text-card-foreground shadow-sm p-8">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-lg font-semibold">Recent Activities</h3>
                </div>
                <LoadingState />
            </div>
        );
    }

    if (needsRetry || activities.length === 0) {
        return (
            <div className="w-full border rounded-lg bg-card text-card-foreground shadow-sm p-8">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-lg font-semibold">Recent Activities</h3>
                </div>
                <InfoState />
            </div>
        );
    }

    return (
        <div className="w-full border rounded-lg bg-card text-card-foreground shadow-sm p-8">
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
};

export default AppTable; 