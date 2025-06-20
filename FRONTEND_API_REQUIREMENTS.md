# Frontend API Requirements for Waya Backend

## Overview

This document outlines all the API endpoints that the frontend application requires from the backend. Each endpoint includes detailed request/response examples, authentication requirements, and usage patterns based on the frontend codebase analysis.

**Base URL:** `https://waya-mentorled.onrender.com` (Production) or `http://127.0.0.1:8000` (Development)  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

## 🔧 Integration Status Legend:

- ✅ **FULLY INTEGRATED** - Frontend implemented and working
- ⚠️ **PARTIALLY INTEGRATED** - Frontend implemented but needs fixes
- ❌ **NOT INTEGRATED** - Needs frontend implementation
- 🔄 **IN PROGRESS** - Currently being worked on

---

## 🔐 Authentication & User Management

### 1. Health Check ✅ **FULLY INTEGRATED**

**Endpoint:** `GET /api/users/`  
**Authentication:** None  
**Description:** API health check  
**Frontend File:** `lib/services/authService.ts`

#### Response (200 OK)

```json
{
  "message": "Welcome to the Waya Backend API"
}
```

### 2. User Registration ✅ **FULLY INTEGRATED**

**Endpoint:** `POST /api/users/register/`  
**Authentication:** None  
**Description:** Register a new parent user  
**Frontend Files:** `lib/services/authService.ts`, `app/auth/signup/page.tsx`

#### Request

```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "password2": "securePassword123",
  "role": "parent",
  "terms_accepted": true
}
```

#### Response (201 Created)

```json
{
  "message": "User created successfully. Please check your email to verify your account.",
  "user": {
    "id": "d3d3c95b-f94d-4527-9e03-e131512f903a",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "role": "parent",
    "is_verified": false
  },
  "verification": {
    "token": "verification-token-here",
    "uidb64": "encoded-user-id"
  }
}
```

### 3. User Login ✅ **FULLY INTEGRATED**

**Endpoint:** `POST /api/users/login/`  
**Authentication:** None  
**Description:** Authenticate user and get access token  
**Frontend Files:** `lib/services/authService.ts`, `app/auth/signin/page.tsx`

#### Request

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

#### Response (200 OK)

