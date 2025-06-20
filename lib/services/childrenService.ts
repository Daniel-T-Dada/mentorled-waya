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
    pin: string;
}

export interface CreateChildResponse {
    id: string;
    username: string;
    avatar: string | null;
}

export interface KidLoginRequest {
    username: string;
    pin: string;
}

export interface KidLoginResponse {
    childId: string;
    childUsername: string;
    parentId: string;
    token: string;
    refresh: string;
}

export interface Child {
    id: string;
    parent: string;
    username: string;
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
    avatar: string | null;
    created_at: string;
}

export interface UpdateChildRequest {
    username?: string;
    pin?: string;
}

export interface UpdateChildResponse {
    username: string;
    avatar: string | null;
}

export class ChildrenService {
    private static async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
        token?: string
    ): Promise<T> {
        const url = getApiUrl(endpoint); const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add authorization header if token is provided
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        console.log(`Making request to: ${url}`);
        console.log('Request config:', config);

        try {
            const response = await fetch(url, config);

            console.log(`Response status: ${response.status} ${response.statusText}`);

            // For successful responses that might not have content (like 204)
            if (response.ok && response.status === 204) {
                return {} as T;
            }

            let data;
            try {
                data = await response.json();
                console.log('Response data:', data);
            } catch {
                // If response is not JSON, create a generic response
                data = { message: response.statusText };
                console.log('Non-JSON response, using status text:', response.statusText);
            }

            if (!response.ok) {
                // Log the full error response for debugging
                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data,
                    url: url
                });                // Handle different error response formats
                let errorMessage;
                let errorCode;

                if (data && typeof data === 'object') {
                    // Extract error code if available
                    errorCode = data.code;

                    // Try to extract error message from various possible formats
                    errorMessage =
                        data.detail ||
                        data.message ||
                        data.error ||
                        (data.non_field_errors && Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : null) ||
                        // Handle field-specific errors
                        (data.username && Array.isArray(data.username) ? `Username: ${data.username[0]}` : null) ||
                        (data.pin && Array.isArray(data.pin) ? `PIN: ${data.pin[0]}` : null) ||
                        JSON.stringify(data);
                } else if (typeof data === 'string') {
                    errorMessage = data;
                } else {
                    errorMessage = 'An error occurred';
                }

                throw new ApiError(errorMessage, response.status, errorCode);
            }

            return data;
        } catch (error) {
            console.error(`Request failed for ${url}:`, error);

            if (error instanceof Error) {
                throw error;
            }

            throw new Error('Network error occurred');
        }
    }

    /**
     * Create a new child account (requires parent authentication)
     */
    static async createChild(data: CreateChildRequest, parentToken: string): Promise<CreateChildResponse> {
        return this.makeRequest<CreateChildResponse>(
            API_ENDPOINTS.CREATE_CHILD,
            {
                method: 'POST',
                body: JSON.stringify(data),
            },
            parentToken
        );
    }    /**
     * List all children for the authenticated parent
     */
    static async listChildren(parentToken: string): Promise<ListChildrenResponse> {
        return this.makeRequest<ListChildrenResponse>(
            API_ENDPOINTS.LIST_CHILDREN,
            {
                method: 'GET',
            },
            parentToken
        );
    }

    /**
     * Fetch children from a custom URL (for pagination)
     */
    static async listChildrenFromUrl(url: string, parentToken: string): Promise<ListChildrenResponse> {
        console.log('Making request to:', url);
        console.log('Request config:', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${parentToken}`
            }
        });

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${parentToken}`
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        return data;
    }

    /**
     * Kid login with username and PIN
     */
    static async kidLogin(data: KidLoginRequest): Promise<KidLoginResponse> {
        return this.makeRequest<KidLoginResponse>(
            API_ENDPOINTS.CHILD_LOGIN,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
            // No token needed for kid login
        );
    }

    /**
     * Get details of a specific child
     */
    static async getChildDetail(childId: string, parentToken: string): Promise<ChildDetailResponse> {
        const endpoint = API_ENDPOINTS.CHILD_DETAIL.replace(':childId', childId);
        return this.makeRequest<ChildDetailResponse>(
            endpoint,
            {
                method: 'GET',
            },
            parentToken
        );
    }

    /**
     * Update a child's information
     */
    static async updateChild(
        childId: string,
        data: UpdateChildRequest,
        parentToken: string
    ): Promise<UpdateChildResponse> {
        const endpoint = API_ENDPOINTS.UPDATE_CHILD.replace(':childId', childId);
        return this.makeRequest<UpdateChildResponse>(
            endpoint,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            },
            parentToken
        );
    }

    /**
     * Delete a child account
     */
    static async deleteChild(childId: string, parentToken: string): Promise<void> {
        const endpoint = API_ENDPOINTS.DELETE_CHILD.replace(':childId', childId);
        return this.makeRequest<void>(
            endpoint,
            {
                method: 'DELETE',
            },
            parentToken
        );
    }

    /**
     * Debug method to test raw API calls and see exact request/response
     */
    static async debugApiCall(
        endpoint: string,
        method: string = 'GET',
        body?: any,
        token?: string
    ) {
        const url = getApiUrl(endpoint);

        console.log('🔍 DEBUG CHILDREN API CALL');
        console.log('URL:', url);
        console.log('Method:', method);
        console.log('Body:', body);
        console.log('Token:', token ? `${token.substring(0, 20)}...` : 'None'); const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            method,
            headers,
        };

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);
            const responseText = await response.text();

            console.log('📤 Response Status:', response.status, response.statusText);
            console.log('📤 Response Headers:', Object.fromEntries(response.headers.entries()));
            console.log('📤 Response Body:', responseText);

            // Try to parse as JSON
            let parsedData;
            try {
                parsedData = JSON.parse(responseText);
            } catch {
                parsedData = responseText;
            }

            return {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data: parsedData,
                rawText: responseText
            };
        } catch (error) {
            console.error('🚨 Request Error:', error);
            throw error;
        }
    }

    /**
     * Complete workflow test - create parent, create child, test child login
     */
    static async testCompleteChildWorkflow(testData: {
        parentEmail: string;
        parentPassword: string;
        parentName: string;
        childUsername: string;
        childPin: string;
    }) {
        const results = {
            parentSignup: { status: 'pending', result: null as any, error: null as string | null },
            parentLogin: { status: 'pending', result: null as any, error: null as string | null, token: null as string | null },
            createChild: { status: 'pending', result: null as any, error: null as string | null },
            listChildren: { status: 'pending', result: null as any, error: null as string | null },
            childLogin: { status: 'pending', result: null as any, error: null as string | null },
            summary: {
                total: 5,
                passed: 0,
                failed: 0,
                skipped: 0
            }
        };

        console.log('🚀 Starting complete child workflow test...');

        // Import AuthService dynamically to avoid circular imports
        const { AuthService } = await import('./authService');

        // Step 1: Parent signup
        try {
            console.log('1️⃣ Testing parent signup...');
            results.parentSignup.result = await AuthService.signup({
                full_name: testData.parentName,
                email: testData.parentEmail,
                password: testData.parentPassword,
                password2: testData.parentPassword,
                terms_accepted: true,
            });
            results.parentSignup.status = 'passed';
            results.summary.passed++;
            console.log('✅ Parent signup passed:', results.parentSignup.result);
        } catch (error) {
            results.parentSignup.error = error instanceof Error ? error.message : 'Unknown error';
            results.parentSignup.status = 'failed';
            results.summary.failed++;
            console.error('❌ Parent signup failed:', results.parentSignup.error);
        }

        // Step 2: Parent login to get token
        try {
            console.log('2️⃣ Testing parent login...');
            results.parentLogin.result = await AuthService.login({
                email: testData.parentEmail,
                password: testData.parentPassword,
            });
            results.parentLogin.token = results.parentLogin.result.token;
            results.parentLogin.status = 'passed';
            results.summary.passed++;
            console.log('✅ Parent login passed:', results.parentLogin.result);
        } catch (error) {
            results.parentLogin.error = error instanceof Error ? error.message : 'Unknown error';
            results.parentLogin.status = 'failed';
            results.summary.failed++;
            console.error('❌ Parent login failed:', results.parentLogin.error);
            // If parent login fails, skip remaining tests
            results.createChild.status = 'skipped';
            results.listChildren.status = 'skipped';
            results.childLogin.status = 'skipped';
            results.summary.skipped += 3;
            return results;
        }

        // Step 3: Create child account
        if (results.parentLogin.token) {
            try {
                console.log('3️⃣ Testing create child...');
                results.createChild.result = await this.createChild({
                    username: testData.childUsername,
                    pin: testData.childPin,
                }, results.parentLogin.token);
                results.createChild.status = 'passed';
                results.summary.passed++;
                console.log('✅ Create child passed:', results.createChild.result);
            } catch (error) {
                results.createChild.error = error instanceof Error ? error.message : 'Unknown error';
                results.createChild.status = 'failed';
                results.summary.failed++;
                console.error('❌ Create child failed:', results.createChild.error);
            }

            // Step 4: List children
            try {
                console.log('4️⃣ Testing list children...');
                results.listChildren.result = await this.listChildren(results.parentLogin.token);
                results.listChildren.status = 'passed';
                results.summary.passed++;
                console.log('✅ List children passed:', results.listChildren.result);
            } catch (error) {
                results.listChildren.error = error instanceof Error ? error.message : 'Unknown error';
                results.listChildren.status = 'failed';
                results.summary.failed++;
                console.error('❌ List children failed:', results.listChildren.error);
            }
        }

        // Step 5: Test child login
        try {
            console.log('5️⃣ Testing child login...');
            results.childLogin.result = await AuthService.childLogin({
                username: testData.childUsername,
                pin: testData.childPin,
            });
            results.childLogin.status = 'passed';
            results.summary.passed++;
            console.log('✅ Child login passed:', results.childLogin.result);
        } catch (error) {
            results.childLogin.error = error instanceof Error ? error.message : 'Unknown error';
            results.childLogin.status = 'failed';
            results.summary.failed++;
            console.error('❌ Child login failed:', results.childLogin.error);
        }

        // Log summary
        console.log('📊 Complete Workflow Test Summary:');
        console.log(`Total: ${results.summary.total}`);
        console.log(`Passed: ${results.summary.passed}`);
        console.log(`Failed: ${results.summary.failed}`);
        console.log(`Skipped: ${results.summary.skipped}`);

        return results;
    }
}
