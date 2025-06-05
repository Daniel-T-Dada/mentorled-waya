# Next.js API Routes - Comprehensive Study Guide

## Table of Contents
1. [Introduction to API Routes](#introduction-to-api-routes)
2. [File-Based Routing System](#file-based-routing-system)
3. [HTTP Methods in API Routes](#http-methods-in-api-routes)
4. [Dynamic Routes with Parameters](#dynamic-routes-with-parameters)
5. [CRUD Operations Example - Todo App](#crud-operations-example---todo-app)
6. [Request and Response Handling](#request-and-response-handling)
7. [Error Handling](#error-handling)
8. [Testing API Routes](#testing-api-routes)
9. [Best Practices](#best-practices)
10. [Common Patterns](#common-patterns)

---

## Introduction to API Routes

### What are API Routes?
API Routes in Next.js allow you to build backend functionality directly within your Next.js application. They are serverless functions that run on the server and can handle HTTP requests.

### Key Benefits:
- **Full-stack in one codebase**: Frontend and backend in the same project
- **Serverless by default**: Automatically optimized for deployment
- **TypeScript support**: Full type safety across your API
- **File-based routing**: Easy to organize and understand

### Basic Structure:
```typescript
// app/api/example/route.ts

// Import NextResponse from Next.js for handling API responses
import { NextResponse } from 'next/server';

// Export an async function named GET to handle HTTP GET requests
export async function GET() {
    // Return a JSON response with a simple message
    // NextResponse.json() automatically sets Content-Type to application/json
    return NextResponse.json({ message: 'Hello World!' });
}
```

---

## File-Based Routing System

### Core Concept: **File Path = Endpoint URL**

The folder structure in your `app/api` directory directly maps to your API endpoints.

### How it Works:
1. **Create folders** for each route segment
2. **Add `route.ts`** files to define endpoints
3. **Export HTTP method functions** (GET, POST, PUT, DELETE, etc.)

### Examples:

| File Path | URL Endpoint | Description |
|-----------|--------------|-------------|
| `app/api/users/route.ts` | `/api/users` | Users collection endpoint |
| `app/api/users/[id]/route.ts` | `/api/users/123` | Individual user endpoint |
| `app/api/auth/login/route.ts` | `/api/auth/login` | Login endpoint |
| `app/api/products/[category]/route.ts` | `/api/products/electronics` | Products by category |

### Dynamic Routes with Brackets:
- `[id]` = Single dynamic parameter
- `[...slug]` = Catch-all route (multiple segments)
- `[[...slug]]` = Optional catch-all route

| File Path | Endpoint URL | Description |
|-----------|--------------|-------------|
| `app/api/users/route.ts` | `GET /api/users` | Users collection |
| `app/api/users/[id]/route.ts` | `GET /api/users/123` | Specific user |
| `app/api/products/electronics/route.ts` | `GET /api/products/electronics` | Electronics products |
| `app/api/auth/login/route.ts` | `POST /api/auth/login` | Login endpoint |

### File Structure Example:
```
app/
  api/
    users/
      route.ts              → /api/users
      [id]/
        route.ts            → /api/users/[id]
        posts/
          route.ts          → /api/users/[id]/posts
    products/
      route.ts              → /api/products
      [category]/
        route.ts            → /api/products/[category]
        [productId]/
          route.ts          → /api/products/[category]/[productId]
```

---

## HTTP Methods in API Routes

### All HTTP methods go in the same `route.ts` file!

```typescript
// app/api/todos/route.ts

// Import NextResponse for handling HTTP responses
import { NextResponse } from 'next/server';

// GET - Read/Retrieve data
// This function handles all HTTP GET requests to /api/todos
export async function GET() {
    // Add your logic here to fetch todos from database
    // For now, returning empty array as example
    return NextResponse.json({ todos: [] });
}

// POST - Create new data
// This function handles all HTTP POST requests to /api/todos
// The 'request' parameter contains the incoming HTTP request data
export async function POST(request: Request) {
    // Extract JSON data from the request body
    // await is needed because request.json() returns a Promise
    const body = await request.json();
    
    // Add your logic here to create new todo in database
    // The 'body' variable now contains the data sent by the client
    
    // Return the created todo with 201 status (Created)
    // Status 201 indicates successful resource creation
    return NextResponse.json({ todo: body }, { status: 201 });
}

// PUT - Update/Replace entire resource
// This function handles all HTTP PUT requests to /api/todos
export async function PUT(request: Request) {
    // Extract the request body data
    const body = await request.json();
    
    // Add your logic here to update all todos (rarely used for collections)
    // PUT typically replaces the entire resource
    
    // Return success message
    return NextResponse.json({ message: 'Updated' });
}

// PATCH - Partial update
// This function handles all HTTP PATCH requests to /api/todos
export async function PATCH(request: Request) {
    // Extract the request body data
    const body = await request.json();
    
    // Add your logic here to partially update todos
    // PATCH is used for partial updates, not complete replacement
    
    // Return success message
    return NextResponse.json({ message: 'Patched' });
}

// DELETE - Remove data
// This function handles all HTTP DELETE requests to /api/todos
export async function DELETE() {
    // Add your logic here to delete all todos (use with caution!)
    // Usually you'd want confirmation for bulk delete operations
    
    // Return success message
    return NextResponse.json({ message: 'All todos deleted' });
}
```

### Supported HTTP Methods:
- `GET` - Retrieve data
- `POST` - Create new data
- `PUT` - Update/replace entire resource
- `PATCH` - Partial update
- `DELETE` - Remove data
- `HEAD` - Get headers only
- `OPTIONS` - Get allowed methods

---

## Dynamic Routes with Parameters

### Single Parameter:
```typescript
// app/api/users/[id]/route.ts

// Export async GET function to handle GET requests to /api/users/[id]
export async function GET(
    // First parameter: the incoming request object
    request: Request,
    // Second parameter: contains route parameters wrapped in a Promise (Next.js 15+)
    { params }: { params: Promise<{ id: string }> }
) {
    // IMPORTANT: In Next.js 15+, params must be awaited before use
    // Destructure the id from the awaited params object
    const { id } = await params;
    
    // Now you can use the 'id' variable which contains the dynamic route parameter
    // For example, if URL is /api/users/123, then id = "123"
    const user = await getUserById(id);
    
    // Return the user data as JSON response
    return NextResponse.json(user);
}
```

### Multiple Parameters:
```typescript
// app/api/users/[userId]/posts/[postId]/route.ts

// Handle GET requests to /api/users/[userId]/posts/[postId]
export async function GET(
    request: Request,
    // Multiple parameters are available in the same params object
    { params }: { params: Promise<{ userId: string; postId: string }> }
) {
    // Destructure both parameters from the awaited params
    // If URL is /api/users/123/posts/456, then userId="123", postId="456"
    const { userId, postId } = await params;
    
    // Use both parameters in your business logic
    const post = await getPostByUserAndId(userId, postId);
    
    // Return the specific post data
    return NextResponse.json(post);
}
```

### Important Note (Next.js 15+):
- **Always await params**: `const { id } = await params;`
- **Params is a Promise**: `{ params: Promise<{ id: string }> }`

---

## CRUD Operations Example - Todo App

### 1. Collection Routes: `/api/todos/route.ts`

```typescript
import { NextResponse } from 'next/server';

// Sample data store (in real app, use database like PostgreSQL, MongoDB, etc.)
// This is just for demonstration - never use global variables in production!
let todos = [
    { id: '1', title: 'Learn Next.js', completed: false },
    { id: '2', title: 'Build Todo App', completed: true }
];

// GET /api/todos - Get all todos
export async function GET() {
    try {
        // Wrap the main logic in try-catch for error handling
        
        // Return successful response with todos data
        return NextResponse.json({
            success: true,              // Indicates operation was successful
            data: todos,               // The actual todos array
            count: todos.length        // Total number of todos for convenience
        });
    } catch (error) {
        // If any error occurs, return error response
        return NextResponse.json(
            { success: false, error: 'Failed to fetch todos' },
            { status: 500 }  // HTTP 500 = Internal Server Error
        );
    }
}

// POST /api/todos - Create new todo
export async function POST(request: Request) {
    try {
        // Extract JSON data from request body
        // This contains the todo data sent by the client
        const body = await request.json();
        
        // Validation - check if required fields are present
        if (!body.title) {
            // Return 400 Bad Request if validation fails
            return NextResponse.json(
                { success: false, error: 'Title is required' },
                { status: 400 }  // HTTP 400 = Bad Request
            );
        }
        
        // Create new todo object with provided and default values
        const newTodo = {
            // Generate unique ID using timestamp (use proper UUID in production)
            id: Date.now().toString(),
            title: body.title,                      // Title from request
            completed: body.completed || false,     // Default to false if not provided
            createdAt: new Date().toISOString()     // Add timestamp
        };
        
        // Add the new todo to our array (in real app, save to database)
        todos.push(newTodo);
        
        // Return success response with the created todo
        return NextResponse.json({
            success: true,
            data: newTodo,                          // Return the created todo
            message: 'Todo created successfully'
        }, { status: 201 });  // HTTP 201 = Created
        
    } catch (error) {
        // Handle any errors (JSON parsing, validation, etc.)
        return NextResponse.json(
            { success: false, error: 'Failed to create todo' },
            { status: 500 }
        );
    }
}

// DELETE /api/todos - Delete all todos
export async function DELETE() {
    try {
        // Store count before deletion for response message
        const deletedCount = todos.length;
        
        // Clear the todos array (in real app, delete from database)
        todos = [];
        
        // Return success response with count of deleted items
        return NextResponse.json({
            success: true,
            message: `Deleted ${deletedCount} todos`
        });
    } catch (error) {
        // Handle deletion errors
        return NextResponse.json(
            { success: false, error: 'Failed to delete todos' },
            { status: 500 }
        );
    }
}
```

### 2. Individual Resource Routes: `/api/todos/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';

// GET /api/todos/[id] - Get specific todo
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Extract the todo ID from the URL parameters
        const { id } = await params;
        
        // Search for the todo with matching ID in our array
        // In real app, this would be a database query like: SELECT * FROM todos WHERE id = ?
        const todo = todos.find(t => t.id === id);
        
        // Check if todo was found
        if (!todo) {
            // Return 404 Not Found if todo doesn't exist
            return NextResponse.json(
                { success: false, error: 'Todo not found' },
                { status: 404 }  // HTTP 404 = Not Found
            );
        }
        
        // Return the found todo
        return NextResponse.json({
            success: true,
            data: todo
        });
    } catch (error) {
        // Handle any errors during the operation
        return NextResponse.json(
            { success: false, error: 'Failed to fetch todo' },
            { status: 500 }
        );
    }
}

// PUT /api/todos/[id] - Update entire todo
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get the todo ID from URL parameters
        const { id } = await params;
        
        // Get the new todo data from request body
        const body = await request.json();
        
        // Find the index of the todo to update
        // We need the index to replace the todo in the array
        const todoIndex = todos.findIndex(t => t.id === id);
        
        // Check if todo exists
        if (todoIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Todo not found' },
                { status: 404 }
            );
        }
          // PUT replaces the entire resource, so we create a completely new object
        const updatedTodo = {
            id: id,                                    // Keep the same ID
            title: body.title,                     // New title from request
            completed: body.completed,             // New completed status
            updatedAt: new Date().toISOString()    // Add update timestamp
        };
        
        // Replace the todo at the found index
        todos[todoIndex] = updatedTodo;
        
        // Return the updated todo
        return NextResponse.json({
            success: true,
            data: updatedTodo,
            message: 'Todo updated successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update todo' },
            { status: 500 }
        );
    }
}

// PATCH /api/todos/[id] - Partial update
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get todo ID from URL parameters
        const { id } = await params;
        
        // Get partial data from request body
        const body = await request.json();
        
        // Find the todo to update
        const todoIndex = todos.findIndex(t => t.id === id);
        
        if (todoIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Todo not found' },
                { status: 404 }
            );
        }
        
        // PATCH updates only the provided fields, keeps the rest unchanged
        // Using spread operator to merge existing todo with new data
        todos[todoIndex] = {
            ...todos[todoIndex],              // Keep all existing properties
            ...body,                          // Overwrite with new properties from request
            updatedAt: new Date().toISOString() // Always update the timestamp
        };
        
        return NextResponse.json({
            success: true,
            data: todos[todoIndex],
            message: 'Todo updated successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update todo' },
            { status: 500 }
        );
    }
}

// DELETE /api/todos/[id] - Delete specific todo
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get todo ID from URL parameters
        const { id } = await params;
        
        // Find the index of the todo to delete
        const todoIndex = todos.findIndex(t => t.id === id);
        
        if (todoIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Todo not found' },
                { status: 404 }
            );
        }
        
        // Remove the todo from array and get the deleted todo
        // splice(index, 1) removes 1 element at the specified index and returns it
        const deletedTodo = todos.splice(todoIndex, 1)[0];
        
        return NextResponse.json({
            success: true,
            data: deletedTodo,                    // Return the deleted todo for confirmation
            message: 'Todo deleted successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to delete todo' },
            { status: 500 }
        );
    }
}
```

---

## Request and Response Handling

### 1. Reading Request Data

```typescript
// app/api/users/route.ts