```json
{
  "id": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "avatar": null,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 4. Child Login ✅ **FULLY INTEGRATED**

**Endpoint:** `POST /api/children/login/`  
**Authentication:** None  
**Description:** Authenticate child user with username and PIN  
**Frontend Files:** `lib/services/authService.ts`, `lib/services/childrenService.ts`

#### Request

```json
{
  "username": "faith_joseph",
  "pin": "1234"
}
```

#### Response (200 OK)

```json
{
  "childId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "childUsername": "faith_joseph",
  "childName": "Faith Joseph",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 5. Email Verification ✅ **FULLY INTEGRATED**

**Endpoint:** `POST /api/users/email-verify/`  
**Authentication:** None  
**Description:** Verify user email address  
**Frontend Files:** `lib/services/authService.ts`, `app/auth/verify-email/page.tsx`

#### Request

```json
{
  "uidb64": "encoded-user-id",
  "token": "verification-token"
}
```

#### Response (200 OK)

```json
{
  "message": "Email verified successfully"
}
```

### 6. Password Reset Request ✅ **FULLY INTEGRATED**

**Endpoint:** `POST /api/users/password-reset/`  
**Authentication:** None  
**Description:** Request password reset email  
**Frontend Files:** `lib/services/authService.ts`, `app/auth/forgot-password/page.tsx`

#### Request

```json
{
  "email": "john.doe@example.com"
}
```

#### Response (200 OK)

```json
{
  "message": "Password reset email sent if the email is registered."
}
```

---

## 👶 Children Management

### 1. Create Child ✅ **FULLY INTEGRATED**

**Endpoint:** `POST /api/children/create/`  
**Authentication:** Bearer Token  
**Description:** Create a new child account  
**Frontend Files:** `lib/services/childrenService.ts`, `components/modals/CreateKidAccount.tsx`, `contexts/KidContext.tsx`

**🔧 FRONTEND FIX NEEDED:** Currently only sends `username` and `pin`, but form collects `name` too

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Request

```json
{
  "name": "Faith Joseph",
  "username": "faith_joseph",
  "pin": "1234"
}
```

**📝 Note:** Frontend form collects both `name` and `username`, but currently only sends `username` and `pin` to API.

#### Response (201 Created)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "faith_joseph",
  "name": "Faith Joseph",
  "avatar": null,
  "parent": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "created_at": "2024-12-19T10:30:00Z"
}
}
```

### 2. List Children ✅ **FULLY INTEGRATED**

**Endpoint:** `GET /api/children/list/`  
**Authentication:** Bearer Token  
**Description:** Get all children for authenticated parent  
**Frontend Files:** `lib/services/childrenService.ts`, `contexts/KidContext.tsx`, `components/dashboard/AppKidsManagement.tsx`

**⚠️ IMPORTANT:** Frontend expects BOTH `username` AND `name` fields for proper display

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
    "username": "faith_joseph",
    "name": "Faith Joseph",
    "avatar": "https://ca.slack-edge.com/T07TDF7H2KB-U08K4MBT0LB-ecf0557403b2-72",
    "created_at": "2024-12-19T10:30:00Z",
    "age": 12,
    "grade": "7th Grade",
    "school": "Lincoln Elementary",
    "interests": ["soccer", "reading"],
    "balance": 10000,
    "level": 5
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "parent": "d3d3c95b-f94d-4527-9e03-e131512f903a",
    "username": "oghosa_notie",
    "name": "Oghosa Notie",
    "avatar": "https://ca.slack-edge.com/T07TDF7H2KB-U08K4M7CP0T-517196f34e59-72",
    "created_at": "2024-12-19T11:45:00Z",
    "age": 10,
    "grade": "5th Grade",
    "school": "Lincoln Elementary",
    "interests": ["art", "dancing"],
    "balance": 7000,
    "level": 3
  }
]
```

**📝 Note:** The `name` field contains the full display name (e.g., "Faith Joseph"), while `username` is used for login and task assignment (e.g., "faith_joseph").

### 3. Get Child Details ✅ **FULLY INTEGRATED**

**Endpoint:** `GET /api/children/{childId}/`  
**Authentication:** Bearer Token  
**Description:** Get details for a specific child  
**Frontend Files:** `lib/services/childrenService.ts`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parent": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "username": "faith_joseph",
  "name": "Faith Joseph",
  "avatar": "https://ca.slack-edge.com/T07TDF7H2KB-U08K4MBT0LB-ecf0557403b2-72",
  "created_at": "2024-12-19T10:30:00Z",
  "age": 12,
  "grade": "7th Grade",
  "school": "Lincoln Elementary",
  "interests": ["soccer", "reading"],
  "balance": 10000,
  "level": 5,
  "allowanceAmount": 1000,
  "goals": "Earn enough to buy a new bike"
}
}
```

### 4. Update Child ✅ **FULLY INTEGRATED**

**Endpoint:** `PUT /api/children/{childId}/update/`  
**Authentication:** Bearer Token  
**Description:** Update child information  
**Frontend Files:** `lib/services/childrenService.ts`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Request

```json
{
  "username": "johnny_updated",
  "pin": "5678",
  "age": 13,
  "grade": "8th Grade",
  "school": "Lincoln Middle School",
  "interests": ["soccer", "reading", "coding"],
  "allowanceAmount": 120,
  "goals": "Save money for a gaming console"
}
```

#### Response (200 OK)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "johnny_updated",
  "avatar": null,
  "age": 13,
  "grade": "8th Grade",
  "school": "Lincoln Middle School",
  "interests": ["soccer", "reading", "coding"],
  "allowanceAmount": 120,
  "goals": "Save money for a gaming console"
}
```

### 5. Delete Child ✅ **FULLY INTEGRATED**

**Endpoint:** `DELETE /api/children/{childId}/delete/`  
**Authentication:** Bearer Token  
**Description:** Delete a child account  
**Frontend Files:** `lib/services/childrenService.ts`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (204 No Content)

---

## 📋 Task/Chore Management

