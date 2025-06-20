# Waya Backend API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Users Module](#users-module)
- [Children Module](#children-module)
- [Task Master Module](#task-master-module)
- [Family Wallet Module](#family-wallet-module)
- [Insight Tracker Module](#insight-tracker-module)
- [Settings Module](#settings-module)
- [Error Handling](#error-handling)

## Base URL
- Development: `http://localhost:8000/api/`
- Production: `https://your-domain.com/api/`

## Authentication

This API uses JWT (JSON Web Token) authentication. All protected endpoints require an `Authorization` header with a Bearer token.

**Header Format:**
```
Authorization: Bearer <access_token>
```

**Token Lifetime:**
- Access Token: 30 minutes
- Refresh Token: 1 day

---

## Users Module

### 1. User Registration

**Endpoint:** `POST /api/users/register/`

**Description:** Register a new parent user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "parent@example.com",
  "full_name": "John Doe",
  "password": "securePassword123",
  "password2": "securePassword123",
  "role": "parent",
  "terms_accepted": true,
  "avatar": null
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful! Check your email to verify your account."
}
```

**Response (400 Bad Request):**
```json
{
  "email": ["A user with this email already exists."],
  "password": ["Password fields didn't match."],
  "terms_accepted": ["You must accept the Terms and Conditions."]
}
```

---

### 2. User Login

**Endpoint:** `POST /api/users/login/`

**Description:** Authenticate user and receive JWT tokens.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "parent@example.com",
  "avatar": "https://example.com/media/avatars/user.jpg",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

---

### 3. Google Social Login

**Endpoint:** `POST /api/users/social-login/google/`

**Description:** Login using Google OAuth2.

**Authentication:** Not required

**Request Body:**
```json
{
  "access_token": "google_access_token_here"
}
```

**Response (200 OK):**
```json
{
  "detail": "Login successful.",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@gmail.com"
}
```

**Response (403 Forbidden):**
```json
{
  "error": "This Google account is not registered as a parent. Please sign up through the registration flow."
}
```

---

### 4. Email Verification

**Endpoint:** `POST /api/users/email-verify/`

**Description:** Verify user's email address.

**Authentication:** Not required

**Request Body:**
```json
{
  "uidb64": "encoded_user_id",
  "token": "verification_token"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully!"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Invalid verification link."
}
```

---

### 5. Password Change

**Endpoint:** `PUT /api/users/password-change/`

**Description:** Change user's password.

**Authentication:** Required

**Request Body:**
```json
{
  "old_password": "currentPassword123",
  "new_password": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "detail": "Password updated successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "old_password": ["Old password is not correct."]
}
```

---

### 6. Password Reset Request

**Endpoint:** `POST /api/users/password-reset/`

**Description:** Request password reset email.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset email sent if the email is registered."
}
```

---

### 7. Password Reset Confirm

**Endpoint:** `POST /api/users/password-reset-confirm/<uidb64>/<token>/`

**Description:** Confirm password reset with new password.

**Authentication:** Not required

**Request Body:**
```json
{
  "new_password1": "newSecurePassword123",
  "new_password2": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password has been reset successfully."
}
```

---

### 8. Resend Verification Email

**Endpoint:** `POST /api/users/resend-email/`

**Description:** Resend email verification link.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Verification email resent!"
}
```

---

## Children Module

### 1. Create Child

**Endpoint:** `POST /api/children/create/`

**Description:** Create a new child profile.

**Authentication:** Required (Parent only)

**Request Body:**
```json
{
  "username": "johnny_doe",
  "pin": "1234",
  "pin_confirm": "1234",
  "avatar": null
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "username": "johnny_doe",
  "avatar": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. List Children

**Endpoint:** `GET /api/children/list/`

**Description:** Get all children for the authenticated parent.

**Authentication:** Required (Parent only)

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "johnny_doe",
    "avatar": "https://example.com/media/avatars/child1.jpg",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "username": "jane_doe",
    "avatar": null,
    "created_at": "2024-01-16T11:45:00Z"
  }
]
```

---

### 3. Child Detail

**Endpoint:** `GET /api/children/<child_id>/`

**Description:** Get detailed information about a specific child.

**Authentication:** Required (Parent only)

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "parent": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johnny_doe",
  "avatar": "https://example.com/media/avatars/child1.jpg",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 4. Update Child

**Endpoint:** `PUT /api/children/<child_id>/update/`

**Description:** Update child information.

**Authentication:** Required (Parent only)

**Request Body:**
```json
{
  "username": "johnny_updated",
  "avatar": "new_avatar_file"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "username": "johnny_updated",
  "avatar": "https://example.com/media/avatars/new_avatar.jpg",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 5. Delete Child

**Endpoint:** `DELETE /api/children/<child_id>/delete/`

**Description:** Delete a child profile.

**Authentication:** Required (Parent only)

**Response (204 No Content):**
```
No content returned
```

---

### 6. Child Login

**Endpoint:** `POST /api/children/login/`

**Description:** Authenticate child using username and PIN.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "johnny_doe",
  "pin": "1234"
}
```

**Response (200 OK):**
```json
{
  "childId": "550e8400-e29b-41d4-a716-446655440001",
  "childUsername": "johnny_doe",
  "parentId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

---

## Task Master Module

### 1. Create Task

**Endpoint:** `POST /api/taskmaster/tasks/create/`

**Description:** Create a new chore/task for a child.

**Authentication:** Required (Parent only)

**Request Body:**
```json
{
  "title": "Clean Your Room",
  "description": "Make your bed, organize toys, and vacuum the floor",
  "reward": 5.00,
  "due_date": "2024-01-20",
  "assigned_to": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "title": "Clean Your Room",
  "description": "Make your bed, organize toys, and vacuum the floor",
  "reward": "5.00",
  "due_date": "2024-01-20",
  "assigned_to": "550e8400-e29b-41d4-a716-446655440001",
  "parent": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "created_at": "2024-01-15T12:00:00Z"
}
```

---

### 2. List Tasks

**Endpoint:** `GET /api/taskmaster/tasks/`

**Description:** Get all tasks created by the authenticated parent.

**Authentication:** Required (Parent only)

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "title": "Clean Your Room",
    "description": "Make your bed, organize toys, and vacuum the floor",
    "reward": "5.00",
    "due_date": "2024-01-20",
    "assignedTo": "johnny_doe",
    "parentId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "created_at": "2024-01-15T12:00:00Z",
    "completed_at": null
  }
]
```

---

### 3. Task Detail

**Endpoint:** `GET /api/taskmaster/tasks/<task_id>/`

**Description:** Get detailed information about a specific task.

**Authentication:** Required (Parent only)

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "title": "Clean Your Room",
  "description": "Make your bed, organize toys, and vacuum the floor",
  "reward": "5.00",
  "due_date": "2024-01-20",
  "assigned_to": "550e8400-e29b-41d4-a716-446655440001",
  "parent": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "created_at": "2024-01-15T12:00:00Z",
  "completed_at": null
}
```

---

### 4. Update Task Status (Parent)

**Endpoint:** `PATCH /api/taskmaster/tasks/<task_id>/status/`

**Description:** Update task status (parent can mark as completed/missed).

**Authentication:** Required (Parent only)

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "status": "completed"
}
```

---

### 5. Child Chore List

**Endpoint:** `GET /api/taskmaster/child-chores/?childId=<child_id>`

**Description:** Get all chores assigned to a specific child.

**Authentication:** Required

**Query Parameters:**
- `childId` (required): UUID of the child

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "title": "Clean Your Room",
    "description": "Make your bed, organize toys, and vacuum the floor",
    "reward": "5.00",
    "due_date": "2024-01-20",
    "assignedTo": "johnny_doe",
    "parentId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "created_at": "2024-01-15T12:00:00Z",
    "completed_at": null
  }
]
```

---

### 6. Child Chore Status Update

**Endpoint:** `PATCH /api/taskmaster/child-chores/<task_id>/status/`

**Description:** Allow child to update their chore status.

**Authentication:** Required (Child must be assigned to the task)

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "status": "completed"
}
```

---

## Family Wallet Module

### 1. Family Wallet Details

**Endpoint:** `GET /api/familywallet/family-wallet/`

**Description:** Get family wallet information and statistics.

**Authentication:** Required (Parent only)

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "parent": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "John Doe",
    "email": "parent@example.com"
  },
  "balance": "100.00",
  "total_rewards_sent": "25.00",
  "total_rewards_pending": "10.00",
  "children_wallets": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "child_name": "johnny_doe",
      "balance": "15.00"
    }
  ],
  "recent_transactions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "amount": "5.00",
      "transaction_type": "reward",
      "description": "Room cleaning reward",
      "created_at": "2024-01-15T14:00:00Z"
    }
  ]
}
```

