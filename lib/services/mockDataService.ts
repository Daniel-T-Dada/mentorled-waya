import mockData from '@/mockdata/mockData.json';

// Types
export interface Kid {
    id: string;
    name: string;
    avatar?: string | null;
    level: number;
    balance: number;
    chores: Chore[];
    allowanceHistory: AllowanceHistory[];
}

export interface Chore {
    id: string;
    title: string;
    description: string;
    reward: number;
    status: "completed" | "pending" | "cancelled";
    assignedTo: string;
    createdAt: string;
    completedAt?: string | null;
}

export interface AllowanceHistory {
    date: string;
    allowanceGiven: number;
    allowanceSpent: number;
}

export interface Parent {
    id: string;
    name: string;
    avatar: string;
    children: Kid[];
}

// Helper functions
const getDateRange = (range: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
        case "7":
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            return { start: sevenDaysAgo, end: today };
        case "30":
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return { start: thirtyDaysAgo, end: today };
        default:
            return { start: new Date(0), end: today };
    }
};

// Mock Data Service
class MockDataService {
    private data = mockData;

    // Parent related methods
    getParent(): Parent {
        return this.data.parent as Parent;
    }

    // Kids related methods
    getAllKids(): Kid[] {
        return this.data.parent.children.map(kid => ({
            ...kid,
            chores: kid.chores.map(chore => ({
                ...chore,
                assignedTo: kid.id,
                status: chore.status as "completed" | "pending" | "cancelled"
            }))
        })) as Kid[];
    }

    getKidById(id: string): Kid | undefined {
        const kid = this.data.parent.children.find(k => k.id === id);
        if (!kid) return undefined;

        return {
            ...kid,
            chores: kid.chores.map(chore => ({
                ...chore,
                assignedTo: kid.id,
                status: chore.status as "completed" | "pending" | "cancelled"
            }))
        } as Kid;
    }

    getKidsByLevel(level: number): Kid[] {
        return this.getAllKids().filter(kid => kid.level === level);
    }

    // Chores related methods
    getAllChores(): Chore[] {
        // Directly flatMap the children's chore arrays from the original data
        return this.data.parent.children.flatMap(kid =>
            kid.chores.map(chore => {
                const processedChore = ({
                    ...chore,
                    assignedTo: kid.id, // Explicitly add assignedTo from kid's ID
                    // Ensure status is correctly typed when mapping
                    status: chore.status as "completed" | "pending" | "cancelled",
                    // Provide default values/checks for other properties if they could be missing in source
                    id: chore.id || '',
                    title: chore.title || 'Untitled Activity',
                    description: chore.description || 'No description provided.',
                    reward: typeof chore.reward === 'number' ? chore.reward : 0,
                    createdAt: chore.createdAt || new Date().toISOString(),
                });
                // Add logging here to inspect each processed chore object
                console.log('Processed chore in getAllChores:', processedChore);
                return processedChore;
            })
        );
    }

    getChoresByKidId(kidId: string): Chore[] {
        const kid = this.getKidById(kidId);
        return kid?.chores || [];
    }

    getChoresByStatus(status: "completed" | "pending"): Chore[] {
        return this.getAllChores().filter(chore => chore.status === status);
    }

    getChoresByDateRange(range: string): Chore[] {
        const { start, end } = getDateRange(range);
        return this.getAllChores().filter(chore => {
            const choreDate = new Date(chore.createdAt);
            return choreDate >= start && choreDate <= end;
        });
    }

    getChoresByKidAndStatus(kidId: string, status: "completed" | "pending"): Chore[] {
        return this.getChoresByKidId(kidId).filter(chore => chore.status === status);
    }

    // Allowance related methods
    getAllAllowanceHistory(): AllowanceHistory[] {
        return this.data.parent.children.flatMap(kid => kid.allowanceHistory);
    }

    getAllowanceHistoryByKidId(kidId: string): AllowanceHistory[] {
        const kid = this.getKidById(kidId);
        return kid?.allowanceHistory || [];
    }

    getAllowanceHistoryByDateRange(range: string): AllowanceHistory[] {
        const { start, end } = getDateRange(range);
        return this.getAllAllowanceHistory().filter(history => {
            const historyDate = new Date(history.date);
            return historyDate >= start && historyDate <= end;
        });
    }

    // Statistics methods
    getTotalAllowanceGiven(): number {
        return this.getAllAllowanceHistory().reduce((sum, history) => sum + history.allowanceGiven, 0);
    }

    getTotalAllowanceSpent(): number {
        return this.getAllAllowanceHistory().reduce((sum, history) => sum + history.allowanceSpent, 0);
    }

    getCompletedChoresCount(): number {
        return this.getChoresByStatus("completed").length;
    }

    getPendingChoresCount(): number {
        return this.getChoresByStatus("pending").length;
    }

    getKidProgress(kidId: string): number {
        const kid = this.getKidById(kidId);
        if (!kid) return 0;

        const completedCount = kid.chores.filter(chore => chore.status === "completed").length;
        const totalCount = kid.chores.length;

        return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    }

    // Chart data methods
    getBarChartData(): AllowanceHistory[] {
        // Get all allowance history entries from all kids
        const allHistory = this.getAllAllowanceHistory();

        // Group by date and aggregate values
        const aggregatedData = allHistory.reduce((acc: { [key: string]: AllowanceHistory }, entry) => {
            if (!acc[entry.date]) {
                acc[entry.date] = {
                    date: entry.date,
                    allowanceGiven: 0,
                    allowanceSpent: 0
                };
            }
            acc[entry.date].allowanceGiven += entry.allowanceGiven;
            acc[entry.date].allowanceSpent += entry.allowanceSpent;
            return acc;
        }, {});

        // Convert to array and sort by date
        return Object.values(aggregatedData).sort((a, b) => {
            const [monthA, dayA] = a.date.split(' ');
            const [monthB, dayB] = b.date.split(' ');
            const currentYear = new Date().getFullYear();
            const dateA = new Date(`${monthA} ${dayA}, ${currentYear}`);
            const dateB = new Date(`${monthB} ${dayB}, ${currentYear}`);
            return dateA.getTime() - dateB.getTime();
        });
    }

    getPieChartData(range: string = "7"): { name: string; value: number }[] {
        const chores = this.getChoresByDateRange(range);
        const completedCount = chores.filter(chore => chore.status === "completed").length;
        const pendingCount = chores.filter(chore => chore.status === "pending").length;

        return [
            { name: "Completed", value: completedCount },
            { name: "Pending", value: pendingCount }
        ];
    }
}

// Export a singleton instance
export const mockDataService = new MockDataService(); 