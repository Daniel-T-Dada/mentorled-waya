'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target } from "lucide-react";
import { memo } from "react";

interface KidStatCardsProps {
    kidId?: string;
    section?: 'overview' | 'chore' | 'money-maze' | 'goal-getter' | 'earning-meter';
}

const KidStatCards = memo<KidStatCardsProps>(({ section = 'overview' }) => {
    // Hardcoded kid and chores data
    // ...existing code...
    const kidChores = [
        { id: 'c1', title: 'Sweep the living room', status: 'completed', reward: 500 },
        { id: 'c2', title: 'Do homework', status: 'completed', reward: 700 },
        { id: 'c3', title: 'Take out trash', status: 'pending', reward: 0 },
        { id: 'c4', title: 'Wash dishes', status: 'completed', reward: 600 },
        { id: 'c5', title: 'Feed the dog', status: 'completed', reward: 400 },
    ];
    // Hardcoded goals data
    const goals = [
        { id: 'g1', title: 'Buy a book', status: 'active', currentAmount: 1200 },
        { id: 'g2', title: 'New shoes', status: 'completed', currentAmount: 3000 },
        { id: 'g3', title: 'School bag', status: 'active', currentAmount: 800 },
    ];

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
            // Use hardcoded goals data
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
});

KidStatCards.displayName = 'KidStatCards';

export default KidStatCards;
