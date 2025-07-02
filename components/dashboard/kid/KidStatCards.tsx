'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Task, transformTasksFromBackend, transformTaskFromBackend, BackendTask } from '@/lib/utils/taskTransforms';

interface KidStatCardsProps {
    kidId?: string;
    section?: 'overview' | 'chore' | 'money-maze' | 'goal-getter' | 'earning-meter';
}

interface KidData {
    id: string;
    name?: string;
    username: string;
    parent?: string;
    avatar?: string | null;
    created_at?: string;
}

const KidStatCards = ({ kidId: propKidId, section = 'overview' }: KidStatCardsProps) => {
    const { data: session } = useSession();
    const [kid, setKid] = useState<KidData | null>(null);
    const [kidChores, setKidChores] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get kid ID from session when available, otherwise use the prop
    const childId = session?.user?.childId || propKidId;

    // If we don't have a valid kid ID, use the user ID (for a kid session)
    const kidId = childId || session?.user?.id;

    // Debug: Log user session info to help with troubleshooting
    useEffect(() => {
        if (session?.user) {
            console.log('KidStatCards - User session info:', {
                userId: session.user.id,
                childId: session.user.childId,
                name: session.user.name,
                childUsername: session.user.childUsername,
                isChild: session.user.isChild,
                role: session.user.role,
                finalKidId: kidId
            });
        }
    }, [session, kidId]);

    useEffect(() => {
        const fetchKidData = async () => {
            if (!session?.user || !kidId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Determine which endpoint to use for chores based on user role
                const choreEndpoint = session.user.isChild
                    ? `${API_ENDPOINTS.LIST_TASKS}?assignedTo=${kidId}`  // Kid viewing their own chores using the working endpoint
                    : API_ENDPOINTS.LIST_TASKS;   // Parent viewing chores

                try {
                    // Fetch the chores data from the API
                    const choresResponse = await fetch(getApiUrl(choreEndpoint), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    });

                    if (!choresResponse.ok) {
                        throw new Error(`Failed to fetch chores: ${choresResponse.status}`);
                    }

                    const choresData = await choresResponse.json();
                    console.log('Raw chores data (KidStatCards):', choresData);

                    // Deep debug: Log the exact format and values of chores from backend
                    console.log('=== DEBUG: BACKEND CHORE FORMAT ===');
                    if (Array.isArray(choresData) && choresData.length > 0) {
                        console.log('First chore raw data:', choresData[0]);
                        console.log('First chore status:', choresData[0]?.status);
                        console.log('All chore statuses:', choresData.map((c: BackendTask) => c?.status));
                    } else if (choresData && typeof choresData === 'object' && Array.isArray(choresData.results) && choresData.results.length > 0) {
                        console.log('First chore raw data:', choresData.results[0]);
                        console.log('First chore status:', choresData.results[0]?.status);
                        console.log('All chore statuses:', choresData.results.map((c: BackendTask) => c?.status));
                    } else {
                        console.log('No chores data available or empty array received');
                    }

                    // Process chores data (handle both array and paginated responses)
                    let tasksArray: BackendTask[] = [];
                    if (Array.isArray(choresData)) {
                        tasksArray = choresData || [];
                    } else if (choresData && typeof choresData === 'object' && Array.isArray(choresData.results)) {
                        tasksArray = choresData.results || [];
                    } else {
                        console.error('Unexpected chores data format:', choresData);
                        // Don't throw an error, just use an empty array
                        console.warn('Using empty array for tasks due to invalid data format');
                    }

                    // Convert to frontend format
                    const transformedChores = transformTasksFromBackend(tasksArray);

                    // For kids using the assignedTo parameter, the API already filters their chores
                    // For parents, we need to filter by kidId
                    const kidChores = session.user.isChild
                        ? transformedChores  // Already filtered by the API using assignedTo parameter
                        : transformedChores.filter(chore => chore.assignedTo === kidId);

                    // Debug: Log chore data to understand what we're getting
                    console.log('KidStatCards - Filtered chores for kid:', {
                        kidId,
                        totalChores: kidChores.length,
                        completedChores: kidChores.filter(c => c.status === 'completed').length,
                        pendingChores: kidChores.filter(c => c.status === 'pending').length,
                        missedChores: kidChores.filter(c => c.status === 'missed').length,
                        allStatuses: kidChores.map(c => c.status),
                        rawStatuses: tasksArray.map(t => t?.status || 'unknown'),
                        statusCheck: tasksArray.map(t => ({
                            rawStatus: t?.status || 'unknown',
                            transformedStatus: t ? transformTaskFromBackend(t).status : 'unknown',
                            rawId: t?.id || 'unknown'
                        })),
                        firstChore: kidChores.length > 0 ? kidChores[0] : null
                    });

                    // Set the kid data from session if available
                    const kidData: KidData = {
                        id: kidId,
                        name: session.user.name || session.user.childUsername,
                        username: session.user.childUsername || session.user.name || 'Unknown',
                    };

                    setKid(kidData);
                    setKidChores(kidChores);

                } catch (apiError) {
                    console.error('API fetch failed:', apiError);
                    setError('Failed to load chore data');
                    setKid({
                        id: kidId || 'unknown',
                        name: session.user.name || 'User',
                        username: session.user.childUsername || session.user.name || 'User'
                    });
                    setKidChores([]);
                }
            } catch (err) {
                console.error('Error fetching kid data:', err);
                setError('Failed to load kid data');
                setKidChores([]);
            } finally {
                setLoading(false);
            }
        };

        fetchKidData();
    }, [kidId, session]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-2 animate-pulse">
                        <CardHeader className="pb-3">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !kid) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-red-200">
                    <CardContent className="p-6">
                        <p className="text-red-600">Error loading data: {error || 'Kid not found'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate chore stats
    const completedChoresCount = kidChores.filter(chore => chore.status === 'completed').length;
    const pendingChoresCount = kidChores.filter(chore => chore.status === 'pending').length;
    const missedChoresCount = kidChores.filter(chore => chore.status === 'missed').length;
    const totalChoresCount = kidChores.length;

    // Calculate earnings
    const totalEarnings = kidChores
        .filter(chore => chore.status === 'completed')
        .reduce((sum, chore) => sum + (parseFloat(chore.reward) || 0), 0);

    // Level calculation based on completed chores
    const currentLevel = Math.min(Math.floor(completedChoresCount / 3) + 1, 10); // Level up every 3 chores

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        });
    };

    // Get stats based on section
    const getStatCards = () => {
        if (section === 'goal-getter') {
            // Placeholder goal data since we're focusing on chores for now
            const activeGoals = 2;
            const completedGoals = 3;
            const totalSaved = 15000;
            const savingsGrowth = 20; // Growth percentage

            return (
                <>
                    {/* Total Saved Card */}
                    <Card className="border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Saved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(totalSaved)}
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                    +{savingsGrowth}%
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Goals Card */}
                    <Card className="border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Goals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Target className="h-8 w-8 text-blue-600" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-gray-900">{activeGoals}</span>
                                    <span className="text-sm text-muted-foreground">Goals set</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Goals Achieved Card */}
                    <Card className="border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Goals Achieved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Trophy className="h-8 w-8 text-yellow-500" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-gray-900">{completedGoals}</span>
                                    <span className="text-sm text-muted-foreground">Achieved goals</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            );
        }
        // Default overview stats - using the values calculated at the component level

        return (
            <>
                {/* Level Progress Card */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-purple-600" />
                            <CardTitle className="text-lg font-bold">Level {currentLevel}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Progress
                                value={((completedChoresCount % 3) / 3) * 100}
                                className="h-3 bg-gray-200"
                            />
                            <p className="text-sm text-muted-foreground">
                                {((currentLevel) * 3) - completedChoresCount > 0
                                    ? `${((currentLevel) * 3) - completedChoresCount} chore${((currentLevel) * 3) - completedChoresCount > 1 ? 's' : ''} more to complete level ${currentLevel + 1}`
                                    : `Level ${currentLevel} complete!`
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Earnings Card */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Earnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold">
                                {formatCurrency(totalEarnings)}
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                +20%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Chore Stats Card */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Achievement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Trophy className="h-6 w-6 text-yellow-500" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-gray-900">{completedChoresCount}</span>
                                        <span className="text-sm text-muted-foreground">Completed</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-semibold text-gray-600">{totalChoresCount}</span>
                                    <span className="text-xs text-muted-foreground">Total</span>
                                </div>
                            </div>

                            {/* <Progress
                                value={completionPercentage}
                                className="h-2 bg-gray-200"
                            /> */}

                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{pendingChoresCount} pending</span>
                                <span>{missedChoresCount} missed</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {getStatCards()}
        </div>
    );
};

export default KidStatCards;
