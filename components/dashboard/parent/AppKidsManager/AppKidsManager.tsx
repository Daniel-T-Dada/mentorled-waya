'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmptyState from "./EmptyState";
import KidsList from "./KidsList";
import KidsPagination from "./KidsPagination";
import { usePathname } from "next/navigation";

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
    onCreateKid = () => { },
    onAssignChore = () => { },
}: AppKidsManagerProps) => {
    const pathname = usePathname();

    const showActionButtons = pathname === '/dashboard/parents/taskmaster';

    const goToPrevious = () => onKidsPageChange(Math.max(1, kidsPage - 1));
    const goToNext = () => onKidsPageChange(Math.min(kidsTotalPages, kidsPage + 1));

    const showInfoState = isError || kidsCount === 0 || isLoading;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-base font-semibold">Kids Management</CardTitle>
                <p className="text-sm text-muted-foreground">Track your kids progress</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    {showInfoState ? (
                        <EmptyState onCreateKid={onCreateKid} />
                    ) : (
                        <div className="space-y-4 pr-4">
                            <div className="hidden xl:block">
                                <KidsList kids={kids} onAssignChore={onAssignChore} showActionButtons={showActionButtons} />
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
                            <div className="hidden md:block xl:hidden">
                                <KidsList kids={kids} onAssignChore={onAssignChore} showActionButtons={showActionButtons} />
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
                            <div className="block md:hidden">
                                <KidsList kids={kids} onAssignChore={onAssignChore} showActionButtons={showActionButtons} mobile />
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default AppKidsManager;