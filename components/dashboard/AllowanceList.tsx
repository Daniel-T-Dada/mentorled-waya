'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Calendar, User, DollarSign, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { createAllowanceService } from '@/lib/services/allowanceService';
import { FrontendAllowance } from '@/lib/utils/allowanceTransforms';

interface AllowanceListProps {
    onRefresh?: () => void;
}

const LoadingState = () => (
    <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

const EmptyState = () => (
    <div className="text-center py-8">
        <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Allowances Found</h3>
        <p className="text-muted-foreground">
            You haven&apos;t set up any allowances yet. Create one to get started!
        </p>
    </div>
);

export default function AllowanceList({ onRefresh }: AllowanceListProps) {
    const { data: session } = useSession();
    const [allowances, setAllowances] = useState<FrontendAllowance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchAllowances = useCallback(async () => {
        if (!session?.user?.accessToken) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const allowanceService = createAllowanceService(session.user.accessToken);
            const fetchedAllowances = await allowanceService.getAllAllowances();
            setAllowances(fetchedAllowances);
            console.log('Fetched allowances:', fetchedAllowances);
        } catch (error) {
            console.error('Error fetching allowances:', error);
            toast.error('Failed to load allowances');
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.accessToken]);

    useEffect(() => {
        fetchAllowances();
    }, [fetchAllowances]);

    const handleDelete = async (allowanceId: string) => {
        if (!session?.user?.accessToken) return;

        setIsDeleting(allowanceId);
        try {
            const allowanceService = createAllowanceService(session.user.accessToken);
            await allowanceService.deleteAllowance(allowanceId);

            // Remove from local state
            setAllowances(prev => prev.filter(a => a.id !== allowanceId));
            toast.success('Allowance deleted successfully');
            onRefresh?.();
        } catch (error) {
            console.error('Error deleting allowance:', error);
            toast.error('Failed to delete allowance');
        } finally {
            setIsDeleting(null);
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'inactive':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatAmount = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `NGN ${numAmount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">

                        Active Allowances
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <LoadingState />
                </CardContent>
            </Card>
        );
    }

    if (allowances.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">

                        Active Allowances
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">

                        Active Allowances ({allowances.length})
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchAllowances}
                        className="h-8 w-8 p-0"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {allowances.map((allowance) => (
                        <div
                            key={allowance.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Child ID: {allowance.childId}</span>
                                    <Badge variant={getStatusBadgeVariant(allowance.status)}>
                                        {allowance.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        <span>{formatAmount(allowance.amount)} {allowance.frequency}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Created: {formatDate(allowance.createdAt)}</span>
                                    </div>
                                    {allowance.lastPaidAt && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>Last paid: {formatDate(allowance.lastPaidAt)}</span>
                                        </div>
                                    )}
                                    {allowance.nextPaymentDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>Next payment: {formatDate(allowance.nextPaymentDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(allowance.id)}
                                    disabled={isDeleting === allowance.id}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                    {isDeleting === allowance.id ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
