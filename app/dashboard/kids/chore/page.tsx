'use client'

import KidChoreQuest from "@/components/dashboard/kid/KidChoreQuest";
import { useApiQuery } from '@/hooks/useApiQuery';
import { API_ENDPOINTS, getApiUrl } from '@/lib/utils/api';
import { useMutation } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useState } from 'react';

const ChoreQuestPage = () => {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const { data, isLoading, error, refetch } = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.CHILD_CHORES + '?page=1'),
        queryKey: ['child-chores'],
        enabled: true,
        refetchInterval: 5000,
    });
    const [loadingChores, setLoadingChores] = useState<{ [key: string]: boolean }>({});

    // Mutation for updating chore status
    const mutation = useMutation({
        mutationFn: async ({ choreId }: { choreId: string }) => {
            setLoadingChores((prev) => ({ ...prev, [choreId]: true }));
            const res = await fetch(getApiUrl(API_ENDPOINTS.CHILD_CHORE_COMPLETE), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chore_id: choreId }),
            });
            if (!res.ok) throw new Error('Failed to update chore status');
            return res.json();
        },
        onSuccess: () => {
            refetch();
        },
        onSettled: (_, __, { choreId }) => {
            setLoadingChores((prev) => ({ ...prev, [choreId]: false }));
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data: {error.message}</div>;

    const chores = Array.isArray(data?.results)
        ? data.results.map((chore: any) => ({
            id: chore.id,
            title: chore.title,
            description: chore.description,
            status: chore.status,
            reward: chore.reward?.toString() ?? "",
            kidName: chore.child_name,
            completedAt: chore.completed_at,
            dueDate: chore.due_date,
            assignedTo: chore.assigned_to,
            createdAt: chore.created_at,
            loading: loadingChores[chore.id] || false,
        }))
        : [];

    // Handler passed to child
    const handleStatusChange = (choreId: string) => {
        if (loadingChores[choreId]) return; // Prevent multiple clicks
        mutation.mutate({ choreId });
    };

    return (
        <div>
            <KidChoreQuest
                chores={chores}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
};

export default ChoreQuestPage;