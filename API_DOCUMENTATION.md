# Waya Backend API Documentation

## Overview
This document provides comprehensive API documentation for the Waya Backend application. All endpoints have been tested and verified to be working correctly.

**Base URL:** `http://127.0.0.1:8000` (Development)  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

---

## Authentication & User Management

### 1. User Registration
**Endpoint:** `POST /api/users/register/`  
**Permission:** Public  
**Description:** Register a new user account

#### Request
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "SecurePassword123!",
  "password2": "SecurePassword123!",
  "role": "parent",
  "terms_accepted": true
}
```

#### Response (201 Created)
```json
{
  "message": "Registration successful! Check your email to verify your account."
}
```

#### Response (400 Bad Request)
```json
{
  "email": ["A user with this email already exists."],
  "password": ["Password fields didn't match."]
}
```

---

### 2. Email Verification (GET)
**Endpoint:** `GET /api/users/email-verify/`  
**Permission:** Public  
**Description:** Verify user email via email link click

#### Request Parameters
- `uidb64` (string): Encoded user ID
- `token` (string): Verification token

#### Example Request
```
GET /api/users/email-verify/?uidb64=ZDNkM2M5NWItZjk0ZC00NTI3LTllMDMtZTEzMTUxMmY5MDNh&token=ffae282d-347a-4e0c-b56e-98e5db93a078
```

#### Response (200 OK)
```json
{
  "message": "Email verified successfully!"
}
```

#### Response (400 Bad Request)
```json
{
  "detail": "Invalid verification link."
}
```

---

### 3. Email Verification (POST)
**Endpoint:** `POST /api/users/email-verify/`  
**Permission:** Public  
**Description:** Verify user email via API call

#### Request
```json
{
  "uidb64": "ZDNkM2M5NWItZjk0ZC00NTI3LTllMDMtZTEzMTUxMmY5MDNh",
  "token": "ffae282d-347a-4e0c-b56e-98e5db93a078"
}
```

#### Response (200 OK)
```json
{
  "message": "Email verified successfully!"
}
```

---

### 4. User Login
**Endpoint:** `POST /api/users/login/`  
**Permission:** Public  
**Description:** Authenticate user and get JWT tokens

#### Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Response (200 OK)
```json
{
  "id": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "name": "John Doe",
  "email": "user@example.com",
  "avatar": null,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (401 Unauthorized)
```json
{
  "detail": "Invalid credentials"
}
```

---

### 5. Home/Health Check
**Endpoint:** `GET /api/users/`  
**Permission:** Public  
**Description:** API health check endpoint

#### Response (200 OK)
```json
{
  "message": "Welcome to the Waya Backend API"
}
```

---

### 6. Password Reset Request
**Endpoint:** `POST /api/users/password-reset/`  
**Permission:** Public  
**Description:** Request password reset email

#### Request
```json
{
  "email": "user@example.com"
}
```

#### Response (200 OK)
```json
{
  "message": "Password reset email sent if the email is registered."
}
```

---

### 7. Forgot Password (Alternative)
**Endpoint:** `POST /api/users/forgot-password/`  
**Permission:** Public  
**Description:** Alternative password reset endpoint

#### Request
```json
{
  "email": "user@example.com"
}
```

#### Response (200 OK)
```json
{
  "detail": "Password reset email sent."
}
```

---

### 8. Password Change
**Endpoint:** `PUT /api/users/password-change/`  
**Permission:** Authenticated Users  
**Description:** Change user password (requires authentication)

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Request
```json
{
  "old_password": "CurrentPassword123!",
  "new_password": "NewPassword123!"
}
```

#### Response (200 OK)
```json
{
  "message": "Password changed successfully"
}
```

#### Response (400 Bad Request)
```json
{
  "old_password": ["Old password is not correct."]
}
```

---

### 9. Password Reset Confirmation
**Endpoint:** `POST /api/users/reset-password-confirm/`  
**Permission:** Public  
**Description:** Confirm password reset with new password

#### Request
```json
{
  "new_password1": "NewPassword123!",
  "new_password2": "NewPassword123!"
}
```

#### Response (200 OK)
```json
{
  "detail": "Password has been reset successfully."
}
```

---

## Children Management

### 1. Create Child
**Endpoint:** `POST /api/children/create/`  
**Permission:** Authenticated Parents  
**Description:** Create a new child profile

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Request
```json
{
  "username": "johnny",
  "pin": "1234"
}
```

#### Response (201 Created)
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "johnny",
  "avatar": null
}
```

#### Response (400 Bad Request)
```json
{
  "username": ["Username already exists."],
  "pin": ["PIN must be exactly 4 digits."]
}
```

---

### 2. List Children
**Endpoint:** `GET /api/children/list/`  
**Permission:** Authenticated Parents  
**Description:** Get list of children belonging to the authenticated parent

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "parent": "d3d3c95b-f94d-4527-9e03-e131512f903a",
    "username": "johnny",
    "avatar": null,
    "created_at": "2024-12-19T10:30:00Z"
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "parent": "d3d3c95b-f94d-4527-9e03-e131512f903a",
    "username": "mary",
    "avatar": null,
    "created_at": "2024-12-19T11:45:00Z"
  }
]
```

