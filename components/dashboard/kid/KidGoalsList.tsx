'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Trophy, Calendar, Edit, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

// Define interfaces locally instead of importing from mock services
interface Goal {
    id: string;
    kidId: string;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: string;
    status: 'active' | 'completed' | 'paused';
    createdAt: string;
}

interface Achievement {
    id: string;
    kidId: string;
    title: string;
    description: string;
    category: string;
    dateEarned: string;
    points: number;
    badge: string;
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

const KidGoalsList = () => {
    const { data: session } = useSession();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("goals");

    useEffect(() => {
        const fetchGoalData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use placeholder data instead of mock API
                const placeholderGoals: Goal[] = [
                    {
                        id: 'goal-1',
                        kidId: session?.user?.id || 'kid-1',
                        title: 'Save for a New Bike',
                        description: 'Save money to buy a cool new bicycle',
                        targetAmount: 20000,
                        currentAmount: 12000,
                        deadline: '2024-12-31',
                        category: 'savings',
                        status: 'active',
                        createdAt: '2024-01-01'
                    },
                    {
                        id: 'goal-2',
                        kidId: session?.user?.id || 'kid-1',
                        title: 'Video Game Fund',
                        description: 'Save for the latest video game',
                        targetAmount: 15000,
                        currentAmount: 8000,
                        deadline: '2024-11-30',
                        category: 'entertainment',
                        status: 'active',
                        createdAt: '2024-02-01'
                    }
                ];

                const placeholderAchievements: Achievement[] = [
                    {
                        id: 'achievement-1',
                        kidId: session?.user?.id || 'kid-1',
                        title: 'First Goal Completed',
                        description: 'Successfully completed your first savings goal',
                        category: 'milestone',
                        dateEarned: '2024-01-15',
                        points: 100,
                        badge: '🏆'
                    },
                    {
                        id: 'achievement-2',
                        kidId: session?.user?.id || 'kid-1',
                        title: 'Consistent Saver',
                        description: 'Saved money for 7 days in a row',
                        category: 'streak',
                        dateEarned: '2024-02-01',
                        points: 50,
                        badge: '🔥'
                    }
                ];

                setGoals(placeholderGoals);
                setAchievements(placeholderAchievements);

            } catch (err) {
                console.error('Error setting up placeholder data:', err);
                setError('Failed to load goal data');
                setGoals([]);
                setAchievements([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGoalData();
    }, [session?.user?.id]);

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
                                                <div>{new Date(achievement.dateEarned).toLocaleDateString()}</div>
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