### 1. Create Task ✅ **FULLY INTEGRATED**

**Endpoint:** `POST /api/taskmaster/tasks/create/`  
**Authentication:** Bearer Token  
**Description:** Create a new task/chore for a child  
**Frontend Files:** `components/modals/CreateChore.tsx`, `components/dashboard/parent/TaskMasterDashboard.tsx`

**⚠️ IMPORTANT:** Frontend now sends correct format with `assignedTo` (camelCase) and `parentId`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Request

```json
{
  "title": "Make Bed",
  "description": "Make your bed neatly with sheets and blankets properly arranged",
  "reward": 5.0,
  "due_date": "2024-12-25",
  "assignedTo": "faith_joseph",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a"
}
```

**Note:** Frontend sends `assignedTo` as child username (not ID) and includes `parentId` from session.

````

#### Response (201 Created)
```json
{
  "id": "chore-001",
  "title": "Make Bed",
  "description": "Make your bed neatly with sheets and blankets properly arranged",
  "reward": "5.00",
  "due_date": "2024-12-25",
  "assignedTo": "faith_joseph",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "status": "pending",
  "created_at": "2024-12-19T12:00:00Z",
  "completed_at": null
}
}
````

### 2. List Tasks ✅ **FULLY INTEGRATED**

**Endpoint:** `GET /api/taskmaster/tasks/`  
**Authentication:** Bearer Token  
**Description:** Get list of tasks (filtered based on user role)  
**Frontend Files:** `components/dashboard/AppChoreManagement.tsx`, `components/dashboard/AppStatCard.tsx`, `components/dashboard/AppPieChart.tsx`, `components/dashboard/AppKidsActivities.tsx`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Query Parameters

- `status` (optional): Filter by status (`pending`, `completed`, `cancelled`)
- `assignedTo` (optional): Filter by child ID
- `category` (optional): Filter by category

#### Response (200 OK)

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "chore-001",
      "title": "Make Bed",
      "description": "Make your bed neatly with sheets and blankets properly arranged",
      "reward": "5.00",
      "due_date": "2024-12-25",
      "assignedTo": "faith_joseph",
      "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
      "status": "completed",
      "created_at": "2025-06-02T10:00:00Z",
      "completed_at": "2025-06-02T16:30:00Z"
    },
    {
      "id": "chore-003",
      "title": "Wash Dishes",
      "description": "Wash and dry all dishes after dinner",
      "reward": "7.50",
      "due_date": "2024-12-20",
      "assignedTo": "faith_joseph",
      "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
      "status": "pending",
      "created_at": "2025-06-01T11:00:00Z",
      "completed_at": null
    },
    {
      "id": "chore-002",
      "title": "Clean Room",
      "description": "Organize toys, books, and clothes. Vacuum the floor",
      "reward": "10.00",
      "due_date": "2024-12-22",
      "assignedTo": "oghosa_notie",
      "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
      "status": "completed",      "created_at": "2025-06-01T10:00:00Z",
      "completed_at": "2025-06-01T18:45:00Z"
    }
  ]
}
}
```

### 3. Get Task Details ⚠️ **PARTIALLY INTEGRATED**

