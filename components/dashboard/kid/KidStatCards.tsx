'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target } from "lucide-react";
import { memo } from "react";
import { formatNaira } from "@/lib/utils/currency";

interface KidStatCardsProps {
    kidId?: string;
    section?: 'overview' | 'chore' | 'money-maze' | 'goal-getter' | 'earning-meter';
    totals?: {
        total_earned: string;
        total_saved: string;
        total_spent: string;
    };
    summary?: {
        totalSaved: string;
        activeGoals: number;
        achievedGoals: number;
    };
}

const KidStatCards = memo<KidStatCardsProps>(({ section = 'overview', totals, summary }) => {
    // Hardcoded kid and chores data for other cards
    const kidChores = [
        { id: 'c1', title: 'Sweep the living room', status: 'completed', reward: 500 },
        { id: 'c2', title: 'Do homework', status: 'completed', reward: 700 },
        { id: 'c3', title: 'Take out trash', status: 'pending', reward: 0 },
        { id: 'c4', title: 'Wash dishes', status: 'completed', reward: 600 },
        { id: 'c5', title: 'Feed the dog', status: 'completed', reward: 400 },
    ];

    // Calculate stats for static cards
    const completedChores = kidChores.filter(chore => chore.status === 'completed').length;

    // Mock level calculation (based on completed chores)
    const currentLevel = Math.min(Math.floor(completedChores / 3) + 1, 10); // Level up every 3 chores
    const choresNeededForNextLevel = ((currentLevel) * 3) - completedChores;
    const progressToNextLevel = ((completedChores % 3) / 3) * 100;

    const getStatCards = () => {
        if (section === 'goal-getter' && summary) {
            const totalSaved = Number(summary.totalSaved || 0);
            const activeGoals = summary.activeGoals ?? 0;
            const achievedGoals = summary.achievedGoals ?? 0;
            const savingsGrowth = 20; // Placeholder, or calculate if possible

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
                                    {formatNaira(totalSaved)}
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
                                    <span className="text-3xl font-bold text-gray-900">{achievedGoals}</span>
                                    <span className="text-sm text-muted-foreground">Achieved goals</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            );
        }

        if (section === 'earning-meter' && totals) {
            return (
                <>
                    {/* Total Earned Card */}
                    <Card className="border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Amount Earned
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatNaira(totals.total_earned)}
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <Zap className="w-4 h-4 mr-1 inline" />
                                    Earned
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Saved Card */}
                    <Card className="border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Amount Saved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatNaira(totals.total_saved)}
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                    <Trophy className="w-4 h-4 mr-1 inline" />
                                    Saved
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Spent Card */}
                    <Card className="border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Amount Spent
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-red-600">
                                    {formatNaira(totals.total_spent)}
                                </div>
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                    Spent
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </>
            );
        }

        // Default overview stats (existing logic except for Total Achievement card)
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
                            <div className="text-2xl font-bold text-green-600">
                                {formatNaira(totals && totals.total_earned ? totals.total_earned : 0)}
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                +20%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Achievement Card  */}
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
                                <span className="text-3xl font-bold text-gray-900">
                                    {summary?.achievedGoals ?? 0}
                                </span>
                                <span className="text-sm text-muted-foreground">Achieved goals</span>
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
});

KidStatCards.displayName = 'KidStatCards';

export default KidStatCards;