/**
 * Service for handling allowance-related API calls
 */

import { getApiUrl, API_ENDPOINTS } from '../utils/api';
import {
    BackendAllowance,
    FrontendAllowance,
    PaginatedAllowanceResponse,
    transformAllowanceFromBackend,
    transformAllowancesFromBackend
} from '../utils/allowanceTransforms';

export class AllowanceService {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
        };
    }

    /**
     * Fetch all allowances with pagination
     */
    async getAllowances(page: number = 1): Promise<{ allowances: FrontendAllowance[], count: number, hasMore: boolean }> {
        try {
            const url = `${getApiUrl(API_ENDPOINTS.ALLOWANCES)}?page=${page}`;
            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch allowances: ${response.status}`);
            }

            const data: PaginatedAllowanceResponse = await response.json();
            console.log('Allowances API response:', data);

            const allowances = transformAllowancesFromBackend(data.results);

            return {
                allowances,
                count: data.count,
                hasMore: data.next !== null,
            };
        } catch (error) {
            console.error('Error fetching allowances:', error);
            throw error;
        }
    }

    /**
     * Fetch all allowances (all pages)
     */
    async getAllAllowances(): Promise<FrontendAllowance[]> {
        try {
            let allAllowances: BackendAllowance[] = [];
            let nextUrl: string | null = getApiUrl(API_ENDPOINTS.ALLOWANCES);

            // Fetch all pages
            while (nextUrl) {
                const response = await fetch(nextUrl, {
                    headers: this.getHeaders(),
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch allowances: ${response.status}`);
                }

                const data: PaginatedAllowanceResponse = await response.json();
                allAllowances = [...allAllowances, ...data.results];
                nextUrl = data.next;
            }

            console.log('All allowances fetched:', allAllowances);
            return transformAllowancesFromBackend(allAllowances);
        } catch (error) {
            console.error('Error fetching all allowances:', error);
            throw error;
        }
    }

    /**
     * Get specific allowance by ID
     */
    async getAllowanceById(allowanceId: string): Promise<FrontendAllowance> {
        try {
            const url = getApiUrl(API_ENDPOINTS.ALLOWANCE_DETAIL.replace(':allowanceId', allowanceId));
            const response = await fetch(url, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch allowance: ${response.status}`);
            }

            const data: BackendAllowance = await response.json();
            console.log('Allowance detail API response:', data);

            return transformAllowanceFromBackend(data);
        } catch (error) {
            console.error('Error fetching allowance by ID:', error);
            throw error;
        }
    }

    /**
     * Create new allowance (disabled due to backend 500 error)
     */
    async createAllowance(): Promise<FrontendAllowance> {
        // Note: This method is disabled due to backend 500 error
        throw new Error('Creating allowances is currently unavailable due to backend issues. Please try again later.');

        /* Original implementation (disabled):
        try {
            const payload = createAllowancePayload(params);
            const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_ALLOWANCE), {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to create allowance: ${response.status}`);
            }

            const data: BackendAllowance = await response.json();
            console.log('Create allowance API response:', data);

            return transformAllowanceFromBackend(data);
        } catch (error) {
            console.error('Error creating allowance:', error);
            throw error;
        }
        */
    }

    /**
     * Delete allowance by ID
     */
    async deleteAllowance(allowanceId: string): Promise<void> {
        try {
            const url = getApiUrl(API_ENDPOINTS.ALLOWANCE_DETAIL.replace(':allowanceId', allowanceId));
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to delete allowance: ${response.status}`);
            }

            console.log('Allowance deleted successfully');
        } catch (error) {
            console.error('Error deleting allowance:', error);
            throw error;
        }
    }

    /**
     * Update allowance (disabled due to backend 500 error)
     */
    async updateAllowance(): Promise<FrontendAllowance> {
        // Note: This method is disabled due to backend 500 error
        throw new Error('Updating allowances is currently unavailable due to backend issues. Please try again later.');

        /* Original implementation (disabled):
        try {
            const payload = createAllowancePayload({
                childId: params.childId || '',
                amount: params.amount || 0,
                frequency: params.frequency || 'weekly',
                status: params.status || 'pending',
            });
            
            const url = getApiUrl(API_ENDPOINTS.ALLOWANCE_DETAIL.replace(':allowanceId', allowanceId));
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to update allowance: ${response.status}`);
            }

            const data: BackendAllowance = await response.json();
            console.log('Update allowance API response:', data);

            return transformAllowanceFromBackend(data);
        } catch (error) {
            console.error('Error updating allowance:', error);
            throw error;
        }
        */
    }
}

/**
 * Create allowance service instance
 */
export const createAllowanceService = (accessToken: string) => {
    return new AllowanceService(accessToken);
};