**Endpoint:** `GET /api/taskmaster/tasks/{taskId}/`  
**Authentication:** Bearer Token  
**Description:** Get details for a specific task  
**Frontend Files:** Endpoint defined in `lib/utils/api.ts` but not used yet

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
  "assignedTo": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "category": "Household",
  "status": "pending",
  "created_at": "2024-12-19T12:00:00Z",
  "completed_at": null
}
```

### 4. Update Task ⚠️ **PARTIALLY INTEGRATED**

**Endpoint:** `PUT /api/taskmaster/tasks/{taskId}/update/`  
**Authentication:** Bearer Token  
**Description:** Update task details  
**Frontend Files:** Endpoint defined in `lib/utils/api.ts` but not used yet

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Request

```json
{
  "title": "Clean Your Room Thoroughly",
  "description": "Make your bed, organize toys, and vacuum",
  "reward": 7.0,
  "due_date": "2024-12-26",
  "category": "Household"
}
```

#### Response (200 OK)

```json
{
  "id": "task123-4567-8901-2345-678901234567",
  "title": "Clean Your Room Thoroughly",
  "description": "Make your bed, organize toys, and vacuum",
  "reward": "7.00",
  "due_date": "2024-12-26",
  "assignedTo": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "category": "Household",
  "status": "pending",
  "created_at": "2024-12-19T12:00:00Z",
  "updated_at": "2024-12-19T15:30:00Z"
}
```

### 5. Update Task Status ⚠️ **PARTIALLY INTEGRATED**

**Endpoint:** `PATCH /api/taskmaster/tasks/{taskId}/status/`  
**Authentication:** Bearer Token  
**Description:** Update task status (complete, cancel, etc.)  
**Frontend Files:** Endpoint defined in `lib/utils/api.ts` but not used yet

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

#### Response (200 OK)

```json
{
  "id": "task123-4567-8901-2345-678901234567",
  "status": "completed",
  "completed_at": "2024-12-19T18:30:00Z",
  "message": "Task marked as completed. Reward added to child's balance."
}
```

### 6. Delete Task ⚠️ **PARTIALLY INTEGRATED**

**Endpoint:** `DELETE /api/taskmaster/tasks/{taskId}/delete/`  
**Authentication:** Bearer Token  
**Description:** Delete a task  
**Frontend Files:** Endpoint defined in `lib/utils/api.ts` but not used yet

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (204 No Content)

---

## 💰 Financial Management

### 1. Create Allowance ✅ **FULLY INTEGRATED**

**Endpoint:** `POST /api/allowances/`  
**Authentication:** Bearer Token  
**Description:** Create a new allowance for a child  
**Frontend Files:** `components/modals/AddAllowance.tsx`, `components/dashboard/parent/kids/wallet/AllowanceSettings.tsx`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Request

```json
{
  "kidId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "amount": 10.0,
  "frequency": "weekly",
  "status": "pending"
}
```

#### Response (201 Created)

```json
{
  "id": "allow123-4567-8901-2345-678901234567",
  "kidId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
  "amount": "10.00",
  "frequency": "weekly",
  "status": "pending",
  "createdAt": "2024-12-19T12:00:00Z",
  "lastPaidAt": null,
  "nextPaymentDate": "2024-12-26T12:00:00Z"
}
```

### 2. List Allowances ⚠️ **PARTIALLY INTEGRATED**

**Endpoint:** `GET /api/allowances/`  
**Authentication:** Bearer Token  
**Description:** Get allowances for the authenticated user  
**Frontend Files:** Endpoint defined but usage may need implementation

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Query Parameters

- `parentId` (optional): Filter by parent ID
- `kidId` (optional): Filter by child ID
- `status` (optional): Filter by status

#### Response (200 OK)

```json
[
  {
    "id": "allow123-4567-8901-2345-678901234567",
    "kidId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
    "amount": "10.00",
    "frequency": "weekly",
    "status": "active",
    "createdAt": "2024-12-19T12:00:00Z",
    "lastPaidAt": "2024-12-19T12:00:00Z",
    "nextPaymentDate": "2024-12-26T12:00:00Z"
  }
]
```

### 3. Get Wallet Information ✅ **FULLY INTEGRATED**

**Endpoint:** `GET /api/parents/wallet/`  
**Authentication:** Bearer Token  
**Description:** Get wallet/balance information for parent  
**Frontend Files:** `app/dashboard/parents/wallet/page.tsx`, `components/dashboard/parent/FamilyWalletDashboard.tsx`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
[
  {
    "id": "wallet123-4567-8901-2345-678901234567",
    "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
    "balance": 500.0,
    "currency": "USD",
    "lastUpdated": "2024-12-19T12:00:00Z"
  }
]
```

### 4. Get Transactions ✅ **FULLY INTEGRATED**

