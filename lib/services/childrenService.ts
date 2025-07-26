import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';

// Custom error class for API errors
export class ApiError extends Error {
    public status: number;
    public code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

// Types for Child API requests and responses
export interface CreateChildRequest {
    username: string;
    name: string; // Child's display name
    pin: string;
}

export interface CreateChildResponse {
    id: string;
    username: string;
    name: string; // Child's display name
    avatar: string | null;
}

export interface KidLoginRequest {
    username: string;
    pin: string;
}

export interface KidLoginResponse {
    childId: string;
    childUsername: string;
    childName?: string; // Display name from backend
    parentId: string;
    token: string;
    refresh: string;
}

export interface Child {
    id: string;
    parent: string;
    username: string;
    name?: string; // Display name from backend
    avatar: string | null;
    created_at: string;
}

export interface ListChildrenResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Child[];
}

export interface ChildDetailResponse {
    id: string;
    parent: string;
    username: string;
    name?: string; // Display name from backend
    avatar: string | null;
    created_at: string;
}

export interface UpdateChildRequest {
    username?: string;
    name?: string; // Allow updating the child's display name
    pin?: string;
}

export interface UpdateChildResponse {
    username: string;
    name?: string; // Display name from backend
    avatar: string | null;
}

// -------- RAW SERVICE --------
export class ChildrenService {
    private static async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
        token?: string
    ): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (response.ok && response.status === 204) return {} as T;
            let data;
            try {
                data = await response.json();
            } catch {
                data = { message: response.statusText };
            }

            if (!response.ok) {
                const errorMessage: string =
                    data.detail ||
                    data.message ||
                    data.error ||
                    (data.non_field_errors && Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : null) ||
                    (data.username && Array.isArray(data.username) ? `Username: ${data.username[0]}` : null) ||
                    (data.pin && Array.isArray(data.pin) ? `PIN: ${data.pin[0]}` : null) ||
                    JSON.stringify(data) ||
                    response.statusText;
                throw new ApiError(errorMessage, response.status, data.code);
            }
            return data;
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Network error occurred');
        }
    }

    static async createChild(data: CreateChildRequest, parentToken: string): Promise<CreateChildResponse> {
        return this.makeRequest<CreateChildResponse>(
            API_ENDPOINTS.CREATE_CHILD,
            { method: 'POST', body: JSON.stringify(data) },
            parentToken
        );
    }

    static async listChildren(
        parentToken: string,
        page = 1,
        pageSize = 10
    ): Promise<ListChildrenResponse> {
        const url = `${getApiUrl(API_ENDPOINTS.LIST_CHILDREN)}?page=${page}&page_size=${pageSize}`;
        return this.makeRequest<ListChildrenResponse>(url, { method: 'GET' }, parentToken);
    }

    static async getChildDetail(childId: string, parentToken: string): Promise<ChildDetailResponse> {
        const endpoint = API_ENDPOINTS.CHILD_DETAIL.replace(':childId', childId);
        return this.makeRequest<ChildDetailResponse>(endpoint, { method: 'GET' }, parentToken);
    }

    static async updateChild(
        childId: string,
        data: UpdateChildRequest,
        parentToken: string
    ): Promise<UpdateChildResponse> {
        const endpoint = API_ENDPOINTS.UPDATE_CHILD.replace(':childId', childId);
        return this.makeRequest<UpdateChildResponse>(
            endpoint,
            { method: 'PUT', body: JSON.stringify(data) },
            parentToken
        );
    }

    static async deleteChild(childId: string, parentToken: string): Promise<void> {
        const endpoint = API_ENDPOINTS.DELETE_CHILD.replace(':childId', childId);
        return this.makeRequest<void>(
            endpoint,
            { method: 'DELETE' },
            parentToken
        );
    }

    static async kidLogin(data: KidLoginRequest): Promise<KidLoginResponse> {
        return this.makeRequest<KidLoginResponse>(
            API_ENDPOINTS.CHILD_LOGIN,
            { method: 'POST', body: JSON.stringify(data) }
        );
    }

    static async listChildrenFromUrl(url: string, parentToken: string): Promise<ListChildrenResponse> {
        return this.makeRequest<ListChildrenResponse>(url, { method: 'GET' }, parentToken);
    }
}

// -------- TANSTACK QUERY HOOKS --------

// Fetch paginated children
export function useChildrenQuery(parentToken: string, page = 1, pageSize = 10, options = {}) {
    return useQuery<ListChildrenResponse>({
        queryKey: ['paginated-kids', page, pageSize],
        queryFn: () => ChildrenService.listChildren(parentToken, page, pageSize),
        enabled: !!parentToken,
        ...options,
    });
}

// Create child mutation hook
export function useCreateChildMutation(parentToken: string, options: any = {}) {
    const queryClient = useQueryClient();
    return useMutation<CreateChildResponse, Error, CreateChildRequest>({
        mutationFn: (data: CreateChildRequest) => ChildrenService.createChild(data, parentToken),
        onSuccess: (data, variables, context) => {
            // Invalidate all kids queries so lists are refetched
            queryClient.invalidateQueries({ queryKey: ['paginated-kids'] });
            if (options && typeof options['onSuccess'] === 'function') options['onSuccess'](data, variables, context);
        },
        ...options,
    });
}

// Update child mutation hook
export function useUpdateChildMutation(parentToken: string, options: any = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ childId, data }: { childId: string; data: UpdateChildRequest }) =>
            ChildrenService.updateChild(childId, data, parentToken),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['paginated-kids'] });
            if (options && typeof options['onSuccess'] === 'function') options['onSuccess'](data, variables, context);
        },
        ...options,
    });
}

// Delete child mutation hook
export function useDeleteChildMutation(parentToken: string, options: any = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (childId: string) => ChildrenService.deleteChild(childId, parentToken),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['paginated-kids'] });
            if (options && typeof options['onSuccess'] === 'function') options['onSuccess'](data, variables, context);
        },
        ...options,
    });
}

// Get single child details hook
export function useChildDetailQuery(childId: string, parentToken: string, options = {}) {
    return useQuery<ChildDetailResponse>({
        queryKey: ['child-detail', childId],
        queryFn: () => ChildrenService.getChildDetail(childId, parentToken),
        enabled: !!childId && !!parentToken,
        ...options,
    });
}

// Kid login mutation hook (if needed)
export function useKidLoginMutation(options: any = {}) {
    return useMutation({
        mutationFn: (data: KidLoginRequest) => ChildrenService.kidLogin(data),
        ...options,
    });
}