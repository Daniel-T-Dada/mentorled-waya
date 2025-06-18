'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Flame, Gift, CheckCircle } from "lucide-react"
import { MockApiService } from '@/lib/services/mockApiService'

interface DayStatus {
    day: string
    completed: boolean
}

interface RewardItem {
    id: string
    title: string
    description: string
    isRedeemed: boolean
}

interface KidDailyStreaksProps {
    kidId?: string
}

const KidDailyStreaks = ({ kidId = 'kid-001' }: KidDailyStreaksProps) => {
    const [weeklyProgress, setWeeklyProgress] = useState<DayStatus[]>([])
    const [rewards, setRewards] = useState<RewardItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Always use the prop kidId or fallback to 'kid-001' to ensure we use valid mock data
    const validKidId = kidId || 'kid-001';

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                console.log('Fetching data for kidId:', validKidId); // Debug log

                // Fetch daily streaks data
                const dailyStreaksData = await MockApiService.fetchDailyStreaksByKidId(validKidId)
                console.log('Daily streaks data received:', dailyStreaksData); // Debug log
                setWeeklyProgress(dailyStreaksData.weeklyProgress || [])

                // Fetch rewards data
                const rewardsData = await MockApiService.fetchRewardsByKidId(validKidId)
                console.log('Rewards data received:', rewardsData); // Debug log
                setRewards(rewardsData || [])

            } catch (err) {
                console.error('Error fetching kid daily streaks data:', err)
                setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`)

                // Fallback to default data if API fails
                console.log('Using fallback data due to error')
                setWeeklyProgress([
                    { day: 'Mon', completed: true },
                    { day: 'Tue', completed: true },
                    { day: 'Wed', completed: true },
                    { day: 'Thu', completed: false },
                    { day: 'Fri', completed: false },
                    { day: 'Sat', completed: false },
                    { day: 'Sun', completed: false },
                ])
                setRewards([
                    {
                        id: '1',
                        title: 'Clean your room',
                        description: 'Make your bed, organize your wardrobe, clothes and toys',
                        isRedeemed: false
                    },
                    {
                        id: '2',
                        title: 'Take out the trash',
                        description: 'Empty all the trash can in the house.',
                        isRedeemed: false
                    },
                    {
                        id: '3',
                        title: 'Wash the dishes',
                        description: 'Wash all the dishes in the kitchen and put them away.',
                        isRedeemed: false
                    }
                ])
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [validKidId])

    const handleRedeem = async (rewardId: string) => {
        try {
            await MockApiService.updateRewardRedemption(validKidId, rewardId, true)
            setRewards(prev => prev.map(reward =>
                reward.id === rewardId
                    ? { ...reward, isRedeemed: true }
                    : reward
            ))
        } catch (err) {
            console.error('Error redeeming reward:', err)
            // Fallback to local state update if API fails
            setRewards(prev => prev.map(reward =>
                reward.id === rewardId
                    ? { ...reward, isRedeemed: true }
                    : reward
            ))
        }
    }

    const completedDaysCount = weeklyProgress.filter(day => day.completed).length;

    if (isLoading) {
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
    } if (error) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <Card className="h-fit">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
                            <div className="text-xs sm:text-sm text-destructive leading-relaxed max-w-sm">
                                {error}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Please try refreshing the page
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    } return (
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
            </Card>            {/* Redeem Rewards Section */}
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
                            {rewards.map((reward) => (
                                <div
                                    key={reward.id}
                                    className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card transition-all duration-200 hover:shadow-sm"
                                >
                                    <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                                        <h4 className="font-medium text-sm sm:text-base leading-tight">
                                            {reward.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            {reward.description}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 self-start sm:self-center">
                                        <Button
                                            onClick={() => handleRedeem(reward.id)}
                                            disabled={reward.isRedeemed}
                                            className="w-full sm:w-auto bg-primary hover:bg-secondary text-primary-foreground min-w-[80px] text-xs sm:text-sm"
                                            size="sm"
                                        >
                                            {reward.isRedeemed ? 'Redeemed' : 'Redeem'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
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