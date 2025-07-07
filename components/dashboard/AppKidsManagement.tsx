'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useKid } from "@/contexts/KidContext";
import { getFirstName } from "@/lib/utils/taskTransforms";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { transformTasksFromBackend, BackendTask } from '@/lib/utils/taskTransforms';
import { formatNaira } from '@/lib/utils/currency';

// Type for paginated API responses
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Type for transformed chore data
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
    completedAt?: string | null;
    parentId: string;
    category: string;
}

interface Kid {
    id: string;
    username: string;
    displayName?: string; // Computed display name
    avatar?: string | null;
    level: number;
    balance: number;
    progress: number;
    completedChoreCount: number;
    pendingChoreCount: number;
    created_at?: string;
    parent?: string;
}

interface AppKidsManagementProps {
    onCreateKidClick?: () => void;
    onAssignChore?: (kidId: string) => void;
    refreshTrigger?: number; // Add refresh trigger
}

const EmptyState = ({ onCreateKidClick }: { onCreateKidClick?: () => void }) => (
    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Kids Added Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
            Start by adding your kids to track their chores and progress.
        </p>
        <Button onClick={onCreateKidClick}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add First Kid
        </Button>
    </div>
);

const LoadingState = () => (
    <div className="space-y-4 pr-4">
        {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-md p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2 w-full" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2 w-full" />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-16 ml-4" />
                </div>
            </div>
        ))}
    </div>
);

