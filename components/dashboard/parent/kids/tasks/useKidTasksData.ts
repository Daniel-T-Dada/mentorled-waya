import { useState, useEffect } from 'react';
import type { TasksData } from './types';
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { transformTasksFromBackend, BackendTask } from '@/lib/utils/taskTransforms';
import { useSession } from 'next-auth/react';

// Define Kid interface directly here instead of importing from mockDataService
export interface Kid {
    id: string;
    name: string;
    username: string;
    avatar?: string | null;
    age?: number;
    created_at?: string;
    parentId?: string;
}

export const useKidTasksData = (kidId: string) => {
    const { data: session } = useSession();
    const [kid, setKid] = useState<Kid | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tasks, setTasks] = useState<TasksData>({
        pending: [],
        completed: [],
        overdue: []
    });

    useEffect(() => {
        const loadKidData = async () => {
            if (!session?.user?.accessToken || !kidId) {
                setLoading(false);
                setError('Authentication or kid ID missing');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // First, get child details from API (for name and other info)
                const childEndpoint = API_ENDPOINTS.CHILD_DETAIL.replace(':childId', kidId);
                const childResponse = await fetch(getApiUrl(childEndpoint), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });

                if (!childResponse.ok) {
                    throw new Error(`Failed to fetch child data: ${childResponse.status}`);
                }

                const childData = await childResponse.json();

                // Create kid object from API response
                const kidData: Kid = {
                    id: childData.id,
                    name: childData.name || childData.username,
                    username: childData.username,
                    avatar: childData.avatar,
                    age: childData.age,
                    parentId: childData.parent
                };

                setKid(kidData);

                // Then get chores data from API
                const choreEndpoint = `${API_ENDPOINTS.CHILD_CHORES}?childId=${kidId}`;
                const choresResponse = await fetch(getApiUrl(choreEndpoint), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });

                if (!choresResponse.ok) {
                    throw new Error(`Failed to fetch chores: ${choresResponse.status}`);
                }

                const choresData = await choresResponse.json();

                // Process chores data (handle both array and paginated responses)
                let tasksArray: BackendTask[];
                if (Array.isArray(choresData)) {
                    tasksArray = choresData;
                } else if (choresData && typeof choresData === 'object' && Array.isArray(choresData.results)) {
                    tasksArray = choresData.results;
                } else {
                    throw new Error('Invalid chores data format');
                }

                // Convert to frontend format
                const transformedChores = transformTasksFromBackend(tasksArray);

                // Separate chores by status
                const now = new Date();
                const allTasks = {
                    pending: transformedChores
                        .filter(task => task.status === 'pending')
                        .filter(task => {
                            if (!task.dueDate) return true; // If no due date, consider it pending
                            const dueDate = new Date(task.dueDate);
                            return dueDate >= now;
                        }),
                    completed: transformedChores.filter(task => task.status === 'completed'),
                    overdue: transformedChores
                        .filter(task => task.status === 'pending')
                        .filter(task => {
                            if (!task.dueDate) return false; // If no due date, can't be overdue
                            const dueDate = new Date(task.dueDate);
                            return dueDate < now;
                        })
                };

                setTasks(allTasks);
            } catch (err) {
                console.error('Error loading kid tasks data:', err);
                setError('Failed to load kid data');
                setKid(null);
            } finally {
                setLoading(false);
            }
        };

        loadKidData();
    }, [kidId, session]);

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
        refetch: async () => {
            if (!session?.user?.accessToken || !kidId) {
                return;
            }

            setLoading(true);

            try {
                // Get child details from API
                const childEndpoint = API_ENDPOINTS.CHILD_DETAIL.replace(':childId', kidId);
                const childResponse = await fetch(getApiUrl(childEndpoint), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });

                if (!childResponse.ok) {
                    throw new Error(`Failed to fetch child data: ${childResponse.status}`);
                }

                const childData = await childResponse.json();

                // Create kid object from API response
                const kidData: Kid = {
                    id: childData.id,
                    name: childData.name || childData.username,
                    username: childData.username,
                    avatar: childData.avatar,
                    age: childData.age,
                    parentId: childData.parent
                };

                setKid(kidData);

                // Then get chores data from API
                const choreEndpoint = `${API_ENDPOINTS.CHILD_CHORES}?childId=${kidId}`;
                const choresResponse = await fetch(getApiUrl(choreEndpoint), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });

                if (!choresResponse.ok) {
                    throw new Error(`Failed to fetch chores: ${choresResponse.status}`);
                }

                const choresData = await choresResponse.json();

                // Process chores data
                let tasksArray: BackendTask[];
                if (Array.isArray(choresData)) {
                    tasksArray = choresData;
                } else if (choresData && typeof choresData === 'object' && Array.isArray(choresData.results)) {
                    tasksArray = choresData.results;
                } else {
                    throw new Error('Invalid chores data format');
                }

                // Convert to frontend format
                const transformedChores = transformTasksFromBackend(tasksArray);

                // Separate chores by status
                const now = new Date();
                setTasks({
                    pending: transformedChores
                        .filter(task => task.status === 'pending')
                        .filter(task => {
                            if (!task.dueDate) return true;
                            const dueDate = new Date(task.dueDate);
                            return dueDate >= now;
                        }),
                    completed: transformedChores.filter(task => task.status === 'completed'),
                    overdue: transformedChores
                        .filter(task => task.status === 'pending')
                        .filter(task => {
                            if (!task.dueDate) return false;
                            const dueDate = new Date(task.dueDate);
                            return dueDate < now;
                        })
                });
            } catch (err) {
                console.error('Error refetching kid tasks data:', err);
                setError('Failed to reload task data');
            } finally {
                setLoading(false);
            }
        }
    };
};