**Endpoint:** `GET /api/parents/wallet/transactions/`  
**Authentication:** Bearer Token  
**Description:** Get transaction history  
**Frontend Files:** `app/dashboard/parents/wallet/page.tsx`, wallet management components

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
{
  "transactions": [
    {
      "id": "trans123-4567-8901-2345-678901234567",
      "type": "allowance_payment",
      "amount": -10.0,
      "description": "Weekly allowance for Johnny",
      "kidId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "created_at": "2024-12-19T12:00:00Z"
    },
    {
      "id": "trans456-7890-1234-5678-901234567890",
      "type": "task_reward",
      "amount": -5.0,
      "description": "Reward for completing 'Clean Your Room'",
      "kidId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "created_at": "2024-12-18T16:45:00Z"
    }
  ]
}
```

---

## 📊 Data & Analytics

### 1. Get Activities/Chores (Legacy) ✅ **FULLY INTEGRATED**

**Endpoint:** `GET /api/activities/`  
**Authentication:** Bearer Token  
**Description:** Get activities/chores data (used for backward compatibility)  
**Frontend Files:** `components/dashboard/AppTable.tsx`, `components/dashboard/AppKidsActivities.tsx`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
[
  {
    "id": "activity123-4567-8901-2345-678901234567",
    "title": "Clean Your Room",
    "description": "Make your bed and organize your toys",
    "assignedTo": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "completed",
    "amount": 5.0,
    "createdAt": "2024-12-19T12:00:00Z",
    "completedAt": "2024-12-19T18:30:00Z"
  }
]
```

### 2. Get Chores (Legacy) ❌ **NOT INTEGRATED**

**Endpoint:** `GET /api/chores/`  
**Authentication:** Bearer Token  
**Description:** Get chores data (legacy endpoint for existing components)  
**Frontend Files:** Previously used but now replaced with `/api/taskmaster/tasks/`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
[
  {
    "id": "chore123-4567-8901-2345-678901234567",
    "title": "Clean Your Room",
    "description": "Make your bed and organize your toys",
    "reward": 5.0,
    "status": "completed",
    "assignedTo": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
    "category": "Household",
    "createdAt": "2024-12-19T12:00:00Z",
    "completedAt": "2024-12-19T18:30:00Z"
  }
]
```

### 3. Get Notifications ✅ **FULLY INTEGRATED**

**Endpoint:** `GET /api/parents/notifications/`  
**Authentication:** Bearer Token  
**Description:** Get notifications for parent  
**Frontend Files:** `components/dashboard/AppNotificationSettings.tsx`, `app/dashboard/parents/wallet/page.tsx`

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
[
  {
    "id": "notif123-4567-8901-2345-678901234567",
    "type": "task_completed",
    "title": "Task Completed",
    "message": "Johnny completed 'Clean Your Room'",
    "isRead": false,
    "createdAt": "2024-12-19T18:30:00Z",
    "relatedId": "task123-4567-8901-2345-678901234567"
  }
]
```

---

## 🎓 Educational Content

### 1. Get Financial Concepts

**Endpoint:** `GET /api/educational/financial-concepts/`  
**Authentication:** Bearer Token  
**Description:** Get financial education concepts for children

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
[
  {
    "id": "concept-1",
    "title": "Financial Concepts",
    "description": "Learn the basics of saving, spending, and earning money",
    "icon": "play",
    "color": "purple",
    "level": 1,
    "isCompleted": false,
    "topics": ["Saving", "Spending", "Earning", "Budgeting"]
  }
]
```

### 2. Get Financial Quiz

**Endpoint:** `GET /api/educational/financial-quiz/`  
**Authentication:** Bearer Token  
**Description:** Get financial education quiz for children

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
[
  {
    "id": "quiz-1",
    "title": "Financial Quiz",
    "description": "Test your knowledge with fun financial questions",
    "icon": "quiz",
    "color": "purple",
    "level": 1,
    "isCompleted": false,
    "questions": [
      {
        "id": "q1",
        "question": "What is the best way to save money?",
        "options": [
          "Spend it all",
          "Put it in a piggy bank",
          "Give it away",
          "Lose it"
        ],
        "correctAnswer": 1
      },
      {
        "id": "q2",
        "question": "Why is it important to budget?",
        "options": [
          "To waste money",
          "To plan spending",
          "To forget about money",
          "To spend more"
        ],
        "correctAnswer": 1
      }
    ]
  }
]
```

### 3. Get Learning Data

