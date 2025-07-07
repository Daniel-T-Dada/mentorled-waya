import { useState, useEffect } from 'react';
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import type { TasksData } from './types';

export const useKidTasksData = (kidId: string) => {
    const [kid, setKid] = useState<Kid | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tasks, setTasks] = useState<TasksData>({
        pending: [],
        completed: [],
        overdue: []
    });

    useEffect(() => {
        const loadKidData = () => {
            try {
                const timer = setTimeout(() => {
                    const kidData = mockDataService.getKidById(kidId);

                    if (!kidData) {
                        setError('Kid not found');
                        setKid(null);
                    } else {
                        setKid(kidData);
                        setError(null);

                        const now = new Date();
                        setTasks({
                            pending: mockDataService.getChoresByKidAndStatus(kidId, 'pending').filter(task => {
                                if (!task.dueDate) return true; // If no due date, consider it pending
                                const dueDate = new Date(task.dueDate);
                                return dueDate >= now;
                            }),
                            completed: mockDataService.getChoresByKidAndStatus(kidId, 'completed'),
                            overdue: mockDataService.getChoresByKidAndStatus(kidId, 'pending').filter(task => {
                                if (!task.dueDate) return false; // If no due date, can't be overdue
                                const dueDate = new Date(task.dueDate);
                                return dueDate < now;
                            })
                        });
                    }
                    setLoading(false);
                }, 500);

                return () => clearTimeout(timer);
            } catch {
                setError('Failed to load kid data');
                setKid(null);
                setLoading(false);
            }
        };

        loadKidData();
    }, [kidId]);

    const getTaskStats = () => {
        const totalTasks = tasks.pending.length + tasks.completed.length + tasks.overdue.length;
        const completedCount = tasks.completed.length;
        const pendingCount = tasks.pending.length;
        const overdueCount = tasks.overdue.length;
        const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

        return {
            totalTasks,
            completedCount,
            pendingCount,
            overdueCount,
            completionRate
        };
    };

    return {
        kid,
        loading,
        error,
        tasks,
        stats: getTaskStats(),
        refetch: () => {
            setLoading(true);
            if (kidId) {
                const kidData = mockDataService.getKidById(kidId);
                setKid(kidData || null);

                if (kidData) {
                    const now = new Date();
                    setTasks({
                        pending: mockDataService.getChoresByKidAndStatus(kidId, 'pending').filter(task => {
                            if (!task.dueDate) return true;
                            const dueDate = new Date(task.dueDate);
                            return dueDate >= now;
                        }),
                        completed: mockDataService.getChoresByKidAndStatus(kidId, 'completed'),
                        overdue: mockDataService.getChoresByKidAndStatus(kidId, 'pending').filter(task => {
                            if (!task.dueDate) return false;
                            const dueDate = new Date(task.dueDate);
                            return dueDate < now;
                        })
                    });
                }

                setLoading(false);
            }
        }
    };
};