---

### 2. Dashboard Stats

**Endpoint:** `GET /api/familywallet/family-wallet/dashboard_stats/`

**Description:** Get dashboard statistics for family wallet.

**Authentication:** Required (Parent only)

**Response (200 OK):**
```json
{
  "family_wallet_balance": "100.00",
  "total_rewards_sent": "25.00",
  "total_rewards_pending": "10.00",
  "children_count": 2,
  "total_children_balance": "30.00"
}
```

---

### 3. Add Funds

**Endpoint:** `POST /api/familywallet/family-wallet/add_funds/`

**Description:** Add funds to the family wallet.

**Authentication:** Required (Parent only)

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Monthly allowance top-up"
}
```

**Response (200 OK):**
```json
{
  "message": "Funds added successfully",
  "new_balance": "150.00",
  "transaction_id": "550e8400-e29b-41d4-a716-446655440007"
}
```

---

### 4. Earnings Chart Data

**Endpoint:** `GET /api/familywallet/family-wallet/earnings_chart_data/?days=30`

**Description:** Get earnings data for chart visualization.

**Authentication:** Required (Parent only)

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30)

**Response (200 OK):**
```json
{
  "2024-01-15": {
    "johnny_doe": "5.00",
    "jane_doe": "3.00"
  },
  "2024-01-16": {
    "johnny_doe": "2.00"
  }
}
```

---

### 5. Savings Breakdown

**Endpoint:** `GET /api/familywallet/family-wallet/savings_breakdown/`

**Description:** Get savings breakdown for all children.

**Authentication:** Required (Parent only)

**Response (200 OK):**
```json
[
  {
    "child_name": "johnny_doe",
    "reward_saved": "15.00",
    "reward_spent": "5.00",
    "total_earned": "20.00",
    "savings_rate": 0.75
  },
  {
    "child_name": "jane_doe",
    "reward_saved": "10.00",
    "reward_spent": "2.00",
    "total_earned": "12.00",
    "savings_rate": 0.83
  }
]
```

---

### 6. Child Wallets

**Endpoint:** `GET /api/familywallet/child-wallets/`

**Description:** Get all children's wallet information.

**Authentication:** Required (Parent only)

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "child": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "johnny_doe"
    },
    "balance": "15.00",
    "total_earned": "20.00",
    "total_spent": "5.00",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 7. Transactions

**Endpoint:** `GET /api/familywallet/transactions/`

**Description:** Get all family wallet transactions.

**Authentication:** Required (Parent only)

**Query Parameters:**
- `status` (optional): Filter by transaction status
- `type` (optional): Filter by transaction type
- `child_id` (optional): Filter by child ID

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "family_wallet": "550e8400-e29b-41d4-a716-446655440004",
    "child": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "johnny_doe"
    },
    "amount": "5.00",
    "transaction_type": "reward",
    "status": "completed",
    "description": "Room cleaning reward",
    "created_at": "2024-01-15T14:00:00Z",
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    }
  }
]
```

