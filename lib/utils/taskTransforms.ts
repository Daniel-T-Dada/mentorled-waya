/**
 * Utility functions for transforming task data between frontend (camelCase) and backend (snake_case) formats
 */

// Frontend task interface (camelCase)
export interface Task {
    id: string;
    title: string;
    description: string;
    reward: string; // Backend returns as string
    dueDate: string;
    assignedTo: string; // Child ID (UUID)
    assignedToName?: string; // Child's display name from backend
    assignedToUsername?: string; // Child's username from backend
    parentId?: string;
    status: 'pending' | 'completed' | 'missed';
    createdAt: string;
    completedAt: string | null;
    category?: string;
}

/**
 * Backend chore/task interface based on the ChoreReadSerializer from Django API
 * This matches the format returned by:
 * - /api/taskmaster/chores/
 * - /api/taskmaster/children/chores/
 */
export interface BackendTask {
    // Standard fields from all backends
    id: string;
    title: string;
    description: string;

    // Various ways the reward/amount might be represented
    amount?: string | number; // Primary field for reward in real backend
    reward?: string | number; // Alternative field name in some responses

    // Date fields with variations
    due_date?: string;
    dueDate?: string;
    created_at?: string;
    createdAt?: string;
    completed_at?: string | null;
    completedAt?: string | null;

    // Child/assignee fields - backend uses assignedTo (camelCase) in serializer
    assignedTo?: string; // Child ID in camelCase (from ChoreReadSerializer)
    assigned_to?: string; // Alternative snake_case that might be used
    assignedToName?: string; // From ChoreReadSerializer
    assignedToUsername?: string; // From ChoreReadSerializer

    // Parent reference
    parentId?: string; // From ChoreReadSerializer
    parent?: string; // Alternative field name

    // Status fields - could be any of these depending on serializer
    status?: string; // Primary field name
    task_status?: string; // Alternative field name
    chore_status?: string; // Alternative field name

    // Additional fields
    category?: string;
}

// Create task request payload (what we send to backend)
export interface CreateTaskRequest {
    title: string;
    description: string;
    assigned_to: string; // Child ID (UUID)
    reward: number;
    due_date: string; // YYYY-MM-DD format
}

// Transform frontend task data to backend format for API requests
export function transformTaskToBackend(frontendTask: Partial<Task>): Partial<CreateTaskRequest> {
    return {
        ...(frontendTask.id && { id: frontendTask.id }),
        ...(frontendTask.title && { title: frontendTask.title }),
        ...(frontendTask.description && { description: frontendTask.description }),
        ...(frontendTask.reward && { reward: parseFloat(frontendTask.reward) }),
        ...(frontendTask.dueDate && { due_date: frontendTask.dueDate }),
        ...(frontendTask.assignedTo && { assigned_to: frontendTask.assignedTo }),
        ...(frontendTask.status && { status: frontendTask.status }),
    };
}

// Transform backend task data to frontend format
export function transformTaskFromBackend(backendTask: BackendTask): Task {
    // Find the status value from multiple possible fields
    const statusValue = backendTask.status || backendTask.task_status || backendTask.chore_status || 'pending';

    // For debugging only
    if (process.env.NODE_ENV === 'development') {
        console.log(`Task transform - Task ${backendTask.id} status: ${statusValue}`);
    }

    // Normalize status values to ensure consistent casing
    let normalizedStatus: 'pending' | 'completed' | 'missed';

    // Convert status to lowercase for case-insensitive comparison
    const rawStatus = String(statusValue).toLowerCase().trim();

    if (rawStatus === 'completed' || rawStatus === 'complete' || rawStatus === 'done') {
        normalizedStatus = 'completed';
    } else if (rawStatus === 'pending' || rawStatus === 'in progress' || rawStatus === 'in-progress') {
        normalizedStatus = 'pending';
    } else if (rawStatus === 'missed' || rawStatus === 'failed' || rawStatus === 'expired') {
        normalizedStatus = 'missed';
    } else {
        // Default to pending if status is unknown
        console.warn(`Unknown task status received: "${statusValue}" for task ${backendTask.id}, defaulting to "pending"`);
        normalizedStatus = 'pending';
    }

    // Safely get fields with fallbacks to handle different backend formats
    const reward = backendTask.amount?.toString() ||
        backendTask.reward?.toString() ||
        '0';

    const assignedTo = backendTask.assignedTo ||
        backendTask.assigned_to ||
        '';

    const dueDate = backendTask.due_date ||
        backendTask.dueDate ||
        new Date().toISOString().split('T')[0]; // Today as default

    const createdAt = backendTask.created_at ||
        backendTask.createdAt ||
        new Date().toISOString(); // Current time as fallback

    const completedAt = backendTask.completed_at !== undefined ? backendTask.completed_at :
        backendTask.completedAt !== undefined ? backendTask.completedAt :
            null;

    // Construct and return the normalized Task object
    return {
        id: backendTask.id,
        title: backendTask.title,
        description: backendTask.description || '',
        reward: reward,
        dueDate: dueDate,
        assignedTo: assignedTo,
        assignedToName: backendTask.assignedToName || '',
        assignedToUsername: backendTask.assignedToUsername || '',
        parentId: backendTask.parentId || backendTask.parent || '',
        status: normalizedStatus,
        createdAt: createdAt,
        completedAt: completedAt,
        category: backendTask.category || 'General',
    };
}

// Transform array of backend tasks to frontend format
export function transformTasksFromBackend(backendTasks: BackendTask[]): Task[] {
    return backendTasks.map(transformTaskFromBackend);
}

/**
 * Extract the first name from a full name
 * @param fullName - The full name (e.g., "John Doe" or "Mary Jane Smith")
 * @returns The first name (e.g., "John" or "Mary")
 */
export function getFirstName(fullName: string | undefined | null): string {
    if (!fullName || typeof fullName !== 'string') {
        return 'Unknown';
    }

    const trimmed = fullName.trim();
    if (!trimmed) {
        return 'Unknown';
    }

    // Split by space and return the first part
    const nameParts = trimmed.split(' ');
    return nameParts[0] || 'Unknown';
}

// Create a properly formatted create task request
export function createTaskRequest(
    title: string,
    description: string,
    assignedToId: string, // Child ID (UUID)
    reward: number,
    dueDate: Date
): CreateTaskRequest {
    return {
        title,
        description,
        assigned_to: assignedToId,
        reward,
        due_date: dueDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    };
}
