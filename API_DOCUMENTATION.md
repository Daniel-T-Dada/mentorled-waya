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

- Production: `https://waya-mentorled.onrender.com/api/`

## Authentication

This API uses JWT (JSON Web Token) for authentication. All protected endpoints require an `Authorization` header with a Bearer token.

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

**Endpoint:** `POST /users/register/`

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
  "terms_accepted": true
}
```

**Response (201 Created):**

```json
{
  "message": "Registration successful! Check your email to verify your account."
}
```

**Error Responses:**

- **400 Bad Request:**
  ```json
  {
    "email": ["A user with this email already exists."],
    "password": ["Password fields didn't match."],
    "terms_accepted": ["You must accept the Terms and Conditions."]
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "error": "User created but failed to send verification email.",
    "details": "<error details>"
  }
  ```

---

### 2. User Login

**Endpoint:** `POST /users/login/`

**Description:** Authenticate a user and receive JWT tokens.

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

**Error Response (401 Unauthorized):**

```json
{
  "detail": "Invalid credentials"
}
```

---

### 3. Password Change

**Endpoint:** `PUT /users/password-change/`

**Description:** Change the password for an authenticated user.

**Authentication:** Required

**Request Body:**

```json
{
  "old_password": "currentSecurePassword123",
  "new_password": "newSecurePassword456",
  "new_password2": "newSecurePassword456"
}
```

**Response (200 OK):**

```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**

- **400 Bad Request:**
  ```json
  {
    "new_password": ["Passwords do not match."],
    "old_password": ["Incorrect old password."]
  }
  ```

---

### 4. Password Reset Request

**Endpoint:** `POST /users/password-reset/`

**Description:** Request a password reset email.

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

### 5. Password Reset Confirmation

**Endpoint:** `POST /users/password-reset-confirm/<uidb64>/<token>/`

**Description:** Confirm a password reset with a new password.

**Authentication:** Not required

**Request Body:**

```json
{
  "new_password": "newSecurePassword456",
  "new_password2": "newSecurePassword456"
}
```

**Response (200 OK):**

```json
{
  "message": "Password has been reset successfully."
}
```

**Error Responses:**

- **400 Bad Request:**
  ```json
  {
    "detail": "Invalid link.",
    "detail": "Invalid or expired token."
  }
  ```

---

### 6. Email Verification

**Endpoint:** `GET /users/email-verify/?uidb64=<uidb64>&token=<token>`

**Description:** Verify a user's email address.

**Authentication:** Not required

**Response (200 OK):**

```json
{
  "message": "Email verified successfully!"
}
```

**Error Responses:**

- **400 Bad Request:**
  ```json
  {
    "error": "Invalid or expired verification link."
  }
  ```

---

### 7. Resend Verification Email

**Endpoint:** `POST /users/resend-email/`

