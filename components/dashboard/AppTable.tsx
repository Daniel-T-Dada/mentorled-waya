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
import { mockDataService } from "@/lib/services/mockDataService";
import { toast } from "sonner";
import { RefreshCcw } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';


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

const AppTable = ({ parentId }: AppTableProps) => {
    const [activities, setActivities] = useState<ActivityRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Function to fetch data
    const fetchActivities = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = parentId
                ? `${getApiUrl(API_ENDPOINTS.ACTIVITIES)}?parentId=${parentId}`
                : getApiUrl(API_ENDPOINTS.ACTIVITIES);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch activities from API');
            }
            const data: ActivityRow[] = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('API returned data is not an array');
            }
            setActivities(data);
            toast.success('Activities loaded successfully');

        } catch (apiError) {
            console.error('API fetch error:', apiError);
            toast.warning('Using mock data fallback for activities.');

            // Fallback to mock data
            try {
                const allChores = mockDataService.getAllChores();
                const allKids = mockDataService.getAllKids();

                const mockActivities: ActivityRow[] = allChores.map(chore => {
                    const kid = allKids.find(k => k.id === chore.assignedTo);

                    // Map mock data status to display status from the image
                    let displayStatus: ActivityRow['status'] = 'processing'; 
                    if (chore.status === 'completed') {
                        displayStatus = 'paid'; 
                    } else if (chore.status === 'pending') {
                        displayStatus = 'pending'; 
                    } else if (chore.status === 'cancelled') {
                        displayStatus = 'cancelled'; 
                    }

                    return {
                        id: chore.id,
                        name: kid ? kid.name : 'Unknown Kid',
                        activity: chore.title,
                        amount: chore.reward,
                        status: displayStatus, 
                        date: new Date(chore.createdAt).toLocaleDateString('en-US'),
                    };
                });

                setActivities(mockActivities);

            } catch (mockError) {
                console.error('Mock data fallback error:', mockError);
                setError('Failed to load activities data from both API and mock data.');
                toast.error('Failed to load activities data.');
                setActivities([]);
            }
        } finally {
            setLoading(false);
        }
    }, [parentId]);

    // Initial data fetch and refresh handler
    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const handleRefresh = () => {
        fetchActivities();
    };

    const indexOfLastActivity = currentPage * itemsPerPage;
    const indexOfFirstActivity = indexOfLastActivity - itemsPerPage;
    const currentActivities = activities.slice(indexOfFirstActivity, indexOfLastActivity);
    const totalPages = Math.ceil(activities.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Helper function to get status badge styling
    const getStatusBadgeStyles = (status: ActivityRow['status']) => {
        switch (status) {
            case 'paid':
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

    return (
        <div className="w-full border rounded-lg bg-card text-card-foreground shadow-sm p-8">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-lg font-semibold">Recent Activities</h3>
                <RefreshCcw className="h-5 w-5 text-muted-foreground cursor-pointer" onClick={handleRefresh} />
            </div>

            {/* Display loading, error, or data */}
            {loading ? (
                <p>Loading activities...</p>
            ) : error ? (
                <p className="text-destructive">{error}</p>
            ) : activities.length > 0 ? (
                <div className="overflow-auto border rounded-lg p-8">
                    <Table>
                        <TableHeader className="">
                            <TableRow >
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
                                    <TableCell className="font-semibold p-6">{activity.name}</TableCell> {/* Added font-medium */}
                                    <TableCell>{activity.activity}</TableCell>
                                    <TableCell>{activity.amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyles(activity.status)}`}
                                        >
                                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell>{activity.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-center text-muted-foreground">No activities found.</p>
            )}

            {/* Pagination */}
            {!loading && activities.length > itemsPerPage && totalPages > 1 && (
                <div className="flex justify-end items-center mt-4 space-x-2">
                    <span className="text-sm text-muted-foreground min-w-[120px] flex items-center">Page {currentPage} of {totalPages}</span>
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