export async function POST(request: Request) {
    // 1. JSON Data
    const jsonData = await request.json();
    console.log('Body:', jsonData);
    
    // 2. URL Search Parameters (query strings like ?name=john&age=25)
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');      // Gets 'john'
    const age = searchParams.get('age');        // Gets '25'
    
    // 3. Headers
    const contentType = request.headers.get('content-type');
    const authorization = request.headers.get('authorization');
    
    // 4. Method and URL
    console.log('Method:', request.method);     // POST
    console.log('URL:', request.url);          // Full URL
    
    return NextResponse.json({ received: 'ok' });
}
```

### 2. Sending Response Data

```typescript
export async function GET() {
    // 1. Simple JSON Response
    return NextResponse.json({ message: 'Hello' });
    
    // 2. JSON with Custom Status
    return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
    );
    
    // 3. JSON with Custom Headers
    return NextResponse.json(
        { data: 'success' },
        {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache',
                'X-Custom-Header': 'value'
            }
        }
    );
    
    // 4. Text Response
    return new Response('Plain text', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
    });
    
    // 5. Redirect Response
    return NextResponse.redirect(new URL('/login', request.url));
}
```

---

## Error Handling

### 1. Comprehensive Error Handler

```typescript
// lib/errorHandler.ts

// Define custom error types for better error handling
export class ApiError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Error handler function that can be reused across API routes
export function handleApiError(error: unknown) {
    console.error('API Error:', error);
    
    // Handle known ApiError instances
    if (error instanceof ApiError) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                code: error.code
            },
            { status: error.statusCode }
        );
    }
    
    // Handle validation errors (could be from Zod, Joi, etc.)
    if (error instanceof Error && error.name === 'ValidationError') {
        return NextResponse.json(
            {
                success: false,
                error: 'Validation failed',
                details: error.message
            },
            { status: 400 }
        );
    }
    
    // Handle unknown errors
    return NextResponse.json(
        {
            success: false,
            error: 'Internal server error'
        },
        { status: 500 }
    );
}
```

### 2. Using Error Handler in Routes

```typescript
// app/api/users/route.ts
import { handleApiError, ApiError } from '@/lib/errorHandler';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Validate required fields
        if (!body.email) {
            throw new ApiError('Email is required', 400, 'MISSING_EMAIL');
        }
        
        // Check if user already exists
        const existingUser = await findUserByEmail(body.email);
        if (existingUser) {
            throw new ApiError('User already exists', 409, 'USER_EXISTS');
        }
        
        // Create user logic here...
        const user = await createUser(body);
        
        return NextResponse.json({
            success: true,
            data: user
        });
        
    } catch (error) {
        // Use our centralized error handler
        return handleApiError(error);
    }
}
```

---

## Testing API Routes

### 1. Testing with Jest

```typescript
// __tests__/api/todos.test.ts

