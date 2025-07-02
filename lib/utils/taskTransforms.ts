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
}

// Backend task interface (snake_case) - Updated to match ChoreReadSerializer
export interface BackendTask {
    id: string;
    title: string;
    description: string;
    amount: string; // Backend field name for reward
    due_date?: string;
    assignedTo: string; // Child ID (UUID)
    assignedToName?: string; // Child's display name
    assignedToUsername?: string; // Child's username
    parentId?: string;
    status: 'pending' | 'completed' | 'missed';
    createdAt: string;
    completedAt: string | null;
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
export function transformTaskToBackend(frontendTask: Partial<Task>): Partial<BackendTask> {
    const backendTask: Partial<BackendTask> = {};

    if (frontendTask.id !== undefined) backendTask.id = frontendTask.id;
    if (frontendTask.title !== undefined) backendTask.title = frontendTask.title;
    if (frontendTask.description !== undefined) backendTask.description = frontendTask.description;
    if (frontendTask.reward !== undefined) backendTask.amount = frontendTask.reward;
    if (frontendTask.dueDate !== undefined) backendTask.due_date = frontendTask.dueDate;
    if (frontendTask.assignedTo !== undefined) backendTask.assignedTo = frontendTask.assignedTo;
    if (frontendTask.assignedToName !== undefined) backendTask.assignedToName = frontendTask.assignedToName;
    if (frontendTask.assignedToUsername !== undefined) backendTask.assignedToUsername = frontendTask.assignedToUsername;
    if (frontendTask.parentId !== undefined) backendTask.parentId = frontendTask.parentId;
    if (frontendTask.status !== undefined) backendTask.status = frontendTask.status;
    if (frontendTask.createdAt !== undefined) backendTask.createdAt = frontendTask.createdAt;
    if (frontendTask.completedAt !== undefined) backendTask.completedAt = frontendTask.completedAt;

    return backendTask;
}

// Transform backend task data to frontend format
export function transformTaskFromBackend(backendTask: BackendTask): Task {
    return {
        id: backendTask.id,
        title: backendTask.title,
        description: backendTask.description,
        reward: backendTask.amount,
        dueDate: backendTask.due_date || '',
        assignedTo: backendTask.assignedTo,
        assignedToName: backendTask.assignedToName,
        assignedToUsername: backendTask.assignedToUsername,
        parentId: backendTask.parentId,
        status: backendTask.status,
        createdAt: backendTask.createdAt,
        completedAt: backendTask.completedAt,
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
