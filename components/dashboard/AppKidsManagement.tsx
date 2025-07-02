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
            </div>
        ))}
    </div>
);

const AppKidsManagement = ({ onCreateKidClick, onAssignChore }: AppKidsManagementProps) => {
    const { kids, isLoadingKids, getKidDisplayName } = useKid();
    const [currentPage, setCurrentPage] = useState(0);
    const pathname = usePathname();

    // Check if we're on the TaskMaster page
    const isTaskMasterPage = pathname === '/dashboard/parents/taskmaster';

    // Debug logging
    console.log('AppKidsManagement - Debug:', {
        kids: kids,
        kidsLength: kids.length,
        isLoadingKids,
        onCreateKidClick: !!onCreateKidClick
    });
    // Convert context kids to component Kid interface with placeholder data
    const processedKids: Kid[] = kids.map(contextKid => {
        const displayName = getKidDisplayName(contextKid);
        return {
            id: contextKid.id,
            username: contextKid.username,
            displayName: displayName, // Add display name for easy access
            avatar: contextKid.avatar,
            level: Math.floor(Math.random() * 5) + 1, // Random level 1-5 for now
            balance: Math.floor(Math.random() * 10000), // Random balance for now
            progress: Math.floor(Math.random() * 100), // Random progress for now
            completedChoreCount: Math.floor(Math.random() * 10), // Random completed chores
            pendingChoreCount: Math.floor(Math.random() * 5), // Random pending chores
            created_at: contextKid.created_at,
        };
    });

    // Pagination logic
    const kidsPerPage = 2;
    const totalPages = Math.ceil(processedKids.length / kidsPerPage);
    const startIndex = currentPage * kidsPerPage;
    const currentKids = processedKids.slice(startIndex, startIndex + kidsPerPage);

    // Pagination handlers
    const goToPrevious = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const goToNext = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    };

    // Reset page when kids change
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(0);
        }
    }, [processedKids.length, currentPage, totalPages]);

    return (
        <Card className="h-full flex flex-col min-h-[400px]">
            <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-base font-semibold">Kids Management</CardTitle>
                <p className="text-sm text-muted-foreground">Track your kids progress</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">                    {isLoadingKids ? (
                    <LoadingState />
                ) : processedKids.length === 0 ? (
                    <EmptyState onCreateKidClick={onCreateKidClick} />
                ) : (
                    <div className="space-y-4 pr-4">
                        {/* Desktop: Show 2 kids per page with pagination */}                        <div className="hidden lg:block">
                            {currentKids.map(kid => (
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
                                                    NGN {kid.balance.toLocaleString()}
                                                </div>
                                            </div>
                                            <Progress value={kid.progress} className="w-full mt-2" />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                                        <div className="flex flex-col items-center p-2 rounded-md bg-muted">
                                            <span className="font-semibold">NGN {kid.balance.toLocaleString()}</span>
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
                        </div>                        
                        
                        {/* Mobile: Show ALL kids (no pagination) */}
                        <div className="block lg:hidden">
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
                                                    NGN {kid.balance.toLocaleString()}
                                                </div>
                                            </div>
                                            <Progress value={kid.progress} className="w-full mt-2" />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                                        <div className="flex flex-col items-center p-2 rounded-md bg-muted">
                                            <span className="font-semibold">NGN {kid.balance.toLocaleString()}</span>
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