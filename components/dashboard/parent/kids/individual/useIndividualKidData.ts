import { useState, useEffect } from "react";
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import type { IndividualKidStats } from './types';

export const useIndividualKidData = (kidId: string) => {
    const [kid, setKid] = useState<Kid | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadKidData = () => {
            try {
                const kidData = mockDataService.getKidById(kidId);
                if (!kidData) {
                    setError('Kid not found');
                    setKid(null);
                } else {
                    setKid(kidData);
                    setError(null);
                }
            } catch {
                setError('Failed to load kid data');
                setKid(null);
            } finally {
                setLoading(false);
            }
        };

        if (kidId) {
            loadKidData();
        }
    }, [kidId]);

    const getKidStats = (): IndividualKidStats => {
        if (!kidId) {
            return { completedChores: 0, pendingChores: 0, progress: 0 };
        }

        const completedChores = mockDataService.getChoresByKidAndStatus(kidId, "completed").length;
        const pendingChores = mockDataService.getChoresByKidAndStatus(kidId, "pending").length;
        const progress = mockDataService.getKidProgress(kidId);

        return { completedChores, pendingChores, progress };
    };

    return {
        kid,
        loading,
        error,
        stats: getKidStats(), refetch: () => {
            setLoading(true);
            if (kidId) {
                const kidData = mockDataService.getKidById(kidId);
                setKid(kidData || null);
                setLoading(false);
            }
        }
    };
};
