/**
 * Transformation utilities for allowance data between frontend and backend formats
 */

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

// Backend allowance interface (based on FamilyAllowanceSerializer)
export interface BackendAllowance {
    id: string;
    childId: string; // Maps to child.id
    parentId: string; // Maps to parent.id (read-only)
    amount: string; // Decimal field comes as string from API
    frequency: string;
    status: string;
    created_at: string; // Note: backend uses created_at, not createdAt
    last_paid_at?: string;
    next_payment_date?: string;
}

/**
 * Transform frontend allowance data to backend format for API requests
 */
export const transformAllowanceToBackend = (frontendAllowance: Partial<FrontendAllowance>): Partial<BackendAllowance> => {
    const backendAllowance: Partial<BackendAllowance> = {};

    if (frontendAllowance.id !== undefined) backendAllowance.id = frontendAllowance.id;
    if (frontendAllowance.childId !== undefined) backendAllowance.childId = frontendAllowance.childId;
    if (frontendAllowance.parentId !== undefined) backendAllowance.parentId = frontendAllowance.parentId;
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
        childId: backendAllowance.childId,
        parentId: backendAllowance.parentId,
        amount: parseFloat(backendAllowance.amount),
        frequency: backendAllowance.frequency,
        status: backendAllowance.status,
        createdAt: backendAllowance.created_at,
        lastPaidAt: backendAllowance.last_paid_at,
        nextPaymentDate: backendAllowance.next_payment_date,
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
        childId: data.childId,
        amount: data.amount,
        frequency: data.frequency,
        status: data.status || 'pending',
    };
};