---

### 8. Create Transaction

**Endpoint:** `POST /api/familywallet/transactions/`

**Description:** Create a new transaction (reward, expense, etc.).

**Authentication:** Required (Parent only)

**Request Body:**
```json
{
  "child": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 5.00,
  "transaction_type": "reward",
  "description": "Homework completion reward",
  "status": "pending"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440008",
  "family_wallet": "550e8400-e29b-41d4-a716-446655440004",
  "child": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "johnny_doe"
  },
  "amount": "5.00",
  "transaction_type": "reward",
  "status": "pending",
  "description": "Homework completion reward",
  "created_at": "2024-01-15T15:00:00Z"
}
```

---

### 9. Recent Activities

**Endpoint:** `GET /api/familywallet/transactions/recent_activities/?limit=10`

**Description:** Get recent transaction activities.

**Authentication:** Required (Parent only)

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 10)

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "amount": "5.00",
    "transaction_type": "reward",
    "description": "Homework completion reward",
    "created_at": "2024-01-15T15:00:00Z"
  }
]
```

---

## Insight Tracker Module

### 1. Dashboard Statistics

**Endpoint:** `GET /api/insighttracker/dashboard/`

**Description:** Get comprehensive dashboard statistics and insights.

**Authentication:** Required (Parent only)

**Query Parameters:**
- `from` (optional): Start date filter (YYYY-MM-DD)
- `to` (optional): End date filter (YYYY-MM-DD)
- `child_id` (optional): Filter by specific child

**Response (200 OK):**
```json
{
  "total_chores": 15,
  "completed_chores": 10,
  "pending_chores": 5,
  "activities": [
    {
      "id": 1,
      "activity_type": "chore_completed",
      "description": "Johnny completed room cleaning",
      "child_name": "johnny_doe",
      "points": 5,
      "timestamp": "2024-01-15T14:00:00Z"
    },
    {
      "id": 2,
      "activity_type": "reward_earned",
      "description": "Jane earned reward for homework",
      "child_name": "jane_doe",
      "points": 3,
      "timestamp": "2024-01-15T13:30:00Z"
    }
  ],
  "individual_activities": {
    "johnny_doe": [
      {
        "id": 1,
        "activity_type": "chore_completed",
        "description": "Completed room cleaning",
        "child_name": "johnny_doe",
        "points": 5,
        "timestamp": "2024-01-15T14:00:00Z"
      }
    ]
  },
  "daily_summary": {
    "johnny_doe": {
      "2024-01-15": 5,
      "2024-01-16": 3
    },
    "jane_doe": {
      "2024-01-15": 3,
      "2024-01-16": 2
    }
  }
}
```

---

## Settings Module

### 1. User Profile

**Endpoint:** `GET /api/settings_waya/profile/`

**Description:** Get user profile information.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "avatar": "https://example.com/media/avatars/user.jpg",
  "full_name": "John Doe",
  "email": "parent@example.com"
}
```