**Endpoint:** `GET /api/educational/learning-data/`  
**Authentication:** Bearer Token  
**Description:** Get general learning data and achievements

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
{
  "financialConcepts": [],
  "achievements": [
    {
      "id": "achievement-1",
      "title": "First Task Completed",
      "description": "Completed your first task!",
      "earnedAt": "2024-12-19T18:30:00Z",
      "type": "milestone"
    }
  ],
  "progressLessons": [
    {
      "id": "lesson-1",
      "title": "Introduction to Saving",
      "completed": true,
      "completedAt": "2024-12-19T15:00:00Z"
    }
  ]
}
```

### 4. Get Earn Rewards

**Endpoint:** `GET /api/educational/earn-rewards/`  
**Authentication:** Bearer Token  
**Description:** Get reward opportunities for children

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
[
  {
    "id": "reward-1",
    "title": "Earn Reward",
    "description": "Complete tasks to earn amazing rewards",
    "icon": "trophy",
    "color": "yellow",
    "level": 1,
    "isCompleted": false,
    "rewards": [
      {
        "type": "money",
        "amount": 500,
        "name": "Extra Allowance",
        "description": "Earn extra money for completing bonus tasks"
      },
      {
        "type": "privilege",
        "name": "Extra Screen Time",
        "description": "30 minutes extra screen time on weekends"
      }
    ]
  }
]
```

---

## 🎮 Gamification & Progress

### 1. Get Child Rewards

**Endpoint:** `GET /api/children/{childId}/rewards/`  
**Authentication:** Bearer Token  
**Description:** Get rewards for a specific child

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
[
  {
    "id": "reward-item-1",
    "title": "Extra Screen Time",
    "description": "30 minutes extra screen time on weekends",
    "cost": 100,
    "isRedeemed": false,
    "type": "privilege"
  },
  {
    "id": "reward-item-2",
    "title": "Toy Money",
    "description": "Extra money for toys",
    "cost": 200,
    "isRedeemed": true,
    "type": "money",
    "redeemedAt": "2024-12-18T10:00:00Z"
  }
]
```

### 2. Update Reward Redemption

**Endpoint:** `PATCH /api/children/{childId}/rewards/{rewardId}/`  
**Authentication:** Bearer Token  
**Description:** Mark a reward as redeemed or unredeemed

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Request

```json
{
  "isRedeemed": true
}
```

#### Response (200 OK)

```json
{
  "id": "reward-item-1",
  "title": "Extra Screen Time",
  "description": "30 minutes extra screen time on weekends",
  "cost": 100,
  "isRedeemed": true,
  "redeemedAt": "2024-12-19T20:00:00Z",
  "message": "Reward redeemed successfully!"
}
```

### 3. Get Daily Streaks

**Endpoint:** `GET /api/children/{childId}/daily-streaks/`  
**Authentication:** Bearer Token  
**Description:** Get daily streak data for a child

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
{
  "weeklyProgress": [
    {
      "day": "Monday",
      "completed": true
    },
    {
      "day": "Tuesday",
      "completed": true
    },
    {
      "day": "Wednesday",
      "completed": false
    },
    {
      "day": "Thursday",
      "completed": false
    },
    {
      "day": "Friday",
      "completed": false
    },
    {
      "day": "Saturday",
      "completed": false
    },
    {
      "day": "Sunday",
      "completed": false
    }
  ],
  "currentStreak": 2,
  "longestStreak": 7
}
```

### 4. Update Daily Streak

**Endpoint:** `PATCH /api/children/{childId}/daily-streaks/`  
**Authentication:** Bearer Token  
**Description:** Update daily streak completion status

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Request

```json
{
  "day": "Wednesday",
  "completed": true
}
```

#### Response (200 OK)

```json
{
  "day": "Wednesday",
  "completed": true,
  "message": "Daily streak updated successfully!"
}
```

---

## 📱 Alternative Endpoints (For POST filtering)

### 1. Get Chores by Child (POST)

**Endpoint:** `POST /api/chores/`  
**Authentication:** Bearer Token  
**Description:** Alternative method to get chores by child ID using POST

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Request

