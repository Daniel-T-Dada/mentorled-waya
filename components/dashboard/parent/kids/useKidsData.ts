import { useState, useEffect } from "react";
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import type { KidWithStats } from './types';

export const useKidsData = () => {
    const [kids, setKids] = useState<Kid[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadKids = () => {
            const allKids = mockDataService.getAllKids();
            setKids(allKids);
            setLoading(false);
        };

        // Simulate loading delay
        const timer = setTimeout(loadKids, 500);
        return () => clearTimeout(timer);
    }, []);

    const getKidStats = (kidId: string) => {
        const completedChores = mockDataService.getChoresByKidAndStatus(kidId, "completed").length;
        const pendingChores = mockDataService.getChoresByKidAndStatus(kidId, "pending").length;
        const progress = mockDataService.getKidProgress(kidId);

        return { completedChores, pendingChores, progress };
    };

    const kidsWithStats: KidWithStats[] = kids.map(kid => ({
        ...kid,
        stats: getKidStats(kid.id)
    }));
    return {
        kids: kidsWithStats,
        loading,
        refetch: () => {
            setLoading(true);
            const timer = setTimeout(() => {
                const allKids = mockDataService.getAllKids();
                setKids(allKids);
                setLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    };
};