---

**Endpoint:** `PUT /api/settings_waya/profile/`

**Description:** Update user profile information.

**Authentication:** Required

**Request Body:**
```json
{
  "avatar": "new_avatar_file"
}
```

**Response (200 OK):**
```json
{
  "avatar": "https://example.com/media/avatars/new_avatar.jpg",
  "full_name": "John Doe",
  "email": "parent@example.com"
}
```

---

### 2. Child Profile

**Endpoint:** `GET /api/settings_waya/children/<child_id>/profile/`

**Description:** Get child profile information.

**Authentication:** Required (Parent only)

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "username": "johnny_doe",
  "avatar": "https://example.com/media/avatars/child.jpg"
}
```

---

**Endpoint:** `PUT /api/settings_waya/children/<child_id>/profile/`

**Description:** Update child profile information.

**Authentication:** Required (Parent only)

**Request Body:**
```json
{
  "username": "johnny_updated",
  "avatar": "new_child_avatar_file"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "username": "johnny_updated",
  "avatar": "https://example.com/media/avatars/new_child_avatar.jpg"
}
```

---

### 3. Password Reset

**Endpoint:** `POST /api/settings_waya/reset-password/`

**Description:** Reset user password from settings.

**Authentication:** Required

**Request Body:**
```json
{
  "current_password": "currentPassword123",
  "new_password": "newSecurePassword456",
  "confirm_new_password": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "detail": "Password changed successfully."
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Current password is incorrect."
}
```

---

### 4. Notification Settings

**Endpoint:** `GET /api/settings_waya/notifications/`

**Description:** Get notification preferences.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "chore_completion": true,
  "reward_redemption": true,
  "chore_reminder": true,
  "weekly_summary": false
}
```

---

**Endpoint:** `PUT /api/settings_waya/notifications/`

**Description:** Update notification preferences.

**Authentication:** Required

**Request Body:**
```json
{
  "chore_completion": false,
  "reward_redemption": true,
  "chore_reminder": true,
  "weekly_summary": true
}
```

**Response (200 OK):**
```json
{
  "chore_completion": false,
  "reward_redemption": true,
  "chore_reminder": true,
  "weekly_summary": true
}
```

---

### 5. Reward Settings

**Endpoint:** `GET /api/settings_waya/rewards/`

**Description:** Get reward system preferences.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "reward_approval_required": false,
  "max_daily_reward": 20,
  "allow_savings": true
}
```

---

**Endpoint:** `PUT /api/settings_waya/rewards/`

**Description:** Update reward system preferences.

**Authentication:** Required

**Request Body:**
```json
{
  "reward_approval_required": true,
  "max_daily_reward": 15,
  "allow_savings": false
}
```

**Response (200 OK):**
```json
{
  "reward_approval_required": true,
  "max_daily_reward": 15,
  "allow_savings": false
}
```

---

## Error Handling

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content returned
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Permission denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong",
  "field_name": ["Specific field validation errors"]
}
```

### Example Error Responses

**Validation Error (400):**
```json
{
  "email": ["This field is required."],
  "password": ["This field is required."]
}
```

**Authentication Error (401):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Permission Error (403):**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Not Found Error (404):**
```json
{
  "detail": "Not found."
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

When rate limit is exceeded, the API returns a `429 Too Many Requests` status code.

---

## Pagination

List endpoints use pagination with the following format:

**Request:**
```
GET /api/endpoint/?page=2&page_size=10
```

**Response:**
```json
{
  "count": 50,
  "next": "http://api.example.com/endpoint/?page=3",
  "previous": "http://api.example.com/endpoint/?page=1",
  "results": [
    // ... actual data
  ]
}
```

Default page size: 3 items per page

---

## CORS Configuration

The API allows requests from:
- `http://localhost:3000` (Development)
- `https://waya-fawn.vercel.app` (Production)

---

## Additional Notes

1. **File Uploads**: Avatar images should be uploaded as multipart/form-data
2. **Date Formats**: Use ISO 8601 format (YYYY-MM-DD) for dates
3. **Decimal Fields**: Monetary amounts are returned as strings to preserve precision
4. **UUIDs**: All entity IDs are UUIDs in string format
5. **Timezone**: All timestamps are in UTC

---

## Security Considerations

1. Always use HTTPS in production
2. Store JWT tokens securely (not in localStorage for web apps)
3. Implement proper CSRF protection for web applications
4. Validate all input data on both client and server sides
5. Use strong passwords and enforce password policies

---

## Support

For API support and questions, contact the development team or refer to the project's GitHub repository.
