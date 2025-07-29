import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';

export interface ApiResult<T> {
    data?: T;
    error?: string;
}

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
}

export interface ChildLoginRequest {
    username: string;
    pin: string;
}
export interface ChildLoginResponse {
    id: string;
    name?: string;
    childId: string;
    avatar: string | null;
    username: string;
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
    ): Promise<ApiResult<T>> {
        const url = getApiUrl(endpoint);
        const defaultHeaders = { 'Content-Type': 'application/json' };
        const config: RequestInit = {
            ...options,
            headers: { ...defaultHeaders, ...options.headers },
        };

        try {
            const response = await fetch(url, config);

            if (response.ok && response.status === 204) {
                return { data: {} as T };
            }

            let data: any;
            try {
                data = await response.json();
            } catch {
                data = { message: response.statusText };
            }

            if (!response.ok) {
                const errorMessage =
                    data?.detail ||
                    data?.message ||
                    data?.error ||
                    (data?.non_field_errors && Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : null) ||
                    (data?.email && Array.isArray(data.email) ? `Email: ${data.email[0]}` : null) ||
                    (data?.password && Array.isArray(data.password) ? `Password: ${data.password[0]}` : null) ||
                    (data?.username && Array.isArray(data.username) ? `Username: ${data.username[0]}` : null) ||
                    (data?.pin && Array.isArray(data.pin) ? `PIN: ${data.pin[0]}` : null) ||
                    (typeof data === 'string' ? data : null) ||
                    'An error occurred';
                return { error: errorMessage };
            }

            return { data };
        } catch (error) {
            if (error instanceof Error) {
                return { error: error.message };
            }
            return { error: 'Network error occurred' };
        }
    }

    private static getAuthHeaders(token?: string): Record<string, string> {
        if (!token) return {};
        return { 'Authorization': `Bearer ${token}` };
    }

    static async healthCheck(): Promise<ApiResult<HealthCheckResponse>> {
        return this.makeRequest<HealthCheckResponse>(API_ENDPOINTS.HEALTH_CHECK, { method: 'GET' });
    }

    static async signup(data: SignupRequest): Promise<ApiResult<SignupResponse>> {
        const requestData = { ...data, role: data.role || 'parent' };
        return this.makeRequest<SignupResponse>(API_ENDPOINTS.SIGNUP, {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
    }

    static async login(data: LoginRequest): Promise<ApiResult<LoginResponse>> {
        return this.makeRequest<LoginResponse>(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async childLogin(data: ChildLoginRequest): Promise<ApiResult<ChildLoginResponse>> {
        return this.makeRequest<ChildLoginResponse>(API_ENDPOINTS.CHILD_LOGIN, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async verifyEmail(data: EmailVerificationRequest): Promise<ApiResult<EmailVerificationResponse>> {
        return this.makeRequest<EmailVerificationResponse>(API_ENDPOINTS.VERIFY_EMAIL, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async verifyEmailViaGet(uidb64: string, token: string): Promise<ApiResult<EmailVerificationResponse>> {
        const params = new URLSearchParams({ uidb64, token });
        return this.makeRequest<EmailVerificationResponse>(
            `${API_ENDPOINTS.VERIFY_EMAIL}?${params.toString()}`,
            { method: 'GET' }
        );
    }

    static async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResult<PasswordResetResponse>> {
        return this.makeRequest<PasswordResetResponse>(API_ENDPOINTS.PASSWORD_RESET, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async forgotPassword(data: PasswordResetRequest): Promise<ApiResult<PasswordResetResponse>> {
        return this.makeRequest<PasswordResetResponse>(API_ENDPOINTS.FORGOT_PASSWORD, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async changePassword(data: PasswordChangeRequest, token: string): Promise<ApiResult<PasswordChangeResponse>> {
        return this.makeRequest<PasswordChangeResponse>(API_ENDPOINTS.PASSWORD_CHANGE, {
            method: 'PUT',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(data),
        });
    }

    static async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<ApiResult<PasswordResetConfirmResponse>> {
        return this.makeRequest<PasswordResetConfirmResponse>(API_ENDPOINTS.PASSWORD_RESET_CONFIRM, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}