**Description:** Resend the email verification link.

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
  "message": "Verification email sent."
}
```

**Error Responses:**

- **400 Bad Request:**
  ```json
  {
    "error": "User is already verified."
  }
  ```
- **404 Not Found:**
  ```json
  {
    "error": "User with this email not found."
  }
  ```

---

### 8. Google Social Login

**Endpoint:** `POST /users/social-login/google/`

**Description:** Authenticate a user with a Google access token.

**Authentication:** Not required

**Request Body:**

```json
{
  "access_token": "<google_access_token>"
}
```

**Response (200 OK):**

```json
{
  "detail": "Login successful.",
  "user_id": "user_id",
  "email": "user@example.com"
}
```

**Error Responses:**

- **403 Forbidden:**
  ```json
  {
    "error": "Account not verified."
  }
  ```
  ```json
  {
    "error": "Only parents are allowed to log in here."
  }
  ```

---

## Children Module

### 1. Create Child

**Endpoint:** `POST /children/create/`

**Description:** Create a new child account linked to the parent.

**Authentication:** Required (Parent)

**Request Body:**

```json
{
  "username": "child_username",
  "password": "child_password",
  "age": 10,
  "gender": "Male"
}
```

**Response (201 Created):**

```json
{
  "id": "child_id",
  "username": "child_username",
  "age": 10,
  "gender": "Male",
  "parent": "parent_id"
}
```

### 2. List Children

**Endpoint:** `GET /children/list/`

**Description:** List all children linked to the parent.

**Authentication:** Required (Parent)

**Response (200 OK):**

```json
[
  {
    "id": "child_id",
    "username": "child_username",
    "age": 10,
    "gender": "Male"
  }
]
```

### 3. Child Detail

**Endpoint:** `GET /children/<uuid:pk>/`

**Description:** Retrieve details for a specific child.

**Authentication:** Required (Parent)

**Response (200 OK):**

```json
{
  "id": "child_id",
  "username": "child_username",
  "age": 10,
  "gender": "Male"
}
```

### 4. Update Child

**Endpoint:** `PUT /children/<uuid:pk>/update/`

**Description:** Update a child's details.

**Authentication:** Required (Parent)

**Request Body:**

```json
{
  "username": "new_child_username",
  "age": 11
}
```

**Response (200 OK):**

```json
{
  "id": "child_id",
  "username": "new_child_username",
  "age": 11,
  "gender": "Male"
}
```

### 5. Delete Child

**Endpoint:** `DELETE /children/<uuid:pk>/delete/`

**Description:** Delete a child account.

**Authentication:** Required (Parent)

**Response (204 No Content):**

### 6. Child Login

**Endpoint:** `POST /children/login/`

**Description:** Authenticate a child and receive JWT tokens.

**Authentication:** Not required

**Request Body:**

```json
{
  "username": "child_username",
  "password": "child_password"
}
```

**Response (200 OK):**

```json
{
  "id": "child_id",
  "username": "child_username",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## Task Master Module

### 1. Create Task

**Endpoint:** `POST /api/taskmaster/chores/create/`

**Description:** Create a new chore/task for a child.

**Authentication:** Required (Parent)

**Request Body:**

```json
{
  "title": "Clean your room",
  "description": "Detailed description of the chore.",
  "assigned_to": "child-uuid-here",
  "reward": 10.5,
  "due_date": "2024-12-31"
}
```

**Response (201 Created):**

```json
{
  "id": "chore-uuid-here",
  "title": "Clean your room",
  "description": "Detailed description of the chore.",
  "amount": "10.50",
  "assignedTo": "child-uuid-here",
  "assignedToName": "Child Name",
  "assignedToUsername": "child_username",
  "status": "pending",
  "createdAt": "2024-01-01T12:00:00Z",
  "completedAt": null,
  "parentId": "parent-uuid-here",
  "category": "Household"
}
```

### 2. List Tasks/Chores

**Endpoint:** `GET /api/taskmaster/chores/`

**Description:** List all chores created by the parent. This is the **recommended endpoint** for retrieving chore data reliably.

**Authentication:** Required (Parent or Child)

**Query Parameters:**

- `status`: (optional) Filter by chore status (`pending`, `completed`, `missed`)
- `assignedTo`: (optional) Filter by child UUID - **Use this for child-specific chores**
- `category`: (optional) Filter by category

**Response (200 OK):**

```json
[
  {
    "id": "chore-uuid-here",
    "title": "Clean your room",
    "description": "Detailed description of the chore.",
    "amount": "10.50",
    "assignedTo": "child-uuid-here",
    "assignedToName": "Child Name",
    "assignedToUsername": "child_username",
    "status": "pending",
    "createdAt": "2024-01-01T12:00:00Z",
    "completedAt": null,
    "parentId": "parent-uuid-here",
    "category": "Household"
  }
]
```

**Note for Client Applications:** For children's dashboards, use `/api/taskmaster/chores/?assignedTo=<childId>` instead of the children/chores endpoint for reliable data.

### 3. Task Detail

**Endpoint:** `GET /api/taskmaster/chores/<uuid:pk>/`

**Description:** Retrieve details for a specific chore.

**Authentication:** Required (Parent or assigned Child)

**Response (200 OK):** Same format as the single chore object in list response.

### 4. Update Task

**Endpoint:** `PUT /api/taskmaster/chores/<uuid:pk>/`

**Description:** Update a chore's details.

**Authentication:** Required (Parent who created the chore)

**Request Body:**

```json
{
  "title": "Clean your room thoroughly",
  "description": "Updated description",
  "reward": 12.0,
  "due_date": "2024-12-31",
  "assigned_to": "child-uuid-here"
}
```

**Response (200 OK):** Same format as the chore detail response.

### 5. Delete Task

**Endpoint:** `DELETE /api/taskmaster/chores/<uuid:pk>/`

**Description:** Delete a chore.

**Authentication:** Required (Parent who created the chore)

**Response (204 No Content):**

### 6. Update Task Status (Parent)

**Endpoint:** `PATCH /api/taskmaster/chores/<uuid:pk>/status/`

**Description:** Update the status of a chore (e.g., mark as completed or missed).

**Authentication:** Required (Parent who created the chore)

**Request Body:**

```json
{
  "status": "completed"
}
```

**Valid Status Values:**

- `pending`: Task is assigned but not yet completed
- `completed`: Task has been completed by the child
- `missed`: Task was not completed by the due date

**Response (200 OK):** Updated chore details with new status.

### 7. Child Chore List (Legacy/Inconsistent)

**Endpoint:** `GET /api/taskmaster/children/chores/`

**Description:** ⚠️ **DEPRECATED/UNRELIABLE** - List all chores assigned to a specific child.

**Authentication:** Required (Parent or Child)

**Query Parameters:**

- `childId`: (required for Parents) The ID of the child whose chores to retrieve
  Note: Children automatically see their own chores and don't need to provide this

**⚠️ CRITICAL ISSUE:** This endpoint returns empty results for child users in practice.

**Response (200 OK) - Often Empty:**

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

**🚨 RECOMMENDED ALTERNATIVE:**

**Use `GET /api/taskmaster/chores/?assignedTo=<childId>` instead** for consistent, reliable results:

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "chore-uuid-here",
      "title": "Clean your room",
      "description": "Detailed description of the chore.",
      "amount": "10.50",
      "assignedTo": "child-uuid-here",
      "assignedToName": "Child Name",
      "assignedToUsername": "child_username",
      "status": "pending",
      "createdAt": "2024-01-01T12:00:00Z",
      "completedAt": null,
      "parentId": "parent-uuid-here",
      "category": "Household"
    }
  ]
}
```

### 8. Child Chore Status Update

**Endpoint:** `PATCH /api/taskmaster/children/chores/<uuid:pk>/status/`

**Description:** Update the status of a chore (e.g., mark as completed). This endpoint is for children to update their own chore statuses.

**Authentication:** Required (Child assigned to the chore)

**Request Body:**

```json
{
  "status": "completed"
}
```

**Valid Status Values:**

- `pending`: Task is assigned but not yet completed
- `completed`: Task has been completed by the child
- `missed`: Task was not completed by the due date

**Response (200 OK):** Updated chore details with new status.

### 9. Chore Summary Statistics

**Endpoint:** `GET /api/taskmaster/chores/summary/`

**Description:** Returns a summary of chore statistics for the parent (counts by status)

**Authentication:** Required (Parent)

**Response (200 OK):**

```json
{
  "pending": 5,
  "completed": 12,
  "missed": 2,
  "total": 19
}
```

## Best Practices for Task Master Module

### For Client Applications

1. **Child Dashboard Development:**

   - Always use `/api/taskmaster/chores/?assignedTo=<childId>` for reliable child chore data
   - Avoid `/api/taskmaster/children/chores/` as it often returns empty results for child users
   - Implement robust error handling for empty API responses

2. **Data Fetching Patterns:**

   ```javascript
   // ✅ RECOMMENDED: Reliable endpoint for child chores
   const fetchChildChores = async (childId) => {
     const response = await fetch(
       `/api/taskmaster/chores/?assignedTo=${childId}`
     );
     return response.json();
   };
   ```

3. **Error Handling:**

   - Always check for empty arrays in API responses
   - Provide appropriate fallback data for empty states
   - Log API errors for debugging but don't crash the UI

4. **Performance:**
   - Cache chore statistics when possible
   - Use loading states while fetching data
   - Consider implementing real-time updates for chore status changes

### Known API Quirks

- The `/api/taskmaster/children/chores/` endpoint has inconsistent behavior for child users
- Always use UUIDs in string format, not as raw UUID objects
- Status values are case-sensitive and must be lowercase

---

## Family Wallet Module

### 1. Parent Wallet Overview

**Endpoint:** `GET /familywallet/api/parents/wallet/`

**Description:** Get an overview of the parent's family wallet.

**Authentication:** Required (Parent)

**Response (200 OK):**

```json
{
  "id": "wallet_id",
  "parent": "parent_id",
  "balance": "100.00",
  "created_at": "2024-01-01T12:00:00Z"
}
```

### 2. Dashboard Stats

**Endpoint:** `GET /familywallet/api/parents/wallet/dashboard-stats/`

**Description:** Get dashboard statistics for the family wallet.

**Authentication:** Required (Parent)

**Response (200 OK):**

```json
{
  "family_wallet_balance": "100.00",
  "total_rewards_sent": "50.00",
  "total_rewards_pending": "20.00",
  "children_count": 2,
  "total_children_balance": "70.00"
}
```

### 3. Add Funds to Wallet

**Endpoint:** `POST /familywallet/api/parents/wallet/add-funds/`

**Description:** Add funds to the family wallet.

**Authentication:** Required (Parent)

**Request Body:**

```json
{
  "amount": 50.0
}
```

**Response (200 OK):**

```json
{
  "message": "Funds added successfully.",
  "new_balance": "150.00"
}
```

### 4. List All Transactions

**Endpoint:** `GET /familywallet/api/parents/wallet/transactions/`

**Description:** List all transactions for the family wallet.

**Authentication:** Required (Parent)

**Query Parameters:**

- `status`: (optional) Filter by transaction status.
- `type`: (optional) Filter by transaction type.
- `child_id`: (optional) Filter by child ID.

**Response (200 OK):**

```json
[
  {
    "id": "transaction_id",
    "amount": "10.50",
    "transaction_type": "reward",
    "status": "completed",
    "child": "child_id",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### 5. Complete Transaction

**Endpoint:** `POST /familywallet/api/parents/wallet/transactions/<uuid:pk>/complete/`

**Description:** Complete a single pending transaction.

**Authentication:** Required (Parent)

**Response (200 OK):**

```json
{
  "message": "Transaction completed successfully."
}
```

### 6. Cancel Transaction

**Endpoint:** `POST /familywallet/api/parents/wallet/transactions/<uuid:pk>/cancel/`

**Description:** Cancel a single pending transaction.

**Authentication:** Required (Parent)

**Response (200 OK):**

```json
{
  "message": "Transaction cancelled successfully."
}
```

### 7. Get Child Wallets

**Endpoint:** `GET /familywallet/api/parents/wallet/children-wallets/`

**Description:** Get wallet details for all children of the parent.

**Authentication:** Required (Parent)

**Response (200 OK):**

```json
[
  {
    "id": "child_wallet_id",
    "child": "child_id",
    "balance": "35.00",
    "total_earned": "50.00",
    "total_spent": "15.00"
  }
]
```

---

## Settings Module

### 1. User Profile

**Endpoint:** `GET /settings_waya/profile/`
**Endpoint:** `PUT /settings_waya/profile/`
**Endpoint:** `PATCH /settings_waya/profile/`

**Description:** Retrieve or update the authenticated user's profile.

**Authentication:** Required

**Request Body (for PUT/PATCH):**

```json
{
  "full_name": "Johnathan Doe",
  "avatar": "<new_avatar_url>"
}
```

**Response (200 OK):**

```json
{
  "id": "user_id",
  "full_name": "Johnathan Doe",
  "email": "user@example.com",
  "avatar": "<new_avatar_url>"
}
```

### 2. Child Profile

**Endpoint:** `GET /settings_waya/children/<int:child_id>/profile/`
**Endpoint:** `PUT /settings_waya/children/<int:child_id>/profile/`
**Endpoint:** `PATCH /settings_waya/children/<int:child_id>/profile/`

**Description:** Retrieve or update a specific child's profile.

**Authentication:** Required (Parent)

**Request Body (for PUT/PATCH):**

```json
{
  "username": "new_child_username",
  "age": 12
}
```

**Response (200 OK):**

```json
{
  "id": "child_id",
  "username": "new_child_username",
  "age": 12
}
```

### 3. Reset Password (from settings)

**Endpoint:** `POST /settings_waya/reset-password/`

**Description:** Change the user's password from within the settings page.

**Authentication:** Required

**Request Body:**

```json
{
  "current_password": "currentSecurePassword123",
  "new_password": "newSecurePassword456",
  "new_password2": "newSecurePassword456"
}
```

**Response (200 OK):**

```json
{
  "detail": "Password changed successfully."
}
```

### 4. Notification Settings

**Endpoint:** `GET /settings_waya/notifications/`
**Endpoint:** `PUT /settings_waya/notifications/`
**Endpoint:** `PATCH /settings_waya/notifications/`

**Description:** Retrieve or update notification settings for the user.

**Authentication:** Required

**Response (200 OK):**

```json
{
  "chore_completion": true,
  "reward_redemption": false,
  "chore_reminder": true,
  "weekly_summary": true
}
```

### 5. Reward Settings

**Endpoint:** `GET /settings_waya/rewards/`
**Endpoint:** `PUT /settings_waya/rewards/`
**Endpoint:** `PATCH /settings_waya/rewards/`

**Description:** Retrieve or update reward settings for the user.

**Authentication:** Required

**Response (200 OK):**

```json
{
  "reward_approval_required": true,
  "max_daily_reward": "100.00",
  "allow_savings": false
}
```

---

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. In case of an error, the response body will contain a JSON object with a `detail` or specific field errors.

**Common Status Codes:**

- `200 OK`: The request was successful.
- `201 Created`: The resource was successfully created.
- `204 No Content`: The request was successful, but there is no content to return.
- `400 Bad Request`: The request was invalid (e.g., missing parameters, validation errors).
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
- `403 Forbidden`: The authenticated user does not have permission to perform the action.
- `404 Not Found`: The requested resource could not be found.
- `500 Internal Server Error`: An unexpected error occurred on the server.

**Example Error Response (400 Bad Request):**

```json
{
  "email": ["Enter a valid email address."],
  "password": ["This field may not be blank."]
}
```

**Example Error Response (401 Unauthorized):**

```json
{
  "detail": "Authentication credentials were not provided."
}
```
