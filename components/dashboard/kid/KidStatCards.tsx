'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target } from "lucide-react";
import { useSession } from "next-auth/react";
import { MockApiService } from "@/lib/services/mockApiService";
import { mockDataService } from "@/lib/services/mockDataService";
import { useState, useEffect } from "react";

interface KidStatCardsProps {
    kidId?: string;
    section?: 'overview' | 'chore' | 'money-maze' | 'goal-getter' | 'earning-meter';
}

const KidStatCards = ({ kidId: propKidId, section = 'overview' }: KidStatCardsProps) => {
    const { data: session } = useSession();
    const [kid, setKid] = useState<any>(null);
    const [kidChores, setKidChores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get kid data - prioritize prop, then session, then fallback
    // Ensure we use a valid kidId that exists in our mock data
    const sessionKidId = session?.user?.id;
    const validKidIds = ['kid-001', 'kid-002', 'kid-003', 'kid-004'];

    let kidId = propKidId || "kid-001";

    // If we have a session kid ID, check if it's valid, otherwise use fallback
    if (sessionKidId && validKidIds.includes(sessionKidId)) {
        kidId = sessionKidId;
    } else if (sessionKidId && !propKidId) {
        console.log(`KidStatCards - Session kidId "${sessionKidId}" not found in mock data, using fallback: kid-001`);
    }

    useEffect(() => {
        const fetchKidData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try to fetch from API first
                try {
                    const [kidData, choresData] = await Promise.all([
                        MockApiService.fetchKidById(kidId),
                        MockApiService.fetchChoresByKidId(kidId)
                    ]);

                    setKid(kidData);
                    setKidChores(choresData);
                } catch (apiError) {
                    console.log('API fetch failed, falling back to direct mock data service:', apiError);

                    // Fallback to direct mock data service
                    const kidData = mockDataService.getKidById(kidId) || mockDataService.getParent().children[0];
                    const choresData = mockDataService.getChoresByKidId(kidData.id);

                    setKid(kidData);
                    setKidChores(choresData);
                }
            } catch (err) {
                console.error('Error fetching kid data:', err);
                setError('Failed to load kid data');

                // Last resort fallback
                const fallbackKid = mockDataService.getParent().children[0];
                setKid(fallbackKid);
                setKidChores([]);
            } finally {
                setLoading(false);
            }
        };

        fetchKidData();
    }, [kidId]);

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

    // Calculate stats
    const completedChores = kidChores.filter(chore => chore.status === 'completed').length;
    const totalEarnings = kidChores
        .filter(chore => chore.status === 'completed')
        .reduce((sum, chore) => sum + chore.reward, 0);

    // Mock level calculation (based on completed chores)
    const currentLevel = Math.min(Math.floor(completedChores / 3) + 1, 10); // Level up every 3 chores
    const choresNeededForNextLevel = ((currentLevel) * 3) - completedChores;
    const progressToNextLevel = ((completedChores % 3) / 3) * 100; const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        });
    };

    // Get stats based on section
    const getStatCards = () => {
        if (section === 'goal-getter') {
            // Mock goal data - in a real app, this would be fetched
            const goals = mockDataService.getGoalsByKidId(kidId);
            const activeGoals = goals.filter(goal => goal.status === "active").length;
            const completedGoals = goals.filter(goal => goal.status === "completed").length;
            const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
            const savingsGrowth = 20; // Mock growth percentage

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
        }        // Default overview stats (existing logic)
        // Calculate stats
        const completedChores = kidChores.filter(chore => chore.status === 'completed').length;

        // Mock level calculation (based on completed chores)
        const currentLevel = Math.min(Math.floor(completedChores / 3) + 1, 10); // Level up every 3 chores

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
                                value={progressToNextLevel}
                                className="h-3 bg-gray-200"
                            />
                            <p className="text-sm text-muted-foreground">
                                {choresNeededForNextLevel > 0
                                    ? `${choresNeededForNextLevel} chore${choresNeededForNextLevel > 1 ? 's' : ''} more to complete level ${currentLevel + 1}`
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

                {/* Total Achievement Card */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Achievement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Trophy className="h-8 w-8 text-yellow-500" />
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-gray-900">{completedChores}</span>
                                <span className="text-sm text-muted-foreground">Chore Completed</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </>
        );
    }; return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {getStatCards()}
        </div>
    );
};

export default KidStatCards;