---

### 3. Child Detail
**Endpoint:** `GET /api/children/{child_id}/`  
**Permission:** Authenticated Parents (Only child's parent)  
**Description:** Get detailed information about a specific child

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parent": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "username": "johnny",
  "avatar": null,
  "created_at": "2024-12-19T10:30:00Z"
}
```

#### Response (404 Not Found)
```json
{
  "detail": "Not found."
}
```

---

### 4. Update Child
**Endpoint:** `PUT /api/children/{child_id}/update/`  
**Permission:** Authenticated Parents (Only child's parent)  
**Description:** Update child information

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Request
```json
{
  "username": "johnny_updated",
  "pin": "5678"
}
```

#### Response (200 OK)
```json
{
  "username": "johnny_updated",
  "avatar": null
}
```

---

### 5. Delete Child
**Endpoint:** `DELETE /api/children/{child_id}/delete/`  
**Permission:** Authenticated Parents (Only child's parent)  
**Description:** Delete a child profile

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (204 No Content)
```
(Empty response body)
```

#### Response (404 Not Found)
```json
{
  "detail": "Not found."
}
```

---

### 6. Child Login
**Endpoint:** `POST /api/children/login/`  
**Permission:** Public  
**Description:** Authenticate a child using username and PIN

#### Request
```json
{
  "username": "johnny",
  "pin": "1234"
}
```

#### Response (200 OK)
```json
{
  "childId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "childUsername": "johnny",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (401 Unauthorized)
```json
{
  "detail": "Invalid credentials"
}
```

---

## Task Management

### 1. Create Task
**Endpoint:** `POST /api/taskmaster/tasks/create/`  
**Permission:** Authenticated Parents  
**Description:** Create a new task for a child

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Request
```json
{
  "title": "Clean Your Room",
  "description": "Make your bed and organize your toys",
  "reward": "5.00",
  "due_date": "2024-12-25",
  "assignedTo": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a"
}
```

#### Response (201 Created)
```json
{
  "id": "task123-4567-8901-2345-678901234567",
  "title": "Clean Your Room",
  "description": "Make your bed and organize your toys",
  "reward": "5.00",
  "due_date": "2024-12-25",
  "assignedTo": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "status": "pending",
  "created_at": "2024-12-19T12:00:00Z",
  "completed_at": null
}
```

#### Response (400 Bad Request)
```json
{
  "assignedTo": ["Child not found."],
  "due_date": ["Due date cannot be in the past."]
}
```

---

### 2. List Tasks
**Endpoint:** `GET /api/taskmaster/tasks/list/`  
**Permission:** Authenticated Users  
**Description:** Get list of tasks (filtered based on user role)

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "task123-4567-8901-2345-678901234567",
      "title": "Clean Your Room",
      "description": "Make your bed and organize your toys",
      "reward": "5.00",
      "due_date": "2024-12-25",
      "assignedTo": "johnny",
      "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
      "status": "pending",
      "created_at": "2024-12-19T12:00:00Z",
      "completed_at": null
    }
  ]
}
```

---

### 3. Task Detail
**Endpoint:** `GET /api/taskmaster/tasks/{task_id}/`  
**Permission:** Authenticated Users (Task participants only)  
**Description:** Get detailed information about a specific task

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)
```json
{
  "id": "task123-4567-8901-2345-678901234567",
  "title": "Clean Your Room",
  "description": "Make your bed and organize your toys",
  "reward": "5.00",
  "due_date": "2024-12-25",
  "assignedTo": "johnny",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "status": "pending",
  "created_at": "2024-12-19T12:00:00Z",
  "completed_at": null
}
```

---

### 4. Update Task
**Endpoint:** `PUT /api/taskmaster/tasks/{task_id}/update/`  
**Permission:** Authenticated Parents (Task creator only)  
**Description:** Update task information

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Request
```json
{
  "title": "Clean Your Room - Updated",
  "description": "Make your bed, organize toys, and vacuum",
  "reward": "7.50",
  "due_date": "2024-12-26",
  "assignedTo": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a"
}
```

#### Response (200 OK)
```json
{
  "id": "task123-4567-8901-2345-678901234567",
  "title": "Clean Your Room - Updated",
  "description": "Make your bed, organize toys, and vacuum",
  "reward": "7.50",
  "due_date": "2024-12-26",
  "assignedTo": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "status": "pending",
  "created_at": "2024-12-19T12:00:00Z",
  "completed_at": null
}
```

---

### 5. Update Task Status
**Endpoint:** `PATCH /api/taskmaster/tasks/{task_id}/status/`  
**Permission:** Authenticated Users (Task participants)  
**Description:** Update task status (complete, approve, etc.)

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Request
```json
{
  "status": "completed"
}
```

#### Available Status Options:
- `pending`: Task is assigned but not started
- `in_progress`: Task is being worked on
- `completed`: Task is completed by child
- `approved`: Task is approved by parent
- `rejected`: Task is rejected by parent

#### Response (200 OK)
```json
{
  "status": "completed"
}
```

---

### 6. Delete Task
**Endpoint:** `DELETE /api/taskmaster/tasks/{task_id}/delete/`  
**Permission:** Authenticated Parents (Task creator only)  
**Description:** Delete a task

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (204 No Content)
```
(Empty response body)
```

---

## Error Responses

### Common HTTP Status Codes

#### 400 Bad Request
```json
{
  "field_name": ["Error message describing the validation issue."]
}
```

#### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

#### 404 Not Found
```json
{
  "detail": "Not found."
}
```

#### 500 Internal Server Error
```json
{
  "detail": "Server error: Internal server error message"
}
```

---

## Authentication

### JWT Token Usage
Include the JWT token in the Authorization header for protected endpoints:

```
Authorization: Bearer <your_jwt_token>
```

### Token Refresh
Use the refresh token to get a new access token when it expires. The token lifetimes are:
- **Access Token:** 30 minutes
- **Refresh Token:** 1 day

---

## Data Types

### Field Types and Validations

- **Email:** Valid email format required
- **Password:** Minimum 8 characters, must include letters and numbers
- **PIN:** Exactly 4 digits
- **UUID:** Standard UUID format
- **Date:** YYYY-MM-DD format
- **DateTime:** ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- **Decimal:** Two decimal places for monetary values

### Child PIN Requirements
- Must be exactly 4 digits
- Cannot contain letters or special characters
- Used for child authentication

### Task Status Flow
```
pending → in_progress → completed → approved/rejected
```

---

## Notes for Frontend Implementation

1. **Authentication Flow:**
   - Register → Email Verification → Login → Get JWT Token
   - Include JWT token in all authenticated requests

2. **Child Management:**
   - Only parents can create/manage children
   - Children can only access their own tasks
   - PIN validation is strict (4 digits only)

3. **Task Management:**
   - Parents create tasks and assign to children
   - Children can update task status to "completed"
   - Parents can approve/reject completed tasks
   - Due dates cannot be in the past

4. **Error Handling:**
   - Always check response status codes
   - Display appropriate error messages from response body
   - Handle token expiration gracefully

5. **Pagination:**
   - Task lists support pagination
   - Use `next` and `previous` fields in response for navigation

---

## Testing Information

All endpoints have been thoroughly tested and verified to work correctly. The API uses:
- **Database:** PostgreSQL
- **Email Backend:** Gmail SMTP
- **Authentication:** JWT (Simple JWT)
- **Development Server:** Django 5.2

For any issues or questions, please refer to the Django server logs or contact the backend development team.
