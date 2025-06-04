import { useState, useEffect, useCallback } from 'react';
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import type { ProgressData } from './types';

export const useKidProgressData = (kidId: string) => {
    const [kid, setKid] = useState<Kid | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progressData, setProgressData] = useState<ProgressData>({
        weeklyProgress: [],
        categoryStats: [],
        streaks: {
            current: 0,
            longest: 0
        },
        recentAchievements: []
    });
    const fetchProgressData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const timer = setTimeout(() => {
                const kidData = mockDataService.getKidById(kidId);
                if (kidData) {
                    setKid(kidData);

                    // Generate mock progress data
                    const weeklyProgress = [
                        { week: 'Week 1', completed: 8, assigned: 10 },
                        { week: 'Week 2', completed: 7, assigned: 9 },
                        { week: 'Week 3', completed: 9, assigned: 10 },
                        { week: 'Week 4', completed: 10, assigned: 12 }
                    ];

                    const categoryStats = [
                        { category: 'Household', completed: 15, total: 18 },
                        { category: 'Personal Care', completed: 12, total: 14 },
                        { category: 'School', completed: 8, total: 10 },
                        { category: 'Outdoor', completed: 5, total: 6 }
                    ];

                    const recentAchievements = [
                        { title: 'Week Warrior', date: '2024-01-08', type: 'weekly' as const },
                        { title: 'Clean Streak', date: '2024-01-05', type: 'streak' as const },
                        { title: 'Early Bird', date: '2024-01-03', type: 'special' as const },
                        { title: 'Helper Hero', date: '2024-01-01', type: 'milestone' as const }
                    ];

                    setProgressData({
                        weeklyProgress,
                        categoryStats,
                        streaks: { current: 5, longest: 12 },
                        recentAchievements
                    });
                } else {
                    setError('Kid not found');
                }
                setIsLoading(false);
            }, 500); return () => clearTimeout(timer);
        } catch (error) {
            console.error('Error fetching progress data:', error);
            setError('Failed to load progress data');
            setIsLoading(false);
        }
    }, [kidId]);
    useEffect(() => {
        fetchProgressData();
    }, [kidId, fetchProgressData]);

    // Calculate completion stats
    const completedTasks = kid ? mockDataService.getChoresByKidAndStatus(kidId, 'completed').length : 0;
    const totalTasks = kid ? mockDataService.getChoresByKid(kidId).length : 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
        kid,
        isLoading,
        error,
        progressData,
        completedTasks,
        totalTasks,
        completionRate,
        refetch: fetchProgressData
    };
};
