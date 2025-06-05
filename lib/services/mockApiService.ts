// Service for fetching mock data via API endpoints
export class MockApiService {
    private static getBaseUrl() {
        // For client-side requests, use relative URLs
        if (typeof window !== 'undefined') {
            return '/api/mock';
        }

        // For server-side requests, we need to construct the full URL
        if (process.env.NODE_ENV === 'development') {
            // Use NEXTAUTH_URL or fallback to localhost:3000
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            return `${baseUrl}/api/mock`;
        }

        // In production, for server-side requests, use relative URLs
        // Next.js can handle this in most deployment environments
        return '/api/mock';
    } static async fetchParent() {
        try {
            const response = await fetch(`${this.getBaseUrl()}/parent`);
            if (!response.ok) {
                throw new Error(`Failed to fetch parent: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching parent:', error);
            throw error;
        }
    }

    static async fetchKids() {
        try {
            const response = await fetch(`${this.getBaseUrl()}/kids`);
            if (!response.ok) {
                throw new Error(`Failed to fetch kids: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching kids:', error);
            throw error;
        }
    }

    static async fetchKidById(kidId: string) {
        try {
            const response = await fetch(`${this.getBaseUrl()}/kids/${kidId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch kid: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching kid by ID:', error);
            throw error;
        }
    }

    static async fetchAllChores() {
        try {
            const response = await fetch(`${this.getBaseUrl()}/chores`);
            if (!response.ok) {
                throw new Error(`Failed to fetch chores: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching chores:', error);
            throw error;
        }
    }

    static async fetchChoresByKidId(kidId: string) {
        try {
            const response = await fetch(`${this.getBaseUrl()}/chores/${kidId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch kid chores: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching kid chores:', error);
            throw error;
        }
    }

    // Alternative method using POST for filtering
    static async fetchChoresByKidIdPost(kidId: string) {
        try {
            const response = await fetch(`${this.getBaseUrl()}/chores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kidId }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch kid chores: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching kid chores via POST:', error);
            throw error;
        }
    }

    // Fetch daily streaks data for a specific kid
    static async fetchDailyStreaksByKidId(kidId: string) {
        try {
            const response = await fetch(`${this.getBaseUrl()}/kids/${kidId}/daily-streaks`);
            if (!response.ok) {
                throw new Error(`Failed to fetch daily streaks: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching daily streaks:', error);
            throw error;
        }
    }

    // Fetch rewards data for a specific kid
    static async fetchRewardsByKidId(kidId: string) {
        try {
            const response = await fetch(`${this.getBaseUrl()}/kids/${kidId}/rewards`);
            if (!response.ok) {
                throw new Error(`Failed to fetch rewards: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching rewards:', error);
            throw error;
        }
    }

    // Update reward redemption status
    static async updateRewardRedemption(kidId: string, rewardId: string, isRedeemed: boolean) {
        try {
            const response = await fetch(`${this.getBaseUrl()}/kids/${kidId}/rewards/${rewardId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isRedeemed }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update reward: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating reward redemption:', error);
            throw error;
        }
    }

    // Update daily streak completion status
    static async updateDailyStreakCompletion(kidId: string, day: string, completed: boolean) {
        try {
            const response = await fetch(`${this.getBaseUrl()}/kids/${kidId}/daily-streaks`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ day, completed }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update daily streak: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating daily streak:', error);
            throw error;
        }
    }
}
