'use client'

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { usePathname } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Task, transformTasksFromBackend, BackendTask, getFirstName } from '@/lib/utils/taskTransforms';
import { authenticatedFetch } from '@/lib/utils/auth-api';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Type for paginated API responses
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
import { useKid } from '@/contexts/KidContext';

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

interface AppChoreManagementProps {
    kidId?: string; // Optional prop for kid-specific chore management
    refreshTrigger?: number; // Trigger to refresh data
}

export function AppChoreManagement({ kidId, refreshTrigger }: AppChoreManagementProps = {}) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const { kids, getKidDisplayName, isLoadingKids, currentKid, isKidSession } = useKid();

    const [activeKidTab, setActiveKidTab] = useState("all");
    const [activeStatusTab, setActiveStatusTab] = useState("pending");
    const [isLoading, setIsLoading] = useState(true);
    const [chores, setChores] = useState<Task[]>([]);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Pagination state for desktop view
    const [currentPendingPage, setCurrentPendingPage] = useState(1);
    const [currentCompletedPage, setCurrentCompletedPage] = useState(1);
    const isMobile = useIsMobile();
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        reward: '',
        dueDate: new Date(), // Default to today's date
        assignedTo: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Build API URL with filters - fetch all chores without pagination
                let apiUrl = getApiUrl(API_ENDPOINTS.LIST_TASKS);

                // Add query parameters
                const urlParams = new URLSearchParams();

                // If kidId prop is provided, filter by that specific kid
                if (kidId) {
                    urlParams.append('assignedTo', kidId);
                }

            
                // Append query parameters to URL
                if (urlParams.toString()) {
                    apiUrl += `?${urlParams.toString()}`;
                }

                const choresResponse = await fetch(apiUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });

                if (!choresResponse.ok) {
                    throw new Error('Failed to fetch chores');
                }

                const choresData: BackendTask[] | PaginatedResponse<BackendTask> = await choresResponse.json();

                // Handle different response formats
                let allChores: BackendTask[] = [];

                if (Array.isArray(choresData)) {
                    // Direct array response
                    allChores = choresData;
                } else if ('results' in choresData && Array.isArray(choresData.results)) {
                    // Paginated response - collect all pages
                    allChores = [...choresData.results];

                    // If there are more pages, fetch them all
                    let nextUrl = choresData.next;
                    while (nextUrl) {
                        console.log('Fetching next page:', nextUrl);
                        const nextResponse = await fetch(nextUrl, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.user.accessToken}`,
                            },
                        });

                        if (!nextResponse.ok) {
                            console.warn('Failed to fetch next page, stopping pagination');
                            break;
                        }

                        const nextData: PaginatedResponse<BackendTask> = await nextResponse.json();
                        allChores = [...allChores, ...nextData.results];
                        nextUrl = nextData.next;
                    }
                }

                console.log(`Fetched ${allChores.length} total chores across all pages`);

                // Transform backend task data to frontend format
                const transformedChores = transformTasksFromBackend(allChores);
                setChores(transformedChores);
            } catch (err) {
                console.error("Error fetching chores:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [session?.user?.id, session?.user?.accessToken, refreshTrigger, kidId]);

    // Select the first 3 kids for dynamic tabs
    const kidsForTabs = kids.slice(0, 3);

    // Filter chores by the selected kid tab or kidId prop
    const filteredChores = useMemo(() => {
        let filtered = chores;

        // If kidId prop is provided, the chores are already filtered by the API
        // Only apply frontend filtering when using tabs and no kidId prop
        if (!kidId && activeKidTab !== "all") {
            // Filter by child ID directly (chore.assignedTo contains child ID, activeKidTab is child ID)
            filtered = chores.filter(chore => chore.assignedTo === activeKidTab);
        }

        return filtered;
    }, [chores, activeKidTab, kidId]);

    // Separate filtered chores by status for displaying counts
    const pendingFilteredChores = filteredChores.filter(chore => chore.status === "pending");
    const completedFilteredChores = filteredChores.filter(chore => chore.status === "completed");

    // Pagination logic for desktop view
    const CHORES_PER_PAGE = 3;

    // Calculate pagination for pending chores
    const totalPendingPages = Math.ceil(pendingFilteredChores.length / CHORES_PER_PAGE);
    const paginatedPendingChores = isMobile
        ? pendingFilteredChores
        : pendingFilteredChores.slice(
            (currentPendingPage - 1) * CHORES_PER_PAGE,
            currentPendingPage * CHORES_PER_PAGE
        );

    // Calculate pagination for completed chores
    const totalCompletedPages = Math.ceil(completedFilteredChores.length / CHORES_PER_PAGE);
    const paginatedCompletedChores = isMobile
        ? completedFilteredChores
        : completedFilteredChores.slice(
            (currentCompletedPage - 1) * CHORES_PER_PAGE,
            currentCompletedPage * CHORES_PER_PAGE
        );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPendingPage(1);
        setCurrentCompletedPage(1);
    }, [activeKidTab, kidId, chores.length]);

    // Delete task handler
    const handleDeleteTask = async (taskId: string) => {
        if (!session?.user?.accessToken) return;

        const confirmDelete = window.confirm('Are you sure you want to delete this chore?');
        if (!confirmDelete) return;

        setIsDeleting(taskId);
        try {
            const response = await authenticatedFetch(
                API_ENDPOINTS.DELETE_TASK.replace(':taskId', taskId),
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) {
                throw new Error(response.error || 'Failed to delete chore');
            }

            // Remove the deleted chore from the state
            setChores(prev => prev.filter(chore => chore.id !== taskId));
        } catch (error) {
            console.error('Error deleting chore:', error);
            alert('Failed to delete chore. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

    // Edit task handler
    const handleEditTask = (taskId: string) => {
        const task = chores.find(chore => chore.id === taskId);
        if (!task) return;

        // Find the kid by ID to get their username for the form
        const assignedKid = kids.find(kid => kid.id === task.assignedTo);
        const assignedUsername = assignedKid ? assignedKid.username : task.assignedTo;

        setEditingTask(task);
        setEditFormData({
            title: task.title,
            description: task.description,
            reward: task.reward.toString(),
            dueDate: task.dueDate ? new Date(task.dueDate) : new Date(), // Convert string to Date or use today
            assignedTo: assignedUsername // Use username for form dropdown
        });
        setIsEditModalOpen(true);
    };

    // Handle edit form input changes
    const handleEditFormChange = (field: string, value: string | Date) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle edit form submission
    const handleUpdateTask = async () => {
        if (!editingTask || !session?.user?.accessToken) return;

        setIsUpdating(true);
        try {
            // Validate required fields
            if (!editFormData.dueDate) {
                throw new Error('Due date is required');
            }

            // Find the kid ID from the selected username
            const selectedKid = kids.find(kid => kid.username === editFormData.assignedTo);
            if (!selectedKid) {
                throw new Error('Selected kid not found');
            }

            const updateData = {
                title: editFormData.title,
                description: editFormData.description,
                reward: parseFloat(editFormData.reward),
                due_date: editFormData.dueDate.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD
                assigned_to: selectedKid.id // Use kid ID instead of username
            };

            const response = await authenticatedFetch(
                API_ENDPOINTS.UPDATE_TASK.replace(':taskId', editingTask.id),
                {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                }
            );

            if (!response.ok) {
                console.error('AppChoreManagement - API Error Response:', response.error);
                throw new Error(response.error || 'Failed to update chore');
            }

            // Update the task in local state
            setChores(prev => prev.map(chore =>
                chore.id === editingTask.id
                    ? {
                        ...chore,
                        title: editFormData.title,
                        description: editFormData.description,
                        reward: editFormData.reward, // Keep as string to match Task interface
                        dueDate: editFormData.dueDate.toISOString().split('T')[0], // Convert Date back to string
                        assignedTo: selectedKid.id, // Use child ID, not username
                        assignedToName: chore.assignedToName, // Preserve the name
                        assignedToUsername: selectedKid.username // Update username
                    }
                    : chore
            ));

            setIsEditModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Error updating chore:', error);
            alert('Failed to update chore. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Close edit modal
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTask(null);
        setEditFormData({
            title: '',
            description: '',
            reward: '',
            dueDate: new Date(), // Reset to today's date
            assignedTo: ''
        });
    };

    // Function to get kid's name by username (from chore.assignedTo)
    const getKidNameByUsername = (username: string, choreName?: string) => {
        // If we have the name from chore data, use it directly but return only first name
        if (choreName) {
            return getFirstName(choreName);
        }

        // Handle empty or invalid username
        if (!username) {
            return 'Unassigned';
        }

        // For kid sessions, use currentKid if it matches the username
        if (isKidSession && currentKid && currentKid.username === username) {
            return currentKid.username || 'Kid';
        }

        // For parent sessions, find in kids list
        const kid = kids.find(k => k.username === username);
        if (kid) {
            const fullName = getKidDisplayName(kid);
            // Return only first name using our utility function
            return getFirstName(fullName);
        }

        // If kids are still loading, show loading state
        if (isLoadingKids) {
            return 'Loading...';
        }

        // Fallback: return the username itself if not found in kids list
        return username;
    };

    // Function to get kid's avatar by username (from chore.assignedTo)
    const getKidAvatarByUsername = (username: string): string | undefined => {
        // Handle empty or invalid username
        if (!username) {
            return undefined;
        }

        // For kid sessions, use currentKid if it matches the username
        if (isKidSession && currentKid && currentKid.username === username) {
            return currentKid.avatar ?? undefined;
        }

        // For parent sessions, find in kids list
        const kid = kids.find(k => k.username === username);
        return kid?.avatar ?? undefined;
    };

    // Function to get kid's name by ID (for UI components that still use IDs)
    const getKidName = (kidId: string) => {
        // For kid sessions, use currentKid if available
        if (isKidSession && currentKid && currentKid.id === kidId) {
            return currentKid.username || 'Kid';
        }

        // For parent sessions, find in kids list
        const kid = kids.find(k => k.id === kidId);
        return kid ? getKidDisplayName(kid) : 'Unknown Kid';
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                {/* Main Tabs: All Chores and Kid Tabs - Visible only on TaskMaster page and when kidId is not provided */}
                {pathname === '/dashboard/parents/taskmaster' && !kidId && (
                    <Tabs value={activeKidTab} onValueChange={setActiveKidTab} className="w-full">
                        <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="all">All Chores</TabsTrigger>
                            {kidsForTabs.map(kid => {
                                const fullName = getKidDisplayName(kid);
                                const firstName = fullName.split(' ')[0]; // Get first name only
                                return (
                                    <TabsTrigger key={kid.id} value={kid.id}>{firstName}&apos;s Chore</TabsTrigger>
                                );
                            })}
                        </TabsList>

                        <TabsContent value={activeKidTab} className="mt-0 space-y-4">
                            {/* This TabsContent is just a container for the structure */}
                        </TabsContent>
                    </Tabs>
                )}
                <CardTitle className="text-xl font-semibold">
                    {kidId ? (isKidSession ? 'My Chores' : `${getKidName(kidId)}'s Chore Management`) : 'Chore Management'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    {kidId ? (isKidSession ? 'View and manage your assigned chores' : `Assign and manage ${getKidName(kidId)}'s chores`) : "Assign and manage kid's chores"}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                {/* Status Tabs: Pending and Completed */}
                <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="w-full flex flex-col h-full">
                    <TabsList className="grid grid-cols-2 w-full h-12 flex-shrink-0">
                        <TabsTrigger value="pending" className="border p-2">
                            Pending ({pendingFilteredChores.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Completed ({completedFilteredChores.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Content based on selected Status tab */}
                    <TabsContent value="pending" className="flex-1 flex flex-col mt-4 overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="space-y-4 pr-4">
                                {isLoading || isLoadingKids ? (
                                    // Skeleton loading for pending chores
                                    Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="border rounded-md p-4 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-8 w-8" />
                                                    <Skeleton className="h-8 w-8" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <Skeleton className="h-4 w-16" />
                                                <div className="flex items-center gap-1">
                                                    <Skeleton className="h-5 w-5 rounded-full" />
                                                    <Skeleton className="h-3 w-12" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : pendingFilteredChores.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        {isKidSession
                                            ? "You don't have any pending chores right now! 🎉"
                                            : `No pending chores found for ${kidId ? getKidName(kidId) : (activeKidTab === "all" ? "all kids" : getKidName(activeKidTab))}.`
                                        }
                                    </div>
                                ) : (
                                    paginatedPendingChores.map((chore) => (
                                        <div key={chore.id} className="border rounded-md p-4">
                                            {kidId ? (
                                                // Kid view: Simple format matching kidschore.png
                                                <>
                                                    <h3 className="font-medium">{chore.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="text-sm font-medium text-green-500">
                                                            ₦{parseFloat(chore.reward || '0').toLocaleString()}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <span className="text-xs">U</span>
                                                            <span className="text-xs">{getKidNameByUsername(chore.assignedTo, chore.assignedToName)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                // Parent view: Full format with action buttons
                                                <>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-medium">{chore.title}</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-primary hover:text-primary/90"
                                                                onClick={() => handleEditTask(chore.id)}
                                                            >
                                                                <Pencil className="w-5 h-5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive/90"
                                                                onClick={() => handleDeleteTask(chore.id)}
                                                                disabled={isDeleting === chore.id}
                                                            >
                                                                <Trash className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="text-sm font-medium text-green-500">
                                                            ₦{parseFloat(chore.reward || '0').toLocaleString()}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Avatar className="w-5 h-5">
                                                                <AvatarImage src={getKidAvatarByUsername(chore.assignedTo)} alt={getKidNameByUsername(chore.assignedTo, chore.assignedToName)} />
                                                                <AvatarFallback>{getKidNameByUsername(chore.assignedTo, chore.assignedToName)?.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs">{getKidNameByUsername(chore.assignedTo, chore.assignedToName)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        {/* Pagination Controls for Desktop - Pending Chores */}
                        {!isMobile && pendingFilteredChores.length > CHORES_PER_PAGE && (
                            <div className="flex items-center justify-between mt-4 px-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {Math.min((currentPendingPage - 1) * CHORES_PER_PAGE + 1, pendingFilteredChores.length)} to {Math.min(currentPendingPage * CHORES_PER_PAGE, pendingFilteredChores.length)} of {pendingFilteredChores.length} pending chores
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPendingPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPendingPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPendingPages }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                variant={currentPendingPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPendingPage(page)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPendingPage(prev => Math.min(totalPendingPages, prev + 1))}
                                        disabled={currentPendingPage === totalPendingPages}
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                    </TabsContent>

                    <TabsContent value="completed" className="flex-1 flex flex-col mt-4 overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="space-y-4 pr-4">
                                {isLoading || isLoadingKids ? (
                                    // Skeleton loading for completed chores
                                    Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="border rounded-md p-4 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-8 w-8" />
                                                    <Skeleton className="h-8 w-8" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <Skeleton className="h-4 w-16" />
                                                <div className="flex items-center gap-1">
                                                    <Skeleton className="h-5 w-5 rounded-full" />
                                                    <Skeleton className="h-3 w-12" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : completedFilteredChores.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        No completed chores found for {kidId ? getKidName(kidId) : (activeKidTab === "all" ? "all kids" : getKidName(activeKidTab))}.
                                    </div>
                                ) : (paginatedCompletedChores.map((chore) => (
                                    <div key={chore.id} className="border rounded-md p-4">
                                        {kidId ? (
                                            // Kid view: Simple format matching kidschore.png
                                            <>
                                                <h3 className="font-medium">{chore.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="text-sm font-medium text-green-500">
                                                        ₦{parseFloat(chore.reward || '0').toLocaleString()}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <span className="text-xs">U</span>
                                                        <span className="text-xs">{getKidNameByUsername(chore.assignedTo, chore.assignedToName)}</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            // Parent view: Full format with action buttons
                                            <>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-medium">{chore.title}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-primary hover:text-primary/90"
                                                            onClick={() => handleEditTask(chore.id)}
                                                        >
                                                            <Pencil className="w-5 h-5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive/90"
                                                            onClick={() => handleDeleteTask(chore.id)}
                                                            disabled={isDeleting === chore.id}
                                                        >
                                                            <Trash className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="text-sm font-medium text-green-500">
                                                        ₦{parseFloat(chore.reward || '0').toLocaleString()}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Avatar className="w-5 h-5">
                                                            <AvatarImage src={getKidAvatarByUsername(chore.assignedTo)} alt={getKidNameByUsername(chore.assignedTo, chore.assignedToName)} />
                                                            <AvatarFallback>{getKidNameByUsername(chore.assignedTo, chore.assignedToName)?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs">{getKidNameByUsername(chore.assignedTo, chore.assignedToName)}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                                )}
                            </div>
                        </ScrollArea>

                        {/* Pagination Controls for Desktop - Completed Chores */}
                        {!isMobile && completedFilteredChores.length > CHORES_PER_PAGE && (
                            <div className="flex items-center justify-between mt-4 px-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {Math.min((currentCompletedPage - 1) * CHORES_PER_PAGE + 1, completedFilteredChores.length)} to {Math.min(currentCompletedPage * CHORES_PER_PAGE, completedFilteredChores.length)} of {completedFilteredChores.length} completed chores
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentCompletedPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentCompletedPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalCompletedPages }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                variant={currentCompletedPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentCompletedPage(page)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentCompletedPage(prev => Math.min(totalCompletedPages, prev + 1))}
                                        disabled={currentCompletedPage === totalCompletedPages}
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>

            {/* Edit Task Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Chore</DialogTitle>
                        <DialogDescription>
                            Make changes to the chore details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={editFormData.title}
                                onChange={(e) => handleEditFormChange('title', e.target.value)}
                                placeholder="Enter chore title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editFormData.description}
                                onChange={(e) => handleEditFormChange('description', e.target.value)}
                                placeholder="Enter chore description"
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reward">Reward (₦)</Label>
                            <Input
                                id="reward"
                                type="number"
                                value={editFormData.reward}
                                onChange={(e) => handleEditFormChange('reward', e.target.value)}
                                placeholder="Enter reward amount"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !editFormData.dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editFormData.dueDate ? formatDate(editFormData.dueDate) : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={editFormData.dueDate}
                                        onSelect={(date) => date && handleEditFormChange('dueDate', date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="assignedTo">Assigned To</Label>
                            <Select
                                value={editFormData.assignedTo}
                                onValueChange={(value) => handleEditFormChange('assignedTo', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a kid" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kids.map((kid) => (
                                        <SelectItem key={kid.id} value={kid.username}>
                                            {getKidDisplayName(kid)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseEditModal}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateTask}
                            disabled={isUpdating || !editFormData.title || !editFormData.assignedTo || !editFormData.dueDate}
                        >
                            {isUpdating ? 'Updating...' : 'Update Chore'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

export default AppChoreManagement; 