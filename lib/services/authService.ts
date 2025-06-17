import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';

// Types for API requests and responses
export interface SignupRequest {
    full_name: string;
    email: string;
    password: string;
    password2: string;
    role?: string;
    terms_accepted: boolean;
}

export interface SignupResponse {
    message: string;
    user?: {
        id: string;
        email: string;
        full_name: string;
        role: string;
        is_verified: boolean;
    };
    token?: string;
    uidb64?: string;
    verification?: {
        token: string;
        uidb64: string;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    token: string;
    refresh: string;
    role?: string;
    is_verified?: boolean;
}

export interface ChildLoginRequest {
    username: string;
    pin: string;
}

export interface ChildLoginResponse {
    childId: string;
    token: string;
    refresh: string;
}

export interface HealthCheckResponse {
    message: string;
}

export interface EmailVerificationRequest {
    uidb64: string;
    token: string;
}

export interface EmailVerificationResponse {
    message: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetResponse {
    message: string;
}

export interface PasswordChangeRequest {
    old_password: string;
    new_password: string;
}

export interface PasswordChangeResponse {
    message: string;
}

export interface PasswordResetConfirmRequest {
    new_password1: string;
    new_password2: string;
    uidb64?: string;
    token?: string;
}

export interface PasswordResetConfirmResponse {
    detail: string;
}

export class AuthService {
    private static async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = getApiUrl(endpoint);

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

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
            } catch (e) {
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
                });

                // Handle different error response formats
                let errorMessage;

                if (data && typeof data === 'object') {
                    // Try to extract error message from various possible formats
                    errorMessage =
                        data.detail ||
                        data.message ||
                        data.error ||
                        (data.non_field_errors && Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : null) ||
                        // Handle field-specific errors
                        (data.email && Array.isArray(data.email) ? `Email: ${data.email[0]}` : null) ||
                        (data.password && Array.isArray(data.password) ? `Password: ${data.password[0]}` : null) ||
                        (data.username && Array.isArray(data.username) ? `Username: ${data.username[0]}` : null) ||
                        (data.pin && Array.isArray(data.pin) ? `PIN: ${data.pin[0]}` : null) ||
                        JSON.stringify(data);
                } else if (typeof data === 'string') {
                    errorMessage = data;
                } else {
                    errorMessage = 'An error occurred';
                }

                throw new Error(errorMessage);
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

