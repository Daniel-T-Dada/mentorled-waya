'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Flame, Gift, CheckCircle } from "lucide-react"
import { useState } from "react"

interface DayStatus {
    day: string
    completed: boolean
}

interface RewardResult {
    id: number;
    child: string;
    reward: {
        id: number;
        concept: string;
        name: string;
        description: string;
        image: string | null;
        points_required: number;
    };
    earned_on: string | null;
}

interface KidDailyStreaksProps {
    kidId?: string
    weeklyStreak?: {
        week_start_date: string
        streak: {
            mon: boolean
            tue: boolean
            wed: boolean
            thu: boolean
            fri: boolean
            sat: boolean
            sun: boolean
        }
    }
    rewards?: RewardResult[];
}

const DAY_ORDER = [
    { api: "mon", label: "Mon" },
    { api: "tue", label: "Tue" },
    { api: "wed", label: "Wed" },
    { api: "thu", label: "Thu" },
    { api: "fri", label: "Fri" },
    { api: "sat", label: "Sat" },
    { api: "sun", label: "Sun" },
];

const KidDailyStreaks = ({ weeklyStreak, rewards = [] }: KidDailyStreaksProps) => {
    // Track redeemed reward ids locally. This should be replaced by backend status when available.
    const [redeemedIds, setRedeemedIds] = useState<number[]>([]);

    const handleRedeem = (rewardId: number) => {
        // TODO: Call backend to redeem, then update UI on success
        setRedeemedIds(prev => [...prev, rewardId]);
    };

    // Map API data to DayStatus[]
    let weeklyProgress: DayStatus[] = [];
    if (weeklyStreak?.streak) {
        weeklyProgress = DAY_ORDER.map(day => ({
            day: day.label,
            completed: weeklyStreak.streak[day.api as keyof typeof weeklyStreak.streak]
        }));
    }

    const completedDaysCount = weeklyProgress.filter(day => day.completed).length;

    if (!weeklyStreak) {
        return (
            <div className="space-y-4 sm:space-y-6">
                {/* Daily Streaks Skeleton */}
                <Card className="h-fit">
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
                        </div>
                        <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-sm mt-2" />
                    </CardHeader>

                    <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                        {/* Weekly Calendar Skeleton */}
                        <div className="flex justify-between gap-1 sm:gap-2 md:gap-3">
                            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                <div key={day} className="flex flex-col items-center gap-1 sm:gap-2 flex-1">
                                    <Skeleton className="h-2 sm:h-3 w-6 sm:w-8" />
                                    <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full" />
                                </div>
                            ))}
                        </div>

                        {/* Streak Badge Skeleton */}
                        <div className="text-center pt-2">
                            <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 rounded-full mx-auto" />
                        </div>
                    </CardContent>
                </Card>

                {/* Redeem Rewards Skeleton */}
                <Card className="h-fit">
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <Skeleton className="h-5 sm:h-6 w-28 sm:w-36" />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                        {[1, 2, 3].map((reward) => (
                            <div
                                key={reward}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card"
                            >
                                <div className="flex-1 space-y-1 sm:space-y-2">
                                    <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
                                    <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-md" />
                                </div>
                                <Skeleton className="w-full sm:w-20 h-8 rounded" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Daily Streaks Section */}
            <Card className="h-fit">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0" />
                        <CardTitle className="text-base sm:text-lg font-semibold truncate">Daily Streaks</CardTitle>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Complete today&apos;s quiz to keep your streak and earn a mystery reward!
                    </p>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    {/* Weekly Calendar */}
                    <div className="flex justify-between gap-1 sm:gap-2 md:gap-3">
                        {weeklyProgress.map((day, index) => (
                            <div key={index} className="flex flex-col items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate w-full text-center">
                                    {day.day}
                                </span>
                                <div className={`
                                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200
                                    ${day.completed
                                        ? 'bg-primary border-primary border-solid text-primary-foreground shadow-sm hover:shadow-md'
                                        : 'bg-transparent border-muted-foreground border-dashed text-muted-foreground hover:border-primary/50'
                                    }
                                `}>
                                    {day.completed ? (
                                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Streak Badge */}
                    <div className="text-center pt-2">
                        <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm font-medium">
                            {completedDaysCount} day streak!
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Redeem Rewards Section */}
            <Card className="h-fit">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        <CardTitle className="text-base sm:text-lg font-semibold truncate">Redeem Rewards</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    {rewards.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                            {rewards.map((item) => {
                                const isRedeemed = redeemedIds.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card transition-all duration-200 hover:shadow-sm"
                                    >
                                        <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                                            <h4 className="font-medium text-sm sm:text-base leading-tight">
                                                {item.reward.name}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                                {item.reward.description}
                                            </p>
                                            {item.earned_on && (
                                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                    Earned on: {new Date(item.earned_on).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 self-start sm:self-center">
                                            <Button
                                                onClick={() => handleRedeem(item.id)}
                                                disabled={!item.earned_on || isRedeemed}
                                                className="w-full sm:w-auto bg-primary hover:bg-secondary text-primary-foreground min-w-[80px] text-xs sm:text-sm"
                                                size="sm"
                                            >
                                                {isRedeemed ? 'Redeemed' : 'Redeem'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 sm:py-8">
                            <Gift className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-3" />
                            <p className="text-sm sm:text-base text-muted-foreground">
                                No rewards available at the moment
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Complete more chores to unlock rewards!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default KidDailyStreaks