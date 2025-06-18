'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';
import { Users, PlusCircle, UserPlus } from 'lucide-react';
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';

interface Kid {
    id: string;
    name: string;
    avatar?: string | null;
    level: number;
    balance: number;
    progress: number;
    completedChoreCount: number;
    pendingChoreCount: number;
}

interface AppKidsManagementProps {
    kids?: Kid[];
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Kids Added Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
            Start by adding your kids to track their chores and progress.
        </p>
        <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add First Kid
        </Button>
    </div>
);

const LoadingState = () => (
    <div className="space-y-4 sm:space-y-6 pr-4">
        {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="border rounded-md p-3 sm:p-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                    <div className="flex-1 space-y-2 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div>
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-2 w-full mt-2" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                        <Skeleton className="h-4 w-12 mb-1" />
                        <Skeleton className="h-3 w-8" />
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                        <Skeleton className="h-4 w-8 mb-1" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                        <Skeleton className="h-4 w-8 mb-1" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Skeleton className="h-10 w-full sm:w-1/2" />
                    <Skeleton className="h-10 w-full sm:w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

const InfoState = () => (
    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Children Info</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Your children&apos;s progress information will be displayed here when available
        </p>
    </div>
);

const AppKidsManagement = ({ kids: initialKids }: AppKidsManagementProps) => {
    const pathname = usePathname();
    const isTaskMasterPage = pathname === '/dashboard/parents/taskmaster';
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(!initialKids);
    const [currentPage, setCurrentPage] = useState(0);
    const [kids, setKids] = useState<Kid[]>(initialKids || []);
    const [needsRetry, setNeedsRetry] = useState(false); const fetchKidsData = useCallback(async () => {
        // Skip fetching if we already have initial kids data
        if (initialKids && initialKids.length > 0) {
            setIsLoading(false);
            return;
        }

        if (!session?.user?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setNeedsRetry(false);
        try {
            // Fetch kids data
            const kidsResponse = await fetch(getApiUrl(API_ENDPOINTS.LIST_CHILDREN));
            if (!kidsResponse.ok) {
                throw new Error('Failed to fetch kids data');
            }
            const kidsData = await kidsResponse.json();

            // Fetch chores data for each kid
            const choresResponse = await fetch(getApiUrl(API_ENDPOINTS.CHORES));
            if (!choresResponse.ok) {
                throw new Error('Failed to fetch chores data');
            }
            const choresData = await choresResponse.json();

            // Process and combine the data
            const processedKids = kidsData.map((kid: any) => {
                const kidChores = choresData.filter((chore: any) => chore.childId === kid.id);
                const completedChoreCount = kidChores.filter((chore: any) => chore.status === "completed").length;
                const pendingChoreCount = kidChores.filter((chore: any) => chore.status === "pending").length;

                // Calculate progress based on completed chores
                const progress = kidChores.length > 0
                    ? (completedChoreCount / kidChores.length) * 100
                    : 0;

                return {
                    id: kid.id,
                    name: kid.name,
                    avatar: kid.avatar,
                    level: kid.level || 1,
                    balance: kid.balance || 0,
                    progress,
                    completedChoreCount,
                    pendingChoreCount
                };
            });

            setKids(processedKids);
        } catch (error) {
            console.error('Error fetching kids data:', error);
            setNeedsRetry(true);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.id, initialKids]);

    useEffect(() => {
        fetchKidsData();
    }, [fetchKidsData]);

    // Pagination logic for large screens
    const kidsPerPage = 2;
    const totalPages = Math.ceil(kids.length / kidsPerPage);
    const startIndex = currentPage * kidsPerPage;
    const endIndex = startIndex + kidsPerPage;
    const currentPageKids = kids.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
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
                    {isLoading ? (
                        <LoadingState />
                    ) : needsRetry ? (
                        <InfoState />
                    ) : kids.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-4 sm:space-y-6 pr-4">
                            {/* Show only first 2 kids on lg and above screens with pagination */}
                            <div className="hidden lg:block">
                                {currentPageKids.map(kid => (
                                    <div key={kid.id} className="border rounded-md p-3 sm:p-4 mb-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                                <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                                                <AvatarFallback>{kid.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 w-full">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                    <div>
                                                        <h3 className="font-medium leading-none">{kid.name}</h3>
                                                        <p className="text-sm text-muted-foreground">Level {kid.level}</p>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground sm:text-right">
                                                        NGN {kid.balance.toLocaleString()}
                                                    </div>
                                                </div>
                                                <Progress value={kid.progress} className="w-full mt-2" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 text-center text-sm">
                                            {[
                                                {
                                                    label: 'NGN',
                                                    value: kid.balance.toLocaleString(),
                                                    description: 'Balance',
                                                },
                                                {
                                                    label: 'Completed',
                                                    value: kid.completedChoreCount,
                                                },
                                                {
                                                    label: 'Pending',
                                                    value: kid.pendingChoreCount,
                                                },
                                            ].map((stat, index) => (
                                                <div key={index} className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                                    <span className="font-semibold">{stat.value}</span>
                                                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {isTaskMasterPage && (
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                                                <Link href={`/dashboard/parents/kids/${kid.id}`} className="flex-1">
                                                    <Button variant="outline" className="w-full"><Users className="mr-2 h-4 w-4" /> View Profile</Button>
                                                </Link>
                                                <Button className="flex-1"><PlusCircle className="mr-2 h-4 w-4" /> Assign Chore</Button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Navigation and indicator for pagination */}
                                {kids.length > kidsPerPage && (
                                    <div className="flex items-center justify-between py-2 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handlePrevPage}
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
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages - 1}
                                            className="flex items-center gap-1"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Show all kids on smaller screens with scrolling */}
                            <div className="block lg:hidden">
                                {kids.map(kid => (
                                    <div key={kid.id} className="border rounded-md p-3 sm:p-4 mb-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                                <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                                                <AvatarFallback>{kid.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 w-full">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                    <div>
                                                        <h3 className="font-medium leading-none">{kid.name}</h3>
                                                        <p className="text-sm text-muted-foreground">Level {kid.level}</p>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground sm:text-right">
                                                        NGN {kid.balance.toLocaleString()}
                                                    </div>
                                                </div>
                                                <Progress value={kid.progress} className="w-full mt-2" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 text-center text-sm">
                                            {[
                                                {
                                                    label: 'NGN',
                                                    value: kid.balance.toLocaleString(),
                                                    description: 'Balance',
                                                },
                                                {
                                                    label: 'Completed',
                                                    value: kid.completedChoreCount,
                                                },
                                                {
                                                    label: 'Pending',
                                                    value: kid.pendingChoreCount,
                                                },
                                            ].map((stat, index) => (
                                                <div key={index} className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                                    <span className="font-semibold">{stat.value}</span>
                                                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {isTaskMasterPage && (
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                                                <Link href={`/dashboard/parents/kids/${kid.id}`} className="flex-1">
                                                    <Button variant="outline" className="w-full"><Users className="mr-2 h-4 w-4" /> View Profile</Button>
                                                </Link>
                                                <Button className="flex-1"><PlusCircle className="mr-2 h-4 w-4" /> Assign Chore</Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

export default AppKidsManagement;