import { GET, POST } from '@/app/api/todos/route';
import { NextRequest } from 'next/server';

// Mock database or data source
jest.mock('@/lib/database', () => ({
    getTodos: jest.fn(),
    createTodo: jest.fn()
}));

describe('/api/todos', () => {
    describe('GET', () => {
        it('should return all todos', async () => {
            // Arrange: Set up mock data
            const mockTodos = [
                { id: '1', title: 'Test Todo', completed: false }
            ];
            
            // Mock the database function
            require('@/lib/database').getTodos.mockResolvedValue(mockTodos);
            
            // Act: Call the API route function
            const response = await GET();
            const data = await response.json();
            
            // Assert: Check the response
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toEqual(mockTodos);
        });
    });
    
    describe('POST', () => {
        it('should create a new todo', async () => {
            // Arrange
            const newTodo = { title: 'New Todo', completed: false };
            const createdTodo = { id: '1', ...newTodo };
            
            require('@/lib/database').createTodo.mockResolvedValue(createdTodo);
            
            const request = new NextRequest('http://localhost:3000/api/todos', {
                method: 'POST',
                body: JSON.stringify(newTodo),
                headers: { 'Content-Type': 'application/json' }
            });
            
            // Act
            const response = await POST(request);
            const data = await response.json();
            
            // Assert
            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.title).toBe(newTodo.title);
        });
        
        it('should return 400 for invalid data', async () => {
            // Arrange: Empty request body
            const request = new NextRequest('http://localhost:3000/api/todos', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'Content-Type': 'application/json' }
            });
            
            // Act
            const response = await POST(request);
            const data = await response.json();
            
            // Assert
            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });
});
```

---

## Best Practices

### 1. **Always Use Try-Catch Blocks**
```typescript
export async function GET() {
    try {
        // Your logic here
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
```

### 2. **Validate Input Data**
```typescript
import { z } from 'zod';

const TodoSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    completed: z.boolean().optional()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Validate using Zod schema
        const validatedData = TodoSchema.parse(body);
        
        // Now validatedData is type-safe and validated
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, errors: error.errors },
                { status: 400 }
            );
        }
    }
}
```

### 3. **Use Consistent Response Format**
```typescript
// Success response
{
    success: true,
    data: { /* your data */ },
    message?: string
}

