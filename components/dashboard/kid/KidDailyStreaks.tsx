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

    const completedDaysCount = weeklyProgress.filter(day => day.completed).length

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Daily Streaks Skeleton */}
                <Card className="h-fit">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-5 h-5" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-4 w-80" />
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Weekly Calendar Skeleton */}
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                <div key={day} className="flex flex-col items-center gap-2">
                                    <Skeleton className="h-3 w-6" />
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                </div>
                            ))}
                        </div>

                        {/* Streak Badge Skeleton */}
                        <div className="text-center">
                            <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                        </div>
                    </CardContent>
                </Card>

                {/* Redeem Rewards Skeleton */}
                <Card className="h-fit">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-5 h-5" />
                            <Skeleton className="h-6 w-36" />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((reward) => (
                            <div
                                key={reward}
                                className="flex items-start justify-between p-4 rounded-lg border bg-card"
                            >
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-60" />
                                </div>
                                <Skeleton className="ml-4 h-8 w-20" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Card className="h-fit">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center">
                            <div className="text-sm text-destructive">{error}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Daily Streaks Section */}
            <Card className="h-fit">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-lg font-semibold">Daily Streaks</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Complete today's quiz to keep your streak and earn a mystery reward!
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Weekly Calendar */}
                    <div className="flex justify-between gap-2">
                        {weeklyProgress.map((day, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <span className="text-xs text-muted-foreground font-medium">
                                    {day.day}
                                </span>
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2
                                    ${day.completed
                                        ? 'bg-primary border-primary border-solid text-primary-foreground'
                                        : 'bg-transparent border-muted-foreground border-dashed text-muted-foreground'
                                    }
                                `}>
                                    {day.completed ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Streak Badge */}
                    <div className="text-center">
                        <Badge variant="secondary" className="px-3 py-1">
                            {completedDaysCount} day streak!
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Redeem Rewards Section */}
            <Card className="h-fit">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold">Redeem Rewards</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {rewards.map((reward) => (
                        <div
                            key={reward.id}
                            className="flex items-start justify-between p-4 rounded-lg border bg-card"
                        >
                            <div className="flex-1">
                                <h4 className="font-medium text-base mb-1">
                                    {reward.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {reward.description}
                                </p>
                            </div>
                            <Button
                                onClick={() => handleRedeem(reward.id)}
                                disabled={reward.isRedeemed}
                                className="ml-4 bg-primary hover:bg-secondary text-primary-foreground min-w-[80px]"
                                size="sm"
                            >
                                {reward.isRedeemed ? 'Redeemed' : 'Redeem'}
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

export default KidDailyStreaks