```json
{
  "kidId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

#### Response (200 OK)

```json
[
  {
    "id": "chore123-4567-8901-2345-678901234567",
    "title": "Clean Your Room",
    "description": "Make your bed and organize your toys",
    "reward": 5.0,
    "status": "completed",
    "assignedTo": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "parentId": "d3d3c95b-f94d-4527-9e03-e131512f903a",
    "category": "Household",
    "createdAt": "2024-12-19T12:00:00Z",
    "completedAt": "2024-12-19T18:30:00Z"
  }
]
```

### 2. Update Chore Status (PATCH)

**Endpoint:** `PATCH /api/chores/`  
**Authentication:** Bearer Token  
**Description:** Update chore/task status

#### Request Headers

```
Authorization: Bearer <jwt_token>
```

#### Request

```json
{
  "choreId": "chore123-4567-8901-2345-678901234567",
  "status": "completed"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "chore123-4567-8901-2345-678901234567",
    "status": "completed",
    "completedAt": "2024-12-19T18:30:00Z"
  },
  "message": "Chore status updated to completed"
}
```

---

## ⚠️ Error Responses

All endpoints should return consistent error responses:

### 400 Bad Request

```json
{
  "error": "Invalid request data",
  "details": {
    "field": ["This field is required."]
  }
}
```

### 401 Unauthorized

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found

```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred."
}
```

---

## 🚀 Implementation Priority

### High Priority (Core Functionality)

1. **Authentication endpoints** - Required for login/logout
2. **Children management** - Core feature for parent-child relationships
3. **Task management** - Primary functionality for chore assignment
4. **Basic financial management** - Allowance and wallet features

### Medium Priority (Enhanced Functionality)

1. **Educational content endpoints** - Gamification features
2. **Progress tracking** - Streaks and achievements
3. **Notifications** - Real-time updates

### Low Priority (Nice to Have)

1. **Advanced analytics endpoints** - Detailed reporting
2. **Legacy endpoint compatibility** - Gradual migration support

## 🚀 **PRIORITY FOR BACKEND ENGINEER**

### **HIGH PRIORITY** (Implement First)

1. **Task Management** - Create and List Tasks (currently causing chore creation issues)
2. **Children Management** - Create, List, Update Children
3. **Authentication** - User Login/Register, Child Login
4. **Core Data Flow** - Ensure proper task → child assignment flow

### **MEDIUM PRIORITY** (Implement Second)

1. **Financial Features** - Allowances, Wallet, Transactions
2. **Notifications** - Basic notification system
3. **Data Analytics** - Activities endpoint

### **LOW PRIORITY** (Implement Later)

1. **Task Operations** - Update/Delete individual tasks
2. **Advanced Features** - Detailed analytics, advanced permissions

---

**📧 Contact Frontend Team:** If any request/response formats need clarification, please reach out before implementing!

## 📝 Notes for Backend Implementation

1. **Authentication**: Implement JWT-based authentication with refresh token support
2. **Permissions**: Ensure parents can only access their own children's data
3. **Child Authentication**: Children should only access their own data
4. **Data Relationships**: Maintain proper foreign key relationships between users, children, and tasks
5. **Pagination**: Implement pagination for list endpoints with large datasets
6. **Filtering**: Support query parameters for filtering and searching
7. **Validation**: Validate all input data and return meaningful error messages
8. **Status Updates**: Ensure status changes trigger appropriate business logic (e.g., adding rewards to balance)
9. **Real-time Updates**: Consider WebSocket support for real-time notifications
10. **API Versioning**: Plan for future API versions with backward compatibility

---

## 🔧 Development Tips

1. **Mock Data**: The frontend currently uses mock data - ensure your responses match these structures
2. **CORS**: Configure CORS properly for frontend domain
3. **Testing**: Each endpoint should have comprehensive test coverage
4. **Documentation**: Use tools like Swagger/OpenAPI for interactive API documentation
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Logging**: Log API requests and responses for debugging
7. **Database Optimization**: Optimize database queries for performance
8. **Error Handling**: Implement consistent error handling across all endpoints

---

## 📊 INTEGRATION STATUS SUMMARY

### ✅ **FULLY INTEGRATED** (Ready for Backend Implementation)

The following endpoints are fully implemented in the frontend and actively being used:

#### Authentication & User Management

- ✅ `GET /api/users/` - Health Check
- ✅ `POST /api/users/register/` - User Registration
- ✅ `POST /api/users/login/` - User Login
- ✅ `POST /api/children/login/` - Child Login
- ✅ `POST /api/users/email-verify/` - Email Verification
- ✅ `POST /api/users/password-reset/` - Password Reset Request

#### Children Management

- ✅ `POST /api/children/create/` - Create Child
- ✅ `GET /api/children/list/` - List Children
- ✅ `GET /api/children/{childId}/` - Get Child Details
- ✅ `PUT /api/children/{childId}/update/` - Update Child
- ✅ `DELETE /api/children/{childId}/delete/` - Delete Child

#### Task/Chore Management

- ✅ `POST /api/taskmaster/tasks/create/` - Create Task
- ✅ `GET /api/taskmaster/tasks/` - List Tasks

#### Financial Management

- ✅ `POST /api/allowances/` - Create Allowance
- ✅ `GET /api/parents/wallet/` - Get Wallet Information
- ✅ `GET /api/parents/wallet/transactions/` - Get Transactions

#### Data & Analytics

- ✅ `GET /api/activities/` - Get Activities (Legacy)
- ✅ `GET /api/parents/notifications/` - Get Notifications

### ⚠️ **PARTIALLY INTEGRATED** (Endpoints Defined but Not Used)

These endpoints are defined in the frontend but not yet being called:

- ⚠️ `GET /api/taskmaster/tasks/{taskId}/` - Get Task Details
- ⚠️ `PUT /api/taskmaster/tasks/{taskId}/update/` - Update Task
- ⚠️ `PATCH /api/taskmaster/tasks/{taskId}/status/` - Update Task Status
- ⚠️ `DELETE /api/taskmaster/tasks/{taskId}/delete/` - Delete Task
- ⚠️ `GET /api/allowances/` - List Allowances

### ❌ **NOT INTEGRATED** (No Longer Used)

These endpoints were replaced or deprecated:

- ❌ `GET /api/chores/` - Get Chores (Legacy) → Replaced with `/api/taskmaster/tasks/`

### 🔧 **CRITICAL IMPLEMENTATION NOTES**

#### 1. **Child Data Requirements**

**MUST INCLUDE BOTH `name` AND `username` IN ALL CHILD ENDPOINTS:**

```json
{
  "id": "child-uuid",
  "username": "faith_joseph", // ← For login and task assignment
  "name": "Faith Joseph", // ← For display in UI
  "parent": "parent-uuid",
  "avatar": "url-or-null",
  "created_at": "2024-12-19T10:30:00Z"
}
```

#### 2. **Task Creation Request Format**

Frontend sends:

```json
{
  "title": "Make Bed",
  "description": "Make your bed neatly with sheets and blankets properly arranged",
  "reward": 5.0,
  "due_date": "2024-12-25",
  "assigned_to": "faith_joseph" // ← USERNAME, not child ID
}
```

#### 3. **Authentication Headers**

All protected endpoints expect:

```
Authorization: Bearer <jwt_token>
```

#### 4. **Response Format Requirements**

- **List Tasks Response**: Should return array of task objects with `assignedTo` as username
- **Child List Response**: Must include BOTH `username` AND `name` fields for each child
- **All endpoints**: Should return proper HTTP status codes (200, 201, 400, 401, 404, 500)

#### 5. **Frontend Display Logic**

- `name` field is used for display in UI (e.g., "Faith Joseph")
- `username` field is used for login and task assignment (e.g., "faith_joseph")
- If `name` is missing, frontend will format `username` as fallback

#### 6. **Error Handling**

Frontend expects consistent error response format:

```json
{
  "error": "Error message here",
  "details": "Optional additional details"
}
```

#### 7. **Frontend Fixes Needed**

- **CreateKidAccount Modal**: Should send `name` field in addition to `username` and `pin`
- **Task Assignment**: Currently using usernames correctly for `assigned_to` field

```

---
```