// Error response
{
    success: false,
    error: string,
    code?: string,
    details?: any
}
```

### 4. **Handle Authentication**
```typescript
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
    const session = await getServerSession();
    
    if (!session) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }
    
    // Protected logic here
}
```

### 5. **Use Environment Variables for Secrets**
```typescript
// Never hardcode secrets in your code!
const API_KEY = process.env.API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!API_KEY) {
    throw new Error('API_KEY environment variable is required');
}
```

---

## Common Patterns

### 1. **Pagination**
```typescript
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters with defaults
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Fetch data with pagination
    const todos = await getTodos({ skip, limit });
    const total = await getTodosCount();
    
    return NextResponse.json({
        success: true,
        data: todos,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
}
```

### 2. **Search and Filtering**
```typescript
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const search = searchParams.get('search') || '';
    const completed = searchParams.get('completed');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Build filter object
    const filters: any = {};
    if (completed !== null) {
        filters.completed = completed === 'true';
    }
    
    // Fetch filtered data
    const todos = await getTodos({
        search,
        filters,
        sortBy,
        order
    });
    
    return NextResponse.json({
        success: true,
        data: todos,
        filters: { search, completed, sortBy, order }
    });
}
```

### 3. **File Upload Handling**
```typescript
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type' },
                { status: 400 }
            );
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File too large' },
                { status: 400 }
            );
        }
        
        // Process the file (save to disk, upload to cloud, etc.)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Save file logic here...
        
        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully'
        });
        
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Upload failed' },
            { status: 500 }
        );
    }
}
```

---

# 🚀 10 Practical CRUD Projects for Practice

## 1. **Simple Notes App**
*Difficulty: Beginner*

**Description**: A basic note-taking application where users can create, read, update, and delete notes.

**API Routes to Create**:
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

**Data Structure**:
```typescript
interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}
```

**Key Learning Points**:
- Basic CRUD operations
- Request/response handling
- Data validation with Zod
- Error handling patterns

**Sample Implementation**:
```typescript
// app/api/notes/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const NoteSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required')
});

