import mockData from '@/mockdata/mockData.json';

// Types
export interface DayStatus {
    day: string;
    completed: boolean;
}

export interface DailyStreaks {
    weeklyProgress: DayStatus[];
}

export interface RewardItem {
    id: string;
    title: string;
    description: string;
    isRedeemed: boolean;
}

export interface Kid {
    id: string;
    name: string;
    avatar?: string | null;
    level: number;
    balance: number;
    chores: Chore[];
    allowanceHistory: AllowanceHistory[];
    dailyStreaks?: DailyStreaks;
    rewards?: RewardItem[];
    // Additional properties for profile management
    age?: number;
    grade?: string;
    school?: string;
    interests?: string[];
    allowanceAmount?: number;
    goals?: string;
    progress: number;
    // Properties for dashboard stats
    completedChoreCount: number;
    pendingChoreCount: number;
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
    dueDate?: string;
    parentId?: string;
    category?: string;
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

export interface KidAccount {
    id: string;
    name: string;
    username: string;
    parentId: string;
    avatar?: string | null;
}

export interface Allowance {
    id: string;
    kidId: string;
    parentId: string;
    amount: number;
    frequency: "once" | "daily" | "weekly" | "monthly";
    status: "pending" | "approved" | "rejected";
    createdAt: string;
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
    }    // Kids related methods
    getAllKids(): Kid[] {
        return this.data.parent.children.map(kid => {
            const kidChores = kid.chores.map(chore => ({
                ...chore,
                assignedTo: kid.id,
                status: chore.status as "completed" | "pending" | "cancelled",
                category: (chore as any).category || 'General'
            }));

            const completedCount = kidChores.filter(chore => chore.status === "completed").length;
            const pendingCount = kidChores.filter(chore => chore.status === "pending").length;
            const totalCount = kidChores.length;
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return {
                ...kid,
                chores: kidChores,
                progress,
                completedChoreCount: completedCount,
                pendingChoreCount: pendingCount,
                // Add default values for new optional properties
                age: (kid as any).age || 12,
                grade: (kid as any).grade || '6th Grade',
                school: (kid as any).school || 'Local Elementary School',
                interests: (kid as any).interests || ['Reading', 'Sports'],
                allowanceAmount: (kid as any).allowanceAmount || 1000,
                goals: (kid as any).goals || 'Earn enough to buy a new bike'
            };
        }) as Kid[];
    } getKidById(id: string): Kid | undefined {
        const kid = this.data.parent.children.find(k => k.id === id);
        if (!kid) return undefined;

        const kidChores = kid.chores.map(chore => ({
            ...chore,
            assignedTo: kid.id,
            status: chore.status as "completed" | "pending" | "cancelled",
            category: (chore as any).category || 'General'
        }));

        const completedCount = kidChores.filter(chore => chore.status === "completed").length;
        const pendingCount = kidChores.filter(chore => chore.status === "pending").length;
        const totalCount = kidChores.length;
        const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        return {
            ...kid,
            chores: kidChores,
            progress,
            completedChoreCount: completedCount,
            pendingChoreCount: pendingCount,
            // Add default values for new optional properties
            age: (kid as any).age || 12,
            grade: (kid as any).grade || '6th Grade',
            school: (kid as any).school || 'Local Elementary School',
            interests: (kid as any).interests || ['Reading', 'Sports'],
            allowanceAmount: (kid as any).allowanceAmount || 1000,
            goals: (kid as any).goals || 'Earn enough to buy a new bike'
        } as Kid;
    }

    getKidsByLevel(level: number): Kid[] {
        return this.getAllKids().filter(kid => kid.level === level);
    }

    // Create a mock kid account
    createMockKidAccount(name: string, username: string, parentId: string, pin: string, avatar?: string | null): KidAccount {
        // Generate a unique mock ID
        const mockId = `kid-mock-${Date.now()}`;

        // Create a mock kid data object
        const mockKidAccount: KidAccount = {
            id: mockId,
            name,
            username,
            parentId,
            avatar
        };

        console.log("Created mock kid account:", mockKidAccount);
        return mockKidAccount;
    }

    // Create a mock chore
    createMockChore(title: string, description: string, reward: number, assignedTo: string, dueDate: Date, parentId: string): Chore {
        // Generate a unique mock ID
        const mockId = `chore-mock-${Date.now()}`;

        // Create a mock chore object
        const mockChore: Chore = {
            id: mockId,
            title,
            description,
            reward,
            status: "pending",
            assignedTo,
            createdAt: new Date().toISOString(),
            dueDate: dueDate.toISOString(),
            parentId
        };

        console.log("Created mock chore:", mockChore);
        return mockChore;
    }

    // Create a mock allowance
    createMockAllowance(kidId: string, parentId: string, amount: number, frequency: string): Allowance {
        // Generate a unique mock ID
        const mockId = `allowance-mock-${Date.now()}`;

        // Map frequency to allowed values if needed
        const mappedFrequency = frequency === 'once' ? 'daily' : frequency as "daily" | "weekly" | "monthly";

        // Create a mock allowance object
        const mockAllowance: Allowance = {
            id: mockId,
            kidId,
            parentId,
            amount,
            frequency: mappedFrequency,
            status: "pending",
            createdAt: new Date().toISOString()
        };

        console.log("Created mock allowance:", mockAllowance);
        return mockAllowance;
    }    // Chores related methods
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
                    category: (chore as any).category || 'General',
                });
                // Add logging here to inspect each processed chore object
                console.log('Processed chore in getAllChores:', processedChore);
                return processedChore;
            })
        );
    } getChoresByKidId(kidId: string): Chore[] {
        const kid = this.getKidById(kidId);
        return kid?.chores || [];
    }

    // Alias method for compatibility
    getChoresByKid(kidId: string): Chore[] {
        return this.getChoresByKidId(kidId);
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