const AppKidsManagement = ({ onCreateKidClick, onAssignChore, refreshTrigger }: AppKidsManagementProps) => {
    const { kids, isLoadingKids, getKidDisplayName } = useKid();
    const [currentPage, setCurrentPage] = useState(0);
    const [chores, setChores] = useState<Chore[]>([]);
    const [childWallets, setChildWallets] = useState<{ [key: string]: any }>({});
    const [isLoadingChores, setIsLoadingChores] = useState(true);
    const [isLoadingWallets, setIsLoadingWallets] = useState(true);
    const pathname = usePathname();
    const { data: session } = useSession();

    // Check if we're on the TaskMaster page
    const isTaskMasterPage = pathname === '/dashboard/parents/taskmaster';

    // Fetch child wallets data
    useEffect(() => {
        const fetchChildWallets = async () => {
            if (!session?.user?.id) {
                setIsLoadingWallets(false);
                return;
            }

            try {
                const response = await fetch(getApiUrl(API_ENDPOINTS.CHILDREN_WALLETS), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch child wallets: ${response.status}`);
                }

                const data = await response.json();
                console.log('Child wallets data (KidsManagement):', data);

                // Handle both paginated and direct array responses
                let walletsArray = [];
                if (Array.isArray(data)) {
                    walletsArray = data;
                } else if (data && Array.isArray(data.results)) {
                    walletsArray = data.results;
                } else {
                    console.error('Unexpected wallets data format:', data);
                    walletsArray = [];
                }

                // Create a mapping of child name to wallet data (since API doesn't provide child_id)
                const walletsMap: { [key: string]: any } = {};
                walletsArray.forEach((wallet: any) => {
                    // Use the child name as the key for mapping
                    const childName = wallet.child_name;
                    if (childName) {
                        walletsMap[childName] = {
                            balance: parseFloat(wallet.balance) || 0,
                            total_earned: parseFloat(wallet.total_earned) || 0,
                            total_spent: parseFloat(wallet.total_spent) || 0,
                            savings_rate: parseFloat(wallet.savings_rate) || 0,
                            child_name: wallet.child_name || '',
                            wallet_id: wallet.id // Store the wallet ID for reference
                        };
                    }
                });

                setChildWallets(walletsMap);
                console.log('Child wallets mapping:', walletsMap);
            } catch (error) {
                console.error('Error fetching child wallets:', error);
                setChildWallets({});
            } finally {
                setIsLoadingWallets(false);
            }
        };

        fetchChildWallets();
    }, [session?.user?.id, session?.user?.accessToken, refreshTrigger]);

    // Fetch all chores data
    useEffect(() => {
        const fetchAllChores = async () => {
            if (!session?.user?.id) {
                setIsLoadingChores(false);
                return;
            }

            try {
                let allChores: BackendTask[] = [];
                let nextUrl: string | null = getApiUrl(API_ENDPOINTS.LIST_TASKS);

                // Fetch all pages of chores
                while (nextUrl) {
                    const response: Response = await fetch(nextUrl, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch chores: ${response.status}`);
                    }

                    const data: BackendTask[] | PaginatedResponse<BackendTask> = await response.json();
                    console.log('Chores data (KidsManagement):', data);

                    // Handle both paginated responses and direct arrays
                    if (Array.isArray(data)) {
                        allChores = [...allChores, ...data];
                        nextUrl = null; // No pagination for direct arrays
                    } else if (data && typeof data === 'object' && Array.isArray(data.results)) {
                        allChores = [...allChores, ...data.results];
                        nextUrl = data.next; // Continue to next page if exists
                    } else {
                        console.error('Unexpected chores data format:', data);
                        throw new Error('Invalid chores data format: Expected array or paginated response');
                    }
                }

                // Transform backend data to frontend format
                const transformedChores = transformTasksFromBackend(allChores);
                console.log('Transformed chores (KidsManagement):', transformedChores);

                // Convert to our local Chore interface
                const choreList: Chore[] = transformedChores.map(task => ({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    assignedTo: task.assignedTo,
                    assignedToName: task.assignedToName || '',
                    assignedToUsername: task.assignedToUsername || '',
                    status: task.status,
                    amount: task.reward || '0',
                    createdAt: task.createdAt,
                    completedAt: task.completedAt,
                    parentId: task.parentId || '',
                    category: 'General'
                }));

                setChores(choreList);
            } catch (error) {
                console.error('Error fetching chores:', error);
                setChores([]);
            } finally {
                setIsLoadingChores(false);
            }
        };

        fetchAllChores();
    }, [session?.user?.id, session?.user?.accessToken, refreshTrigger]);

    // Debug logging
    console.log('AppKidsManagement - Debug:', {
        kids: kids,
        kidsLength: kids.length,
        isLoadingKids,
        chores,
        isLoadingChores,
        onCreateKidClick: !!onCreateKidClick
    });
    // Convert context kids to component Kid interface with real chore data and wallet balances
    const processedKids: Kid[] = kids.map(contextKid => {
        const displayName = getKidDisplayName(contextKid);

        // Filter chores for this specific kid
        const kidChores = chores.filter(chore => chore.assignedTo === contextKid.id);

        // Count completed and pending chores for this kid
        const completedChoreCount = kidChores.filter(chore => chore.status === 'completed').length;
        const pendingChoreCount = kidChores.filter(chore => chore.status === 'pending').length;

        // Get wallet data for this kid by matching the display name
        const walletData = childWallets[displayName] || childWallets[contextKid.username];
        const balance = walletData?.balance || 0;
        const totalEarned = walletData?.total_earned || 0;
        const totalSpent = walletData?.total_spent || 0;

        // Calculate progress based on completed vs total chores (0-100%)
        const totalChores = kidChores.length;
        const progress = totalChores > 0 ? Math.round((completedChoreCount / totalChores) * 100) : 0;

        // Debug logging for per-child data
        console.log(`Kid ${contextKid.username} (${contextKid.id}):`, {
            displayName,
            walletDataFound: !!walletData,
            walletKey: displayName,
            fallbackWalletKey: contextKid.username,
            totalChores: kidChores.length,
            completedChoreCount,
            pendingChoreCount,
            balance,
            totalEarned,
            totalSpent,
            progress,
            walletData,
            kidChoresData: kidChores.map(c => ({ id: c.id, title: c.title, status: c.status }))
        });

        return {
            id: contextKid.id,
            username: contextKid.username,
            displayName: displayName, // Add display name for easy access
            avatar: contextKid.avatar,
            level: Math.max(1, Math.floor(totalEarned / 1000) + 1), // Calculate level based on earnings
            balance: balance,
            progress: progress,
            // Use real chore data for completed and pending counts per child
            completedChoreCount,
            pendingChoreCount,
            created_at: contextKid.created_at,
        };
    });

    // Pagination logic - responsive based on screen size
    const [kidsPerPage, setKidsPerPage] = useState(2);
    const totalPages = Math.ceil(processedKids.length / kidsPerPage);
    const startIndex = currentPage * kidsPerPage;
    const currentKids = processedKids.slice(startIndex, startIndex + kidsPerPage);

    // Update kids per page on window resize
    useEffect(() => {
        const getKidsPerPage = () => {
            if (typeof window !== 'undefined') {
                const width = window.innerWidth;
                if (width >= 1280) return 2; // xl: Desktop - 2 kids per page
                if (width >= 768) return 1;  // md: Tablet - 1 kid per page
                return processedKids.length;  // Mobile - show all kids
            }
            return 2; // Default fallback
        };

        const handleResize = () => {
            setKidsPerPage(getKidsPerPage());
        };

        // Set initial value
        setKidsPerPage(getKidsPerPage());

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [processedKids.length]);

    // Update pagination when kids per page changes
    useEffect(() => {
        const newTotalPages = Math.ceil(processedKids.length / kidsPerPage);
        if (currentPage >= newTotalPages && newTotalPages > 0) {
            setCurrentPage(0);
        }
    }, [kidsPerPage, processedKids.length, currentPage]);

    // Pagination handlers
    const goToPrevious = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const goToNext = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    };

    return (
        <Card className="h-full flex flex-col min-h-[400px]">
            <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-base font-semibold">Kids Management</CardTitle>
                <p className="text-sm text-muted-foreground">Track your kids progress</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    {(isLoadingKids || isLoadingChores || isLoadingWallets) ? (
                        <LoadingState />
                    ) : processedKids.length === 0 ? (
                        <EmptyState onCreateKidClick={onCreateKidClick} />
                    ) : (
                        <div className="space-y-4 pr-4">                                            {/* Desktop: Show 2 kids per page with pagination */}
                            <div className="hidden xl:block">
                                {currentKids.map(kid => (
                                    <div key={kid.id} className="border rounded-md p-4 mb-6">
                                        <div className="flex items-center gap-6">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={kid.avatar ?? undefined} alt={getFirstName(kid.displayName) || kid.username} />
                                                <AvatarFallback>{(getFirstName(kid.displayName) || kid.username).charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium leading-none">{getFirstName(kid.displayName) || kid.username}</h3>
                                                        <p className="text-sm text-muted-foreground">Level {kid.level}</p>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatNaira(kid.balance)}
                                                    </div>
                                                </div>
                                                <Progress value={kid.progress} className="w-full mt-2" />
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                                            <div className="flex flex-col items-center p-2 rounded-md bg-muted">
                                                <span className="font-semibold">{formatNaira(kid.balance)}</span>
                                                <span className="text-xs text-muted-foreground">Balance</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 rounded-md bg-muted">
                                                <span className="font-semibold">{kid.completedChoreCount}</span>
                                                <span className="text-xs text-muted-foreground">Completed</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 rounded-md bg-muted">
                                                <span className="font-semibold">{kid.pendingChoreCount}</span>
                                                <span className="text-xs text-muted-foreground">Pending</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons - Only show on TaskMaster page */}
                                        {isTaskMasterPage && (
                                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                                <Link href={`/dashboard/parents/kids/${kid.id}`} className="flex-1">
                                                    <Button variant="outline" className="w-full"><Users className="mr-2 h-4 w-4" /> View Profile</Button>
                                                </Link>
                                                <Button
                                                    className="flex-1"
                                                    onClick={() => onAssignChore?.(kid.id)}
                                                >
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Assign Chore
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Desktop Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between py-2 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={goToPrevious}
                                            disabled={currentPage === 0}
                                            className="flex items-center gap-1"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                Page {currentPage + 1} of {totalPages}
                                            </span>
                                            <div className="flex gap-1">
                                                {Array.from({ length: totalPages }).map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentPage(index)}
                                                        className={`w-2 h-2 rounded-full transition-colors ${index === currentPage ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                                        aria-label={`Go to page ${index + 1}`}
                                                        title={`Page ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={goToNext}
                                            disabled={currentPage === totalPages - 1}
                                            className="flex items-center gap-1"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>                                            {/* Tablet: Show 1 kid per page with pagination - iPad Air 5 optimized */}
                            <div className="hidden md:block xl:hidden">
                                {currentKids.slice(0, 1).map(kid => (
                                    <div key={kid.id} className="border rounded-lg p-6 mb-6">
                                        <div className="flex items-center gap-6">
                                            <Avatar className="w-16 h-16">
                                                <AvatarImage src={kid.avatar ?? undefined} alt={getFirstName(kid.displayName) || kid.username} />
                                                <AvatarFallback className="text-lg">{(getFirstName(kid.displayName) || kid.username).charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-lg leading-none">{getFirstName(kid.displayName) || kid.username}</h3>
                                                        <p className="text-base text-muted-foreground mt-1">Level {kid.level}</p>
                                                    </div>
                                                    <div className="text-base text-muted-foreground font-medium">
                                                        {formatNaira(kid.balance)}
                                                    </div>
                                                </div>
                                                <Progress value={kid.progress} className="w-full mt-3 h-2" />
                                            </div>
                                        </div>

                                        {/* Stats Grid - Tablet optimized */}
                                        <div className="grid grid-cols-3 gap-6 mt-6 text-center">
                                            <div className="flex flex-col items-center p-4 rounded-lg bg-muted">
                                                <span className="font-bold text-lg">{formatNaira(kid.balance)}</span>
                                                <span className="text-sm text-muted-foreground mt-1">Balance</span>
                                            </div>
                                            <div className="flex flex-col items-center p-4 rounded-lg bg-muted">
                                                <span className="font-bold text-lg">{kid.completedChoreCount}</span>
                                                <span className="text-sm text-muted-foreground mt-1">Completed</span>
                                            </div>
                                            <div className="flex flex-col items-center p-4 rounded-lg bg-muted">
                                                <span className="font-bold text-lg">{kid.pendingChoreCount}</span>
                                                <span className="text-sm text-muted-foreground mt-1">Pending</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons - Tablet optimized */}
                                        {isTaskMasterPage && (
                                            <div className="flex gap-4 mt-6">
                                                <Link href={`/dashboard/parents/kids/${kid.id}`} className="flex-1">
                                                    <Button variant="outline" className="w-full h-12 text-base">
                                                        <Users className="mr-2 h-5 w-5" /> View Profile
                                                    </Button>
                                                </Link>
                                                <Button
                                                    className="flex-1 h-12 text-base"
                                                    onClick={() => onAssignChore?.(kid.id)}
                                                >
                                                    <PlusCircle className="mr-2 h-5 w-5" /> Assign Chore
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Tablet Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between py-4 border-t">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            onClick={goToPrevious}
                                            disabled={currentPage === 0}
                                            className="flex items-center gap-2"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                            Previous
                                        </Button>

                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">
                                                Page {currentPage + 1} of {totalPages}
                                            </span>
                                            <div className="flex gap-2">
                                                {Array.from({ length: totalPages }).map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentPage(index)}
                                                        className={`w-3 h-3 rounded-full transition-colors ${index === currentPage ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                                        aria-label={`Go to page ${index + 1}`}
                                                        title={`Page ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            onClick={goToNext}
                                            disabled={currentPage === totalPages - 1}
                                            className="flex items-center gap-2"
                                        >
                                            Next
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile: Show ALL kids (no pagination) */}
                            <div className="block md:hidden">
                                {processedKids.map(kid => (
                                    <div key={kid.id} className="border rounded-md p-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={kid.avatar ?? undefined} alt={getFirstName(kid.displayName) || kid.username} />
                                                <AvatarFallback>{(getFirstName(kid.displayName) || kid.username).charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium leading-none">{getFirstName(kid.displayName) || kid.username}</h3>
                                                        <p className="text-sm text-muted-foreground">Level {kid.level}</p>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatNaira(kid.balance)}
                                                    </div>
                                                </div>
                                                <Progress value={kid.progress} className="w-full mt-2" />
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                                            <div className="flex flex-col items-center p-2 rounded-md bg-muted">
                                                <span className="font-semibold">{formatNaira(kid.balance)}</span>
                                                <span className="text-xs text-muted-foreground">Balance</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 rounded-md bg-muted">
                                                <span className="font-semibold">{kid.completedChoreCount}</span>
                                                <span className="text-xs text-muted-foreground">Completed</span>
                                            </div>                                        <div className="flex flex-col items-center p-2 rounded-md bg-muted">
                                                <span className="font-semibold">{kid.pendingChoreCount}</span>
                                                <span className="text-xs text-muted-foreground">Pending</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons - Only show on TaskMaster page */}
                                        {isTaskMasterPage && (
                                            <div className="flex flex-col sm:flex-row gap-2 mt-4">                                            <Link href={`/dashboard/parents/kids/${kid.id}`} className="flex-1">
                                                <Button variant="outline" className="w-full"><Users className="mr-2 h-4 w-4" /> View Profile</Button>
                                            </Link>
                                                <Button
                                                    className="flex-1"
                                                    onClick={() => onAssignChore?.(kid.id)}
                                                >
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Assign Chore
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>);
};

export default AppKidsManagement;