let notes: Note[] = [];

export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: notes,
            count: notes.length
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notes' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = NoteSchema.parse(body);
        
        const newNote: Note = {
            id: Date.now().toString(),
            ...validatedData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        notes.push(newNote);
        
        return NextResponse.json({
            success: true,
            data: newNote
        }, { status: 201 });
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { success: false, error: 'Failed to create note' },
            { status: 500 }
        );
    }
}
```

---

## 2. **Contact Manager**
*Difficulty: Beginner-Intermediate*

**Description**: A contact management system to store and organize personal/business contacts.

**API Routes to Create**:
- `GET /api/contacts` - Get all contacts (with search/filter)
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/[id]` - Get specific contact
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact
- `GET /api/contacts/search` - Search contacts by name/email

**Data Structure**:
```typescript
interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    notes?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}
```

**Key Learning Points**:
- Search functionality with query parameters
- Data validation for complex objects
- Optional fields handling
- Array fields (tags)

---

## 3. **Expense Tracker**
*Difficulty: Intermediate*

**Description**: A personal finance app to track income and expenses with categories.

**API Routes to Create**:
- `GET /api/expenses` - Get expenses (with date range, category filters)
- `POST /api/expenses` - Add new expense
- `GET /api/expenses/[id]` - Get specific expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense
- `GET /api/expenses/categories` - Get all categories
- `GET /api/expenses/summary` - Get expense summary/analytics

