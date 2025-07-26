'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmptyState from "./EmptyState";
import KidsList from "./KidsList";
import KidsPagination from "./KidsPagination";

// Local Kid interface (match ParentDashboardOverview and ParentsPage)
interface Kid {
    id: string;
    username: string;
    firstName: string;
    displayName?: string;
    avatar?: string | null;
    level: number;
    balance: number;
    progress: number;
    completedChoreCount: number;
    pendingChoreCount: number;
    created_at?: string;
    parent?: string;
    child_id?: string;
    child_name?: string;
}

interface AppKidsManagerProps {
    kids: Kid[];
    kidsCount: number;
    kidsPage: number;
    kidsTotalPages: number;
    onKidsPageChange: (page: number) => void;
    isLoading: boolean;
    isError: boolean;
    onCreateKid?: () => void;
    onAssignChore?: (kidId: string) => void;
}

const AppKidsManager = ({
    kids,
    kidsCount,
    kidsPage,
    kidsTotalPages,
    onKidsPageChange,
    isLoading,
    isError,
    onCreateKid = () => {},
    onAssignChore = () => {},
}: AppKidsManagerProps) => {
    const goToPrevious = () => onKidsPageChange(Math.max(1, kidsPage - 1));
    const goToNext = () => onKidsPageChange(Math.min(kidsTotalPages, kidsPage + 1));

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-base font-semibold">Kids Management</CardTitle>
                <p className="text-sm text-muted-foreground">Track your kids progress</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    {isLoading ? (
                        <div className="h-40 flex items-center justify-center text-muted-foreground">Loading...</div>
                    ) : isError ? (
                        <div className="h-40 flex items-center justify-center text-red-500">Error loading kids.</div>
                    ) : kidsCount === 0 ? (
                        <EmptyState onCreateKid={onCreateKid} />
                    ) : (
                        <div className="space-y-4 pr-4">
                            {/* Desktop */}
                            <div className="hidden xl:block">
                                <KidsList kids={kids} onAssignChore={onAssignChore} />
                                {kidsTotalPages > 1 && (
                                    <KidsPagination
                                        currentPage={kidsPage}
                                        totalPages={kidsTotalPages}
                                        onPageChange={onKidsPageChange}
                                        goToPrevious={goToPrevious}
                                        goToNext={goToNext}
                                    />
                                )}
                            </div>
                            {/* Tablet */}
                            <div className="hidden md:block xl:hidden">
                                <KidsList kids={kids} onAssignChore={onAssignChore} />
                                {kidsTotalPages > 1 && (
                                    <KidsPagination
                                        currentPage={kidsPage}
                                        totalPages={kidsTotalPages}
                                        onPageChange={onKidsPageChange}
                                        goToPrevious={goToPrevious}
                                        goToNext={goToNext}
                                        tablet
                                    />
                                )}
                            </div>
                            {/* Mobile */}
                            <div className="block md:hidden">
                                <KidsList kids={kids} onAssignChore={onAssignChore} mobile />
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default AppKidsManager;