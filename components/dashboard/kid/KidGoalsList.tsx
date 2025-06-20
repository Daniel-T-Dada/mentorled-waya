'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Calendar, Edit, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { MockApiService } from "@/lib/services/mockApiService";
import { Goal, Achievement, mockDataService } from "@/lib/services/mockDataService";

interface KidGoalsListProps {
    kidId?: string;
}

// Utility functions
const calculateProgress = (currentAmount: number, targetAmount: number): number => {
    if (targetAmount === 0) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
};

const getDaysLeft = (deadline: string): string => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
};

const getProgressColor = (progress: number): string => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
};

const KidGoalsList = ({ kidId: propKidId }: KidGoalsListProps) => {
    const { data: session } = useSession();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("goals");

    const sessionKidId = session?.user?.id;
    const validKidIds = ['kid-001', 'kid-002', 'kid-003', 'kid-004'];

    let kidId = propKidId || "kid-001";

    // If we have a session kid ID, check if it's valid, otherwise use fallback
    if (sessionKidId && validKidIds.includes(sessionKidId)) {
        kidId = sessionKidId;
    }

    useEffect(() => {
        const fetchGoalData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try to fetch from API first
                try {
                    const [goalsData, achievementsData] = await Promise.all([
                        MockApiService.fetchGoalsByKidId(kidId),
                        MockApiService.fetchAchievementsByKidId(kidId)
                    ]);
                    setGoals(goalsData);
                    setAchievements(achievementsData);
                } catch (apiError) {
                    console.log('API fetch failed, falling back to direct mock data service:', apiError);

                    // Fallback to direct mock data service
                    const goalsData = mockDataService.getGoalsByKidId(kidId);
                    const achievementsData = mockDataService.getAchievementsByKidId(kidId);
                    setGoals(goalsData);
                    setAchievements(achievementsData);
                }
            } catch (err) {
                console.error('Error fetching goal data:', err);
                setError('Failed to load goal data');
                setGoals([]);
                setAchievements([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGoalData();
    }, [kidId]);

    const handleEditGoal = (goalId: string) => {
        console.log('Edit goal:', goalId);
    };

    const handleDeleteGoal = (goalId: string) => {
        console.log('Delete goal:', goalId);
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
    };

    const formatCurrency = (amount: number) => {
        return `NGN ${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center py-8">
                        <p>Loading goals and achievements...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center py-8">
                        <p className="text-red-500">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 w-full mb-6">
                        <TabsTrigger value="goals" className="text-sm">
                            My Goals
                        </TabsTrigger>
                        <TabsTrigger value="achievements" className="text-sm">
                            Achievement
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="goals" className="mt-0 space-y-4">
                        <div className="space-y-4">
                            {goals.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <p className="font-medium">No goals set yet</p>
                                    <p className="text-sm">Create your first savings goal to get started!</p>
                                </div>
                            ) : (
                                goals.map((goal) => (
                                    <div key={goal.id} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                                                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${calculateProgress(goal.currentAmount, goal.targetAmount) >= 60 ? 'bg-green-100 text-green-600' :
                                                            calculateProgress(goal.currentAmount, goal.targetAmount) >= 30 ? 'bg-yellow-100 text-yellow-600' :
                                                                'bg-red-100 text-red-600'
                                                        }`}>
                                                        {Math.round(calculateProgress(goal.currentAmount, goal.targetAmount))}%
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {goal.description}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditGoal(goal.id)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${getProgressColor(calculateProgress(goal.currentAmount, goal.targetAmount))}`}
                                                style={{ width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{getDaysLeft(goal.deadline)}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="achievements" className="mt-0 space-y-4">
                        <div className="space-y-4">
                            {achievements.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <p className="font-medium">No achievements yet</p>
                                    <p className="text-sm">Complete goals to unlock achievements!</p>
                                </div>
                            ) : (
                                achievements.map((achievement) => (
                                    <div key={achievement.id} className="border rounded-lg p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <Trophy className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{achievement.title}</h3>
                                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                            </div>
                                            <div className="text-right text-sm text-muted-foreground">
                                                <div>Earned</div>
                                                <div>{new Date(achievement.unlockedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default KidGoalsList;