**Data Structure**:
```typescript
interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    type: 'income' | 'expense';
    paymentMethod?: 'cash' | 'card' | 'bank_transfer';
    tags: string[];
    createdAt: string;
    updatedAt: string;
}
```

**Key Learning Points**:
- Date range filtering
- Numeric data validation
- Enums and union types
- Aggregation/summary endpoints

---

## 4. **Recipe Manager**
*Difficulty: Intermediate*

**Description**: A recipe collection app with ingredients, instructions, and ratings.

**API Routes to Create**:
- `GET /api/recipes` - Get all recipes (with search, filter by cuisine/difficulty)
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/[id]` - Get specific recipe
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `POST /api/recipes/[id]/rating` - Rate a recipe
- `GET /api/recipes/search` - Search by ingredients/name

**Data Structure**:
```typescript
interface Recipe {
    id: string;
    title: string;
    description: string;
    cuisine: string;
    difficulty: 'easy' | 'medium' | 'hard';
    prepTime: number; // minutes
    cookTime: number; // minutes
    servings: number;
    ingredients: Ingredient[];
    instructions: string[];
    imageUrl?: string;
    ratings: Rating[];
    averageRating: number;
    createdAt: string;
    updatedAt: string;
}

interface Ingredient {
    name: string;
    amount: string;
    unit: string;
}

interface Rating {
    id: string;
    score: number; // 1-5
    comment?: string;
    createdAt: string;
}
```

**Key Learning Points**:
- Nested object structures
- Array manipulation
- Rating/averaging calculations
- Complex search functionality

---

## 5. **Library Book Management**
*Difficulty: Intermediate*

**Description**: A library system to manage books, authors, and borrowing records.

**API Routes to Create**:
- `GET /api/books` - Get all books (with availability status)
- `POST /api/books` - Add new book
- `GET /api/books/[id]` - Get specific book
- `PUT /api/books/[id]` - Update book
- `DELETE /api/books/[id]` - Delete book
- `POST /api/books/[id]/borrow` - Borrow a book
- `POST /api/books/[id]/return` - Return a book
- `GET /api/authors` - Get all authors
- `GET /api/borrowing-history` - Get borrowing history

**Data Structure**:
```typescript
interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    genre: string;
    publishedYear: number;
    pages: number;
    description: string;
    status: 'available' | 'borrowed' | 'maintenance';
    borrowedBy?: string;
    borrowedDate?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