    private static getAuthHeaders(token?: string): Record<string, string> {
        if (!token) return {};
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    /**
     * Health check endpoint
     */
    static async healthCheck(): Promise<HealthCheckResponse> {
        return this.makeRequest<HealthCheckResponse>(API_ENDPOINTS.HEALTH_CHECK, {
            method: 'GET',
        });
    }

    /**
     * User registration
     */
    static async signup(data: SignupRequest): Promise<SignupResponse> {
        const requestData = {
            ...data,
            role: data.role || 'parent', // Default to parent role
        };

        return this.makeRequest<SignupResponse>(API_ENDPOINTS.SIGNUP, {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
    }

    /**
     * User login
     */
    static async login(data: LoginRequest): Promise<LoginResponse> {
        return this.makeRequest<LoginResponse>(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Child login
     */
    static async childLogin(data: ChildLoginRequest): Promise<ChildLoginResponse> {
        return this.makeRequest<ChildLoginResponse>(API_ENDPOINTS.CHILD_LOGIN, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Email verification via POST
     */
    static async verifyEmail(data: EmailVerificationRequest): Promise<EmailVerificationResponse> {
        return this.makeRequest<EmailVerificationResponse>(API_ENDPOINTS.VERIFY_EMAIL, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Email verification via GET (for email links)
     */
    static async verifyEmailViaGet(uidb64: string, token: string): Promise<EmailVerificationResponse> {
        const params = new URLSearchParams({ uidb64, token });
        return this.makeRequest<EmailVerificationResponse>(
            `${API_ENDPOINTS.VERIFY_EMAIL}?${params.toString()}`,
            {
                method: 'GET',
            }
        );
    }

    /**
     * Request password reset
     */
    static async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
        return this.makeRequest<PasswordResetResponse>(API_ENDPOINTS.PASSWORD_RESET, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Alternative forgot password endpoint
     */
    static async forgotPassword(data: PasswordResetRequest): Promise<PasswordResetResponse> {
        return this.makeRequest<PasswordResetResponse>(API_ENDPOINTS.FORGOT_PASSWORD, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Change password (authenticated)
     */
    static async changePassword(data: PasswordChangeRequest, token: string): Promise<PasswordChangeResponse> {
        return this.makeRequest<PasswordChangeResponse>(API_ENDPOINTS.PASSWORD_CHANGE, {
            method: 'PUT',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(data),
        });
    }

    /**
     * Confirm password reset
     */
    static async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<PasswordResetConfirmResponse> {
        return this.makeRequest<PasswordResetConfirmResponse>(API_ENDPOINTS.PASSWORD_RESET_CONFIRM, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Comprehensive test suite for all authentication endpoints
     */
    static async runFullAuthenticationTests(testData: {
        email: string;
        password: string;
        fullName: string;
        childUsername?: string;
        childPin?: string;
    }) {
        const results = {
            healthCheck: { status: 'pending', result: null as any, error: null as string | null },
            signup: { status: 'pending', result: null as any, error: null as string | null },
            login: { status: 'pending', result: null as any, error: null as string | null },
            childLogin: { status: 'pending', result: null as any, error: null as string | null },
            emailVerification: { status: 'pending', result: null as any, error: null as string | null },
            summary: {
                total: 5,
                passed: 0,
                failed: 0,
                skipped: 0
            }
        };

        console.log('🚀 Starting comprehensive authentication tests...');

        // Test health check
        try {
            console.log('1️⃣ Testing health check...');
            results.healthCheck.result = await this.healthCheck();
            results.healthCheck.status = 'passed';
            results.summary.passed++;
            console.log('✅ Health check passed:', results.healthCheck.result);
        } catch (error) {
            results.healthCheck.error = error instanceof Error ? error.message : 'Unknown error';
            results.healthCheck.status = 'failed';
            results.summary.failed++;
            console.error('❌ Health check failed:', results.healthCheck.error);
        }

        // Test signup
        try {
            console.log('2️⃣ Testing user signup...');
            results.signup.result = await this.signup({
                full_name: testData.fullName,
                email: testData.email,
                password: testData.password,
                password2: testData.password,
                terms_accepted: true,
            });
            results.signup.status = 'passed';
            results.summary.passed++;
            console.log('✅ Signup passed:', results.signup.result);
        } catch (error) {
            results.signup.error = error instanceof Error ? error.message : 'Unknown error';
            results.signup.status = 'failed';
            results.summary.failed++;
            console.error('❌ Signup failed:', results.signup.error);
        }

        // Test login (only if signup succeeded or if we expect the user to already exist)
        try {
            console.log('3️⃣ Testing user login...');
            results.login.result = await this.login({
                email: testData.email,
                password: testData.password,
            });
            results.login.status = 'passed';
            results.summary.passed++;
            console.log('✅ Login passed:', results.login.result);
        } catch (error) {
            results.login.error = error instanceof Error ? error.message : 'Unknown error';
            results.login.status = 'failed';
            results.summary.failed++;
            console.error('❌ Login failed:', results.login.error);
        }

        // Test child login (if credentials provided)
        if (testData.childUsername && testData.childPin) {
            try {
                console.log('4️⃣ Testing child login...');
                results.childLogin.result = await this.childLogin({
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
        } else {
            results.childLogin.status = 'skipped';
            results.summary.skipped++;
            console.log('⏭️ Child login skipped (no credentials provided)');
        }

        // Test email verification (with dummy data)
        try {
            console.log('5️⃣ Testing email verification...');
            results.emailVerification.result = await this.verifyEmail({
                uidb64: 'test-uidb64',
                token: 'test-token'
            });
            results.emailVerification.status = 'passed';
            results.summary.passed++;
            console.log('✅ Email verification passed:', results.emailVerification.result);
        } catch (error) {
            results.emailVerification.error = error instanceof Error ? error.message : 'Unknown error';
            results.emailVerification.status = 'failed';
            results.summary.failed++;
            console.error('❌ Email verification failed (expected for dummy data):', results.emailVerification.error);
        }

        // Log summary
        console.log('📊 Test Summary:');
        console.log(`Total: ${results.summary.total}`);
        console.log(`Passed: ${results.summary.passed}`);
        console.log(`Failed: ${results.summary.failed}`);
        console.log(`Skipped: ${results.summary.skipped}`);

        return results;
    }

    /**
     * Check if the Django backend is running
     */
    static async checkBackendStatus(): Promise<{
        isRunning: boolean;
        baseUrl: string;
        error?: string;
    }> {
        const baseUrl = getApiUrl('');

        try {
            const response = await fetch(baseUrl, {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });

            return {
                isRunning: response.ok,
                baseUrl,
            };
        } catch (error) {
            return {
                isRunning: false,
                baseUrl,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Debug method to test raw API calls and see exact request/response
     */
    static async debugApiCall(endpoint: string, method: string = 'GET', body?: any) {
        const url = getApiUrl(endpoint);

        console.log('🔍 DEBUG API CALL');
        console.log('URL:', url);
        console.log('Method:', method);
        console.log('Body:', body);

        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
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
            } catch (e) {
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
}
