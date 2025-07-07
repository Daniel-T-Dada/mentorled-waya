/**
 * Transformation utilities for allowance data between frontend and backend formats
 */

// Paginated response interface
export interface PaginatedAllowanceResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: BackendAllowance[];
}

// Frontend allowance interface
export interface FrontendAllowance {
    id: string;
    childId: string;
    parentId: string;
    amount: number;
    frequency: string;
    status: string;
    createdAt: string;
    lastPaidAt?: string;
    nextPaymentDate?: string;
}

// Backend allowance interface (based on actual API response)
export interface BackendAllowance {
    id: string;
    parent_id: string; // Snake case field name
    child_id: string; // Snake case field name
    amount: string; // Decimal field comes as string from API
    frequency: string;
    status: string;
    created_at: string; // Snake case field name
    last_paid_at?: string | null; // Snake case field name
    next_payment_date?: string | null; // Snake case field name
}

/**
 * Transform frontend allowance data to backend format for API requests
 */
export const transformAllowanceToBackend = (frontendAllowance: Partial<FrontendAllowance>): Partial<BackendAllowance> => {
    const backendAllowance: Partial<BackendAllowance> = {};

    if (frontendAllowance.id !== undefined) backendAllowance.id = frontendAllowance.id;
    if (frontendAllowance.childId !== undefined) backendAllowance.child_id = frontendAllowance.childId;
    if (frontendAllowance.parentId !== undefined) backendAllowance.parent_id = frontendAllowance.parentId;
    if (frontendAllowance.amount !== undefined) backendAllowance.amount = frontendAllowance.amount.toString();
    if (frontendAllowance.frequency !== undefined) backendAllowance.frequency = frontendAllowance.frequency;
    if (frontendAllowance.status !== undefined) backendAllowance.status = frontendAllowance.status;
    if (frontendAllowance.createdAt !== undefined) backendAllowance.created_at = frontendAllowance.createdAt;
    if (frontendAllowance.lastPaidAt !== undefined) backendAllowance.last_paid_at = frontendAllowance.lastPaidAt;
    if (frontendAllowance.nextPaymentDate !== undefined) backendAllowance.next_payment_date = frontendAllowance.nextPaymentDate;

    return backendAllowance;
};

/**
 * Transform backend allowance data to frontend format
 */
export const transformAllowanceFromBackend = (backendAllowance: BackendAllowance): FrontendAllowance => {
    return {
        id: backendAllowance.id,
        childId: backendAllowance.child_id,
        parentId: backendAllowance.parent_id,
        amount: parseFloat(backendAllowance.amount),
        frequency: backendAllowance.frequency,
        status: backendAllowance.status,
        createdAt: backendAllowance.created_at,
        lastPaidAt: backendAllowance.last_paid_at || undefined,
        nextPaymentDate: backendAllowance.next_payment_date || undefined,
    };
};

/**
 * Transform array of backend allowances to frontend format
 */
export const transformAllowancesFromBackend = (backendAllowances: BackendAllowance[]): FrontendAllowance[] => {
    return backendAllowances.map(transformAllowanceFromBackend);
};

/**
 * Create allowance request payload for backend
 */
export const createAllowancePayload = (data: {
    childId: string;
    amount: number;
    frequency: string;
    status?: string;
}) => {
    return {
        child_id: data.childId, // Use snake_case for backend
        amount: data.amount,
        frequency: data.frequency,
        status: data.status || 'pending',
    };
};