interface BorrowingRecord {
    id: string;
    bookId: string;
    borrowerName: string;
    borrowerEmail: string;
    borrowedDate: string;
    dueDate: string;
    returnedDate?: string;
    status: 'active' | 'returned' | 'overdue';
}
```

**Key Learning Points**:
- Status management
- Date calculations (due dates)
- Business logic (borrowing rules)
- Related data management

---

## 6. **Event Management System**
*Difficulty: Intermediate-Advanced*

**Description**: An event planning platform where users can create events and manage attendees.

**API Routes to Create**:
- `GET /api/events` - Get events (with date filters, status)
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get specific event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `POST /api/events/[id]/register` - Register for event
- `DELETE /api/events/[id]/register` - Unregister from event
- `GET /api/events/[id]/attendees` - Get event attendees
- `PUT /api/events/[id]/status` - Update event status

**Data Structure**:
```typescript
interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    maxAttendees?: number;
    currentAttendees: number;
    price: number;
    category: string;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    organizer: string;
    imageUrl?: string;
    requirements?: string[];
    attendees: Attendee[];
    createdAt: string;
    updatedAt: string;
}

interface Attendee {
    id: string;
    name: string;
    email: string;
    registeredAt: string;
    status: 'registered' | 'checked-in' | 'no-show';
}
```

**Key Learning Points**:
- Complex state management
- Registration/capacity limits
- Date/time handling
- Event lifecycle management

---

## 7. **Inventory Management**
*Difficulty: Advanced*

**Description**: A warehouse inventory system to track products, stock levels, and movements.

**API Routes to Create**:
- `GET /api/products` - Get products (with stock alerts, categories)
- `POST /api/products` - Add new product
- `GET /api/products/[id]` - Get specific product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `POST /api/products/[id]/stock-in` - Add stock
- `POST /api/products/[id]/stock-out` - Remove stock
- `GET /api/inventory/movements` - Get stock movements history
- `GET /api/inventory/alerts` - Get low stock alerts
- `GET /api/inventory/reports` - Get inventory reports

**Data Structure**:
```typescript
interface Product {
    id: string;
    name: string;
    description: string;
    sku: string;
    category: string;
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    unitPrice: number;
    cost: number;
    supplier?: string;
    location: string;
    status: 'active' | 'discontinued' | 'out-of-stock';
    createdAt: string;
    updatedAt: string;
}

interface StockMovement {
    id: string;
    productId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason: string;
    reference?: string;
    performedBy: string;
    createdAt: string;
}
```

**Key Learning Points**:
- Stock level calculations
- Movement tracking
- Alert systems
- Reporting endpoints
- Business validation rules

---

## 8. **Blog/CMS System**
*Difficulty: Advanced*

**Description**: A content management system with posts, categories, tags, and comments.

**API Routes to Create**:
- `GET /api/posts` - Get posts (with pagination, status filter)
- `POST /api/posts` - Create new post
- `GET /api/posts/[slug]` - Get post by slug
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `PUT /api/posts/[id]/status` - Change post status
- `GET /api/posts/[id]/comments` - Get post comments
- `POST /api/posts/[id]/comments` - Add comment
- `GET /api/categories` - Get all categories
- `GET /api/tags` - Get all tags

**Data Structure**:
```typescript
interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    author: string;
    category: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    publishedAt?: string;
    viewCount: number;
    seoTitle?: string;
    seoDescription?: string;
    createdAt: string;
    updatedAt: string;
}

interface Comment {
    id: string;
    postId: string;
    author: string;
    email: string;
    content: string;
    status: 'pending' | 'approved' | 'spam';
    parentId?: string; // for nested comments
    createdAt: string;
}
```

**Key Learning Points**:
- SEO considerations (slugs, meta data)
- Content status workflows
- Nested comments
- View counting
- Rich content handling

---

## 9. **Task/Project Management**
*Difficulty: Advanced*

**Description**: A project management system with projects, tasks, assignments, and time tracking.

**API Routes to Create**:
- `GET /api/projects` - Get projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get specific project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `GET /api/projects/[id]/tasks` - Get project tasks
- `POST /api/projects/[id]/tasks` - Create task in project
- `PUT /api/tasks/[id]` - Update task
- `PUT /api/tasks/[id]/assign` - Assign task to user
- `POST /api/tasks/[id]/time` - Log time on task
- `GET /api/reports/time` - Time tracking reports

**Data Structure**:
```typescript
interface Project {
    id: string;
    name: string;
    description: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    startDate: string;
    dueDate?: string;
    completedDate?: string;
    budget?: number;
    owner: string;
    team: string[];
    progress: number; // 0-100
    createdAt: string;
    updatedAt: string;
}

interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    estimatedHours?: number;
    actualHours: number;
    dueDate?: string;
    dependencies: string[]; // task IDs
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

interface TimeLog {
    id: string;
    taskId: string;
    userId: string;
    hours: number;
    description: string;
    date: string;
    createdAt: string;
}
```

**Key Learning Points**:
- Complex relationships (projects → tasks → time logs)
- Status workflows
- Time tracking
- Progress calculations
- Dependencies management

---

## 10. **E-commerce Product Catalog**
*Difficulty: Expert*

**Description**: A full e-commerce backend with products, variants, inventory, orders, and cart management.

**API Routes to Create**:
- `GET /api/products` - Get products (with filters, sorting, pagination)
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product with variants
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `POST /api/products/[id]/variants` - Add product variant
- `GET /api/categories` - Get category tree
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[itemId]` - Update cart item
- `DELETE /api/cart/[itemId]` - Remove from cart
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]/status` - Update order status

**Data Structure**:
```typescript
interface Product {
    id: string;
    name: string;
    description: string;
    slug: string;
    category: string;
    brand: string;
    basePrice: number;
    currency: string;
    status: 'active' | 'inactive' | 'out-of-stock';
    images: string[];
    variants: ProductVariant[];
    attributes: ProductAttribute[];
    seo: SEOData;
    inventory: InventoryData;
    shipping: ShippingData;
    createdAt: string;
    updatedAt: string;
}

interface ProductVariant {
    id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
    attributes: { [key: string]: string }; // color: "red", size: "L"
    image?: string;
    weight?: number;
}

interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    addedAt: string;
}

interface Order {
    id: string;
    orderNumber: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
    customer: CustomerData;
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
}
```

**Key Learning Points**:
- Complex product data modeling
- Inventory management
- Shopping cart logic
- Order processing workflows
- Price calculations
- Multi-variant products
- Advanced filtering and search

---

## 🎯 Practice Progression Guide

### Week 1-2: Master the Basics
- Complete Projects 1-3 (Notes, Contacts, Expenses)
- Focus on understanding CRUD fundamentals
- Practice error handling and validation

### Week 3-4: Add Complexity
- Complete Projects 4-6 (Recipes, Library, Events)
- Learn relationship management
- Implement search and filtering

### Week 5-6: Advanced Features
- Complete Projects 7-9 (Inventory, Blog, Project Management)
- Master complex business logic
- Implement reporting and analytics

### Week 7-8: Expert Level
- Complete Project 10 (E-commerce)
- Handle multiple entity relationships
- Implement advanced features

### Tips for Success:
1. **Start Simple**: Begin with basic CRUD, then add features
2. **Test Everything**: Write tests for each endpoint
3. **Use TypeScript**: Type safety will save you time
4. **Document APIs**: Create clear API documentation
5. **Handle Errors**: Always include proper error handling
6. **Validate Input**: Never trust user input
7. **Think Security**: Consider authentication and authorization

---

## 📚 Additional Resources

### Recommended Tools:
- **Validation**: Zod, Joi, or Yup
- **Testing**: Jest, Vitest
- **API Testing**: Postman, Insomnia, Thunder Client
- **Database**: Prisma + PostgreSQL, Mongoose + MongoDB
- **Documentation**: Swagger/OpenAPI

### Next Steps:
1. Add database integration (Prisma/Drizzle)
2. Implement authentication (NextAuth.js)
3. Add real-time features (WebSockets)
4. Deploy to production (Vercel, Railway)
5. Add monitoring and logging

Happy coding! 🚀
