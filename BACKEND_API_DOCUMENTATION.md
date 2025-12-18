# Waya Backend API Documentation

**Complete API Documentation for Backend Developers**

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication & Security](#authentication--security)
4. [Data Models & Schemas](#data-models--schemas)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Overview

### About Waya
Waya is a financial literacy and money management application designed to help parents teach their children smart money habits through chores, allowances, and financial tracking.

### Technology Stack
- **Backend Framework**: Django REST Framework
- **Database**: PostgreSQL (Neon Database)
- **Authentication**: JWT (JSON Web Tokens)
- **API Architecture**: RESTful API
- **Base URL**: `https://waya-mentorled.onrender.com/api/`

### Key Features
- Parent and child user management
- Task/chore creation and tracking
- Family wallet system with transactions
- Allowance management
- Educational content (MoneyMaze)
- Goal tracking (GoalGetter)
- Analytics and insights
- Notifications system

---

## Getting Started

### Base URL Configuration
```
Production: https://waya-mentorled.onrender.com/api/
Development: http://localhost:8000/api/
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Django Settings
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_LIFETIME=60  # minutes
REFRESH_TOKEN_LIFETIME=1440  # minutes (24 hours)

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Required Dependencies
```
Django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt>=5.2
django-cors-headers>=4.0
psycopg2-binary>=2.9
python-decouple>=3.8
dj-database-url>=2.0
```

---

## Authentication & Security

### Authentication Flow

#### 1. User Registration (Parent)
**Endpoint**: `POST /api/users/register/`

**Request Body**:
```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "password2": "SecurePass123",
  "role": "parent",
  "terms_accepted": true
}
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "role": "parent",
    "is_verified": false
  },
  "verification": {
    "token": "abc123def456",
    "uidb64": "MQ"
  }
}
```

#### 2. Email Verification
**Endpoint**: `POST /api/users/email-verify/`

**Request Body**:
```json
{
  "uidb64": "MQ",
  "token": "abc123def456"
}
```

**Response** (200 OK):
```json
{
  "message": "Email verified successfully. You can now login."
}
```

#### 3. User Login (Parent)
**Endpoint**: `POST /api/users/login/`

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "avatar": null,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 4. Child Login
**Endpoint**: `POST /api/children/login/`

**Request Body**:
```json
{
  "username": "johnny",
  "pin": "1234"
}
```

**Response** (200 OK):
```json
{
  "childId": "650e8400-e29b-41d4-a716-446655440001",
  "childUsername": "johnny",
  "childName": "Johnny Doe",
  "parentId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Authorization Headers
All authenticated requests must include:
```
Authorization: Bearer <access_token>
```

### Token Refresh
**Endpoint**: `POST /api/users/token/refresh/`

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Password Reset Flow

#### Step 1: Request Password Reset
**Endpoint**: `POST /api/users/forgot-password/`

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset email sent successfully."
}
```

#### Step 2: Confirm Password Reset
**Endpoint**: `POST /api/users/reset-password-confirm/`

**Request Body**:
```json
{
  "new_password1": "NewSecurePass123",
  "new_password2": "NewSecurePass123",
  "uidb64": "MQ",
  "token": "abc123def456"
}
```

**Response** (200 OK):
```json
{
  "detail": "Password has been reset successfully."
}
```

---

## Data Models & Schemas

### User Model (Parent)
```python
{
  "id": "uuid",                    # Primary key (UUID)
  "email": "string",               # Unique, required
  "full_name": "string",           # Required
  "role": "string",                # 'parent' or 'child'
  "is_verified": "boolean",        # Email verification status
  "avatar": "string (url)",        # Optional profile picture
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Child Model
```python
{
  "id": "uuid",                    # Primary key (UUID)
  "parent": "uuid",                # Foreign key to User (parent)
  "username": "string",            # Unique, required
  "name": "string",                # Display name, optional
  "pin": "string",                 # 4-digit PIN (hashed)
  "avatar": "string (url)",        # Optional profile picture
  "created_at": "datetime"
}
```

### Task/Chore Model
```python
{
  "id": "uuid",                    # Primary key (UUID)
  "title": "string",               # Required
  "description": "string",         # Required
  "amount": "decimal",             # Reward amount
  "due_date": "date",              # Optional
  "assignedTo": "uuid",            # Foreign key to Child
  "assignedToName": "string",      # Child's display name (read-only)
  "assignedToUsername": "string",  # Child's username (read-only)
  "parentId": "uuid",              # Foreign key to User (parent)
  "status": "string",              # 'pending', 'completed', 'missed'
  "createdAt": "datetime",
  "completedAt": "datetime",       # Nullable
  "category": "string"             # Optional
}
```

### Wallet Model
```python
{
  "id": "uuid",                    # Primary key (UUID)
  "user": "uuid",                  # Foreign key to User (parent)
  "balance": "decimal",            # Current balance
  "currency": "string",            # Default: "NGN"
  "pin": "string",                 # Wallet PIN (hashed), optional
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Child Wallet Model
```python
{
  "id": "uuid",                    # Primary key (UUID)
  "child": "uuid",                 # Foreign key to Child
  "parent_wallet": "uuid",         # Foreign key to Wallet
  "balance": "decimal",            # Current balance
  "total_earned": "decimal",       # Lifetime earnings
  "total_spent": "decimal",        # Lifetime spending
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Transaction Model
```python
{
  "id": "uuid",                    # Primary key (UUID)
  "type": "string",                # 'credit', 'debit', 'transfer', 'reward'
  "amount": "decimal",             # Transaction amount
  "status": "string",              # 'pending', 'completed', 'cancelled', 'paid'
  "description": "string",         # Transaction description
  "child": "uuid",                 # Foreign key to Child, nullable
  "child_name": "string",          # Child's display name (read-only)
  "wallet": "uuid",                # Foreign key to Wallet
  "chore": "uuid",                 # Foreign key to Chore, nullable
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Allowance Model
```python
{
  "id": "uuid",                    # Primary key (UUID)
  "parent_id": "uuid",             # Foreign key to User (parent)
  "child_id": "uuid",              # Foreign key to Child
  "amount": "decimal",             # Allowance amount
  "frequency": "string",           # 'daily', 'weekly', 'monthly'
  "status": "string",              # 'active', 'paused', 'cancelled'
  "created_at": "datetime",
  "last_paid_at": "datetime",      # Nullable
  "next_payment_date": "date"      # Nullable
}
```

### MoneyMaze Concept Model
```python
{
  "id": "uuid",                    # Primary key (UUID)
  "title": "string",               # Concept title
  "description": "string",         # Concept description
  "level": "integer",              # Difficulty level
  "order": "integer",              # Display order
  "is_active": "boolean",          # Active status
  "created_at": "datetime"
}
```

### Goal Model (GoalGetter)
```python
{
  "id": "uuid",                    # Primary key (UUID)
  "child": "uuid",                 # Foreign key to Child
  "title": "string",               # Goal title
  "description": "string",         # Goal description
  "target_amount": "decimal",      # Target amount to save
  "current_amount": "decimal",     # Current saved amount
  "status": "string",              # 'in_progress', 'completed', 'cancelled'
  "created_at": "datetime",
  "completed_at": "datetime"       # Nullable
}
```

---

## API Endpoints

### 1. Authentication & User Management

#### 1.1 Register User
```
POST /api/users/register/
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "password2": "SecurePass123",
  "role": "parent",
  "terms_accepted": true
}

Response (201):
{
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "role": "parent",
    "is_verified": false
  }
}
```

#### 1.2 Login User
```
POST /api/users/login/
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "avatar": null,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 1.3 Change Password
```
PUT /api/users/password-change/
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "SecurePass123",
  "new_password": "NewSecurePass456"
}

Response (200):
{
  "message": "Password changed successfully."
}
```

#### 1.4 Verify Email
```
POST /api/users/email-verify/
Content-Type: application/json

{
  "uidb64": "MQ",
  "token": "abc123def456"
}

Response (200):
{
  "message": "Email verified successfully. You can now login."
}
```

#### 1.5 Resend Verification Email
```
POST /api/users/resend-email/
Content-Type: application/json

{
  "email": "john.doe@example.com"
}

Response (200):
{
  "message": "Verification email sent successfully."
}
```

#### 1.6 Google OAuth Login
```
POST /api/users/social-login/google/
Content-Type: application/json

{
  "token": "google-oauth-token"
}

Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "avatar": "https://...",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

### 2. Children Management

#### 2.1 Create Child
```
POST /api/children/
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "johnny",
  "name": "Johnny Doe",
  "pin": "1234"
}

Response (201):
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "username": "johnny",
  "name": "Johnny Doe",
  "avatar": null
}
```

#### 2.2 List Children
```
GET /api/children/
Authorization: Bearer <token>

Response (200):
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "parent": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johnny",
      "name": "Johnny Doe",
      "avatar": null,
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440002",
      "parent": "550e8400-e29b-41d4-a716-446655440000",
      "username": "sarah",
      "name": "Sarah Doe",
      "avatar": null,
      "created_at": "2025-01-16T14:20:00Z"
    }
  ]
}
```

#### 2.3 Get Child Details
```
GET /api/children/<child_id>/
Authorization: Bearer <token>

Response (200):
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "parent": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johnny",
  "name": "Johnny Doe",
  "avatar": null,
  "created_at": "2025-01-15T10:30:00Z"
}
```

#### 2.4 Update Child
```
PUT /api/children/<child_id>/
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "johnny_updated",
  "name": "Johnny Updated",
  "pin": "5678"
}

Response (200):
{
  "username": "johnny_updated",
  "name": "Johnny Updated",
  "avatar": null
}
```

#### 2.5 Delete Child
```
DELETE /api/children/<child_id>/
Authorization: Bearer <token>

Response (204 No Content)
```

#### 2.6 Child Login
```
POST /api/children/login/
Content-Type: application/json

{
  "username": "johnny",
  "pin": "1234"
}

Response (200):
{
  "childId": "650e8400-e29b-41d4-a716-446655440001",
  "childUsername": "johnny",
  "childName": "Johnny Doe",
  "parentId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

### 3. Task/Chore Management (Taskmaster)

#### 3.1 Create Chore
```
POST /api/taskmaster/chores/create/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Clean Room",
  "description": "Clean and organize your bedroom",
  "assigned_to": "650e8400-e29b-41d4-a716-446655440001",
  "reward": 500,
  "due_date": "2025-01-20"
}

Response (201):
{
  "id": "750e8400-e29b-41d4-a716-446655440003",
  "title": "Clean Room",
  "description": "Clean and organize your bedroom",
  "amount": "500.00",
  "due_date": "2025-01-20",
  "assignedTo": "650e8400-e29b-41d4-a716-446655440001",
  "assignedToName": "Johnny Doe",
  "assignedToUsername": "johnny",
  "parentId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "createdAt": "2025-01-15T10:30:00Z",
  "completedAt": null
}
```

#### 3.2 List Chores
```
GET /api/taskmaster/chores/?status=pending&assignedTo=<child_id>
Authorization: Bearer <token>

Query Parameters:
- status: pending | completed | missed
- assignedTo: <child_id>
- category: <category_name>

Response (200):
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "750e8400-e29b-41d4-a716-446655440003",
      "title": "Clean Room",
      "description": "Clean and organize your bedroom",
      "amount": "500.00",
      "due_date": "2025-01-20",
      "assignedTo": "650e8400-e29b-41d4-a716-446655440001",
      "assignedToName": "Johnny Doe",
      "status": "pending",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### 3.3 Get Chore Details
```
GET /api/taskmaster/chores/<chore_id>/
Authorization: Bearer <token>

Response (200):
{
  "id": "750e8400-e29b-41d4-a716-446655440003",
  "title": "Clean Room",
  "description": "Clean and organize your bedroom",
  "amount": "500.00",
  "due_date": "2025-01-20",
  "assignedTo": "650e8400-e29b-41d4-a716-446655440001",
  "assignedToName": "Johnny Doe",
  "status": "pending",
  "createdAt": "2025-01-15T10:30:00Z",
  "completedAt": null
}
```

#### 3.4 Update Chore
```
PUT /api/taskmaster/chores/<chore_id>/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Clean Room - Updated",
  "description": "Clean and organize your bedroom thoroughly",
  "reward": 750,
  "due_date": "2025-01-22"
}

Response (200):
{
  "id": "750e8400-e29b-41d4-a716-446655440003",
  "title": "Clean Room - Updated",
  "description": "Clean and organize your bedroom thoroughly",
  "amount": "750.00",
  "due_date": "2025-01-22",
  "status": "pending"
}
```

#### 3.5 Delete Chore
```
DELETE /api/taskmaster/chores/<chore_id>/delete/
Authorization: Bearer <token>

Response (204 No Content)
```

#### 3.6 Update Chore Status (Parent)
```
PATCH /api/taskmaster/chores/<chore_id>/status/
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed"
}

Response (200):
{
  "id": "750e8400-e29b-41d4-a716-446655440003",
  "status": "completed",
  "completedAt": "2025-01-16T15:30:00Z"
}
```

#### 3.7 Get Chore Summary
```
GET /api/taskmaster/chores/summary/
Authorization: Bearer <token>

Response (200):
{
  "total": 15,
  "pending": 5,
  "completed": 8,
  "missed": 2
}
```

---

### 4. ChoreQuest (Child Interface)

#### 4.1 List Child Chores
```
GET /api/chorequest/chores/?status=pending
Authorization: Bearer <child_token>

Response (200):
{
  "count": 3,
  "results": [
    {
      "id": "750e8400-e29b-41d4-a716-446655440003",
      "title": "Clean Room",
      "description": "Clean and organize your bedroom",
      "amount": "500.00",
      "due_date": "2025-01-20",
      "status": "pending",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### 4.2 Update Chore Status (Child)
```
PATCH /api/chorequest/chores/<chore_id>/status/
Authorization: Bearer <child_token>
Content-Type: application/json

{
  "status": "completed"
}

Response (200):
{
  "id": "750e8400-e29b-41d4-a716-446655440003",
  "status": "completed",
  "message": "Chore marked as completed. Waiting for parent approval."
}
```

#### 4.3 Redeem Chore Reward
```
PATCH /api/chorequest/chores/<chore_id>/redeem/
Authorization: Bearer <child_token>

Response (200):
{
  "message": "Reward redeemed successfully!",
  "reward_amount": "500.00",
  "new_balance": "1250.00"
}
```

---

### 5. Family Wallet Management

#### 5.1 Get Wallet Details
```
GET /api/familywallet/wallet/
Authorization: Bearer <token>

Response (200):
{
  "id": "850e8400-e29b-41d4-a716-446655440004",
  "user": "550e8400-e29b-41d4-a716-446655440000",
  "balance": "5000.00",
  "currency": "NGN",
  "created_at": "2025-01-10T09:00:00Z",
  "updated_at": "2025-01-16T16:00:00Z"
}
```

#### 5.2 Add Funds to Wallet
```
POST /api/familywallet/wallet/add_funds/
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "pin": "1234"
}

Response (200):
{
  "message": "Funds added successfully!",
  "new_balance": "15000.00"
}
```

#### 5.3 Transfer Funds to Child
```
POST /api/familywallet/wallet/transfer/
Authorization: Bearer <token>
Content-Type: application/json

{
  "child_id": "650e8400-e29b-41d4-a716-446655440001",
  "amount": 1000,
  "pin": "1234",
  "description": "Weekly allowance"
}

Response (200):
{
  "message": "Transfer successful!",
  "transaction_id": "950e8400-e29b-41d4-a716-446655440005",
  "parent_balance": "14000.00",
  "child_balance": "2000.00"
}
```

#### 5.4 Set Wallet PIN
```
POST /api/familywallet/wallet/set_pin/
Authorization: Bearer <token>
Content-Type: application/json

{
  "pin": "1234",
  "confirm_pin": "1234"
}

Response (200):
{
  "message": "PIN set successfully!"
}
```

#### 5.5 Get Wallet Dashboard Stats
```
GET /api/familywallet/wallet/dashboard_stats/
Authorization: Bearer <token>

Response (200):
{
  "total_balance": "15000.00",
  "total_children": 2,
  "total_spent": "5000.00",
  "total_earned": "8000.00",
  "pending_transactions": 3,
  "completed_transactions": 25
}
```

#### 5.6 Get Earnings Chart Data
```
GET /api/familywallet/wallet/earnings_chart_data/
Authorization: Bearer <token>

Response (200):
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "earnings": [500, 750, 1000, 500, 1250, 800, 600],
  "spending": [300, 400, 500, 200, 600, 350, 250]
}
```

#### 5.7 Get Savings Breakdown
```
GET /api/familywallet/wallet/savings_breakdown/
Authorization: Bearer <token>

Response (200):
{
  "total_savings": "10000.00",
  "children": [
    {
      "child_id": "650e8400-e29b-41d4-a716-446655440001",
      "child_name": "Johnny Doe",
      "savings": "6000.00",
      "percentage": 60
    },
    {
      "child_id": "650e8400-e29b-41d4-a716-446655440002",
      "child_name": "Sarah Doe",
      "savings": "4000.00",
      "percentage": 40
    }
  ]
}
```

#### 5.8 Get Reward Bar Chart
```
GET /api/familywallet/wallet/reward_bar_chart/
Authorization: Bearer <token>

Response (200):
{
  "labels": ["Johnny", "Sarah"],
  "data": [3500, 2800]
}
```

#### 5.9 Get Reward Pie Chart
```
GET /api/familywallet/wallet/reward_pie_chart/
Authorization: Bearer <token>

Response (200):
{
  "labels": ["Chores", "Goals", "Allowance", "Bonus"],
  "data": [4500, 1200, 3000, 800]
}
```

#### 5.10 Make Payment
```
POST /api/familywallet/wallet/make_payment/
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500,
  "description": "Purchase toy",
  "child_id": "650e8400-e29b-41d4-a716-446655440001",
  "pin": "1234"
}

Response (200):
{
  "message": "Payment successful!",
  "transaction_id": "950e8400-e29b-41d4-a716-446655440006",
  "new_balance": "1500.00"
}
```

---

### 6. Child Wallet Management

#### 6.1 List Child Wallets
```
GET /api/familywallet/child-wallets/
Authorization: Bearer <token>

Response (200):
{
  "count": 2,
  "results": [
    {
      "id": "a50e8400-e29b-41d4-a716-446655440007",
      "child": "650e8400-e29b-41d4-a716-446655440001",
      "child_name": "Johnny Doe",
      "balance": "2000.00",
      "total_earned": "5000.00",
      "total_spent": "3000.00",
      "created_at": "2025-01-10T09:00:00Z"
    },
    {
      "id": "a50e8400-e29b-41d4-a716-446655440008",
      "child": "650e8400-e29b-41d4-a716-446655440002",
      "child_name": "Sarah Doe",
      "balance": "1500.00",
      "total_earned": "3000.00",
      "total_spent": "1500.00",
      "created_at": "2025-01-11T10:00:00Z"
    }
  ]
}
```

#### 6.2 Get Child Wallet Analysis
```
GET /api/familywallet/child-wallets/analysis/
Authorization: Bearer <token>

Response (200):
{
  "total_children": 2,
  "total_balance": "3500.00",
  "total_earned": "8000.00",
  "total_spent": "4500.00",
  "average_balance": "1750.00",
  "top_earner": {
    "child_id": "650e8400-e29b-41d4-a716-446655440001",
    "child_name": "Johnny Doe",
    "total_earned": "5000.00"
  }
}
```

---

### 7. Transaction Management

#### 7.1 List Transactions
```
GET /api/familywallet/transactions/?status=completed&type=reward
Authorization: Bearer <token>

Query Parameters:
- status: pending | completed | cancelled | paid
- type: credit | debit | transfer | reward
- child_id: <child_id>

Response (200):
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "950e8400-e29b-41d4-a716-446655440005",
      "type": "reward",
      "amount": "500.00",
      "status": "completed",
      "description": "Reward for chore 750e8400-e29b-41d4-a716-446655440003",
      "child": "650e8400-e29b-41d4-a716-446655440001",
      "child_name": "Johnny Doe",
      "created_at": "2025-01-16T15:30:00Z",
      "updated_at": "2025-01-16T15:30:00Z"
    }
  ]
}
```

#### 7.2 Create Transaction
```
POST /api/familywallet/transactions/
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "reward",
  "amount": 500,
  "child": "650e8400-e29b-41d4-a716-446655440001",
  "description": "Bonus reward",
  "status": "pending"
}

Response (201):
{
  "id": "950e8400-e29b-41d4-a716-446655440009",
  "type": "reward",
  "amount": "500.00",
  "status": "pending",
  "description": "Bonus reward",
  "child": "650e8400-e29b-41d4-a716-446655440001",
  "created_at": "2025-01-16T16:00:00Z"
}
```

#### 7.3 Get Transaction Details
```
GET /api/familywallet/transactions/<transaction_id>/
Authorization: Bearer <token>

Response (200):
{
  "id": "950e8400-e29b-41d4-a716-446655440005",
  "type": "reward",
  "amount": "500.00",
  "status": "completed",
  "description": "Reward for chore",
  "child": "650e8400-e29b-41d4-a716-446655440001",
  "child_name": "Johnny Doe",
  "created_at": "2025-01-16T15:30:00Z"
}
```

#### 7.4 Complete Transaction
```
POST /api/familywallet/transactions/<transaction_id>/complete/
Authorization: Bearer <token>

Response (200):
{
  "message": "Transaction completed successfully!",
  "transaction": {
    "id": "950e8400-e29b-41d4-a716-446655440009",
    "status": "completed",
    "completed_at": "2025-01-16T16:05:00Z"
  }
}
```

#### 7.5 Cancel Transaction
```
POST /api/familywallet/transactions/<transaction_id>/cancel/
Authorization: Bearer <token>

Response (200):
{
  "message": "Transaction cancelled successfully!",
  "transaction": {
    "id": "950e8400-e29b-41d4-a716-446655440009",
    "status": "cancelled"
  }
}
```

#### 7.6 Complete Multiple Transactions
```
POST /api/familywallet/transactions/complete_multiple/
Authorization: Bearer <token>
Content-Type: application/json

{
  "transaction_ids": [
    "950e8400-e29b-41d4-a716-446655440009",
    "950e8400-e29b-41d4-a716-446655440010"
  ]
}

Response (200):
{
  "message": "2 transactions completed successfully!",
  "completed_transactions": [
    "950e8400-e29b-41d4-a716-446655440009",
    "950e8400-e29b-41d4-a716-446655440010"
  ]
}
```

#### 7.7 Get Recent Activities
```
GET /api/familywallet/transactions/recent_activities/
Authorization: Bearer <token>

Response (200):
{
  "activities": [
    {
      "id": "950e8400-e29b-41d4-a716-446655440005",
      "type": "reward",
      "amount": "500.00",
      "status": "completed",
      "description": "Chore reward",
      "child_name": "Johnny Doe",
      "created_at": "2025-01-16T15:30:00Z"
    },
    {
      "id": "950e8400-e29b-41d4-a716-446655440006",
      "type": "debit",
      "amount": "200.00",
      "status": "completed",
      "description": "Purchase toy",
      "child_name": "Sarah Doe",
      "created_at": "2025-01-16T14:00:00Z"
    }
  ]
}
```

---

### 8. Allowance Management

#### 8.1 Create Allowance
```
POST /api/familywallet/allowances/
Authorization: Bearer <token>
Content-Type: application/json

{
  "child_id": "650e8400-e29b-41d4-a716-446655440001",
  "amount": 1000,
  "frequency": "weekly",
  "status": "active"
}

Response (201):
{
  "id": "b50e8400-e29b-41d4-a716-446655440011",
  "parent_id": "550e8400-e29b-41d4-a716-446655440000",
  "child_id": "650e8400-e29b-41d4-a716-446655440001",
  "amount": "1000.00",
  "frequency": "weekly",
  "status": "active",
  "created_at": "2025-01-16T10:00:00Z",
  "next_payment_date": "2025-01-23"
}
```

#### 8.2 List Allowances
```
GET /api/familywallet/allowances/?status=active
Authorization: Bearer <token>

Response (200):
{
  "count": 2,
  "results": [
    {
      "id": "b50e8400-e29b-41d4-a716-446655440011",
      "parent_id": "550e8400-e29b-41d4-a716-446655440000",
      "child_id": "650e8400-e29b-41d4-a716-446655440001",
      "amount": "1000.00",
      "frequency": "weekly",
      "status": "active",
      "created_at": "2025-01-16T10:00:00Z",
      "last_paid_at": "2025-01-16T10:00:00Z",
      "next_payment_date": "2025-01-23"
    }
  ]
}
```

#### 8.3 Get Allowance Details
```
GET /api/familywallet/allowances/<allowance_id>/
Authorization: Bearer <token>

Response (200):
{
  "id": "b50e8400-e29b-41d4-a716-446655440011",
  "parent_id": "550e8400-e29b-41d4-a716-446655440000",
  "child_id": "650e8400-e29b-41d4-a716-446655440001",
  "amount": "1000.00",
  "frequency": "weekly",
  "status": "active",
  "created_at": "2025-01-16T10:00:00Z",
  "next_payment_date": "2025-01-23"
}
```

#### 8.4 Update Allowance
```
PUT /api/familywallet/allowances/<allowance_id>/
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500,
  "frequency": "weekly",
  "status": "active"
}

Response (200):
{
  "id": "b50e8400-e29b-41d4-a716-446655440011",
  "amount": "1500.00",
  "frequency": "weekly",
  "status": "active",
  "next_payment_date": "2025-01-23"
}
```

#### 8.5 Delete Allowance
```
DELETE /api/familywallet/allowances/<allowance_id>/
Authorization: Bearer <token>

Response (204 No Content)
```

---

### 9. MoneyMaze (Educational System)

#### 9.1 List Financial Concepts
```
GET /api/moneymaze/concepts/
Authorization: Bearer <child_token>

Response (200):
{
  "count": 5,
  "results": [
    {
      "id": "c50e8400-e29b-41d4-a716-446655440012",
      "title": "Saving Money",
      "description": "Learn how to save money effectively",
      "level": 1,
      "order": 1,
      "is_active": true,
      "created_at": "2025-01-10T09:00:00Z"
    },
    {
      "id": "c50e8400-e29b-41d4-a716-446655440013",
      "title": "Spending Wisely",
      "description": "Learn to make smart spending decisions",
      "level": 2,
      "order": 2,
      "is_active": true,
      "created_at": "2025-01-10T09:00:00Z"
    }
  ]
}
```

#### 9.2 Get Concept Progress
```
GET /api/moneymaze/concepts/progress/
Authorization: Bearer <child_token>

Response (200):
{
  "total_concepts": 5,
  "completed_concepts": 2,
  "progress_percentage": 40,
  "concepts": [
    {
      "concept_id": "c50e8400-e29b-41d4-a716-446655440012",
      "concept_title": "Saving Money",
      "completed": true,
      "quiz_score": 85,
      "completed_at": "2025-01-15T14:00:00Z"
    },
    {
      "concept_id": "c50e8400-e29b-41d4-a716-446655440013",
      "concept_title": "Spending Wisely",
      "completed": false,
      "quiz_score": null,
      "completed_at": null
    }
  ]
}
```

#### 9.3 Get Quiz Details
```
GET /api/moneymaze/quizzes/<quiz_id>/
Authorization: Bearer <child_token>

Response (200):
{
  "id": "d50e8400-e29b-41d4-a716-446655440014",
  "concept": "c50e8400-e29b-41d4-a716-446655440012",
  "title": "Saving Money Quiz",
  "description": "Test your knowledge about saving money",
  "passing_score": 70,
  "questions": [
    {
      "id": "e50e8400-e29b-41d4-a716-446655440015",
      "question_text": "What is the best way to save money?",
      "question_type": "multiple_choice",
      "answer_choices": [
        {
          "id": "f50e8400-e29b-41d4-a716-446655440016",
          "choice_text": "Keep it in a piggy bank",
          "is_correct": false
        },
        {
          "id": "f50e8400-e29b-41d4-a716-446655440017",
          "choice_text": "Put it in a savings account",
          "is_correct": true
        },
        {
          "id": "f50e8400-e29b-41d4-a716-446655440018",
          "choice_text": "Hide it under the bed",
          "is_correct": false
        }
      ]
    }
  ]
}
```

#### 9.4 Submit Quiz Answers
```
POST /api/moneymaze/quizzes/submit/
Authorization: Bearer <child_token>
Content-Type: application/json

{
  "quiz_id": "d50e8400-e29b-41d4-a716-446655440014",
  "answers": [
    {
      "question_id": "e50e8400-e29b-41d4-a716-446655440015",
      "selected_choice_id": "f50e8400-e29b-41d4-a716-446655440017"
    }
  ]
}

Response (200):
{
  "quiz_id": "d50e8400-e29b-41d4-a716-446655440014",
  "score": 85,
  "passing_score": 70,
  "passed": true,
  "total_questions": 10,
  "correct_answers": 8,
  "reward_earned": "100.00",
  "message": "Congratulations! You passed the quiz!"
}
```

#### 9.5 List Earned Rewards
```
GET /api/moneymaze/rewards/
Authorization: Bearer <child_token>

Response (200):
{
  "count": 3,
  "total_rewards": "350.00",
  "results": [
    {
      "id": "g50e8400-e29b-41d4-a716-446655440019",
      "quiz": "d50e8400-e29b-41d4-a716-446655440014",
      "quiz_title": "Saving Money Quiz",
      "amount": "100.00",
      "earned_at": "2025-01-15T14:00:00Z"
    }
  ]
}
```

#### 9.6 Get Learning Dashboard
```
GET /api/moneymaze/dashboard/
Authorization: Bearer <child_token>

Response (200):
{
  "total_concepts": 5,
  "completed_concepts": 2,
  "total_quizzes": 5,
  "passed_quizzes": 2,
  "total_rewards": "250.00",
  "current_streak": 7,
  "progress_percentage": 40,
  "recent_achievements": [
    {
      "title": "Saving Money Master",
      "description": "Completed Saving Money quiz with 85%",
      "earned_at": "2025-01-15T14:00:00Z"
    }
  ]
}
```

---

### 10. GoalGetter (Goal Management)

#### 10.1 List Child Goals
```
GET /api/goalgetter/goals/
Authorization: Bearer <child_token>

Response (200):
{
  "count": 2,
  "results": [
    {
      "id": "h50e8400-e29b-41d4-a716-446655440020",
      "child": "650e8400-e29b-41d4-a716-446655440001",
      "title": "Buy a new bike",
      "description": "Save for a new bicycle",
      "target_amount": "5000.00",
      "current_amount": "2500.00",
      "progress_percentage": 50,
      "status": "in_progress",
      "created_at": "2025-01-10T10:00:00Z"
    }
  ]
}
```

#### 10.2 Get Goal Progress
```
GET /api/goalgetter/progress/
Authorization: Bearer <child_token>

Response (200):
{
  "total_goals": 2,
  "active_goals": 1,
  "completed_goals": 1,
  "total_target_amount": "10000.00",
  "total_saved_amount": "6500.00",
  "overall_progress": 65
}
```

#### 10.3 Get GoalGetter Leaderboard
```
GET /api/goalgetter/leaderboard/
Authorization: Bearer <token>

Response (200):
{
  "leaderboard": [
    {
      "rank": 1,
      "child_id": "650e8400-e29b-41d4-a716-446655440001",
      "child_name": "Johnny Doe",
      "goals_completed": 3,
      "total_saved": "8000.00"
    },
    {
      "rank": 2,
      "child_id": "650e8400-e29b-41d4-a716-446655440002",
      "child_name": "Sarah Doe",
      "goals_completed": 2,
      "total_saved": "5000.00"
    }
  ]
}
```

#### 10.4 Get GoalGetter Rewards
```
GET /api/goalgetter/rewards/
Authorization: Bearer <child_token>

Response (200):
{
  "total_rewards": "500.00",
  "rewards": [
    {
      "id": "i50e8400-e29b-41d4-a716-446655440021",
      "goal_id": "h50e8400-e29b-41d4-a716-446655440020",
      "goal_title": "Buy a new bike",
      "reward_amount": "200.00",
      "earned_at": "2025-01-15T16:00:00Z"
    }
  ]
}
```

---

### 11. Analytics & Insights

#### 11.1 Get Chore Insights
```
GET /api/insighttracker/chores/insights/
Authorization: Bearer <token>

Response (200):
{
  "total_chores": 50,
  "completed_chores": 35,
  "pending_chores": 10,
  "missed_chores": 5,
  "completion_rate": 70,
  "average_completion_time": "2 days",
  "top_performer": {
    "child_id": "650e8400-e29b-41d4-a716-446655440001",
    "child_name": "Johnny Doe",
    "completed_chores": 20
  },
  "insights_by_category": [
    {
      "category": "Cleaning",
      "total": 20,
      "completed": 15,
      "completion_rate": 75
    },
    {
      "category": "Homework",
      "total": 15,
      "completed": 12,
      "completion_rate": 80
    }
  ]
}
```

---

### 12. Notifications

#### 12.1 List Notifications
```
GET /api/parents/notifications/
Authorization: Bearer <token>

Response (200):
{
  "count": 5,
  "unread_count": 2,
  "results": [
    {
      "id": "j50e8400-e29b-41d4-a716-446655440022",
      "type": "chore_completed",
      "title": "Chore Completed",
      "message": "Johnny has completed 'Clean Room'",
      "is_read": false,
      "created_at": "2025-01-16T15:30:00Z",
      "related_object_type": "chore",
      "related_object_id": "750e8400-e29b-41d4-a716-446655440003"
    }
  ]
}
```

#### 12.2 Mark Notification as Read
```
POST /api/parents/notifications/<notification_id>/read/
Authorization: Bearer <token>

Response (200):
{
  "message": "Notification marked as read",
  "notification": {
    "id": "j50e8400-e29b-41d4-a716-446655440022",
    "is_read": true,
    "read_at": "2025-01-16T16:00:00Z"
  }
}
```

#### 12.3 Get User Profile
```
GET /api/parents/notifications/profile/
Authorization: Bearer <token>

Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "avatar": null,
  "created_at": "2025-01-10T09:00:00Z"
}
```

#### 12.4 Get Child Profile
```
GET /api/parents/notifications/children/<child_id>/profile/
Authorization: Bearer <token>

Response (200):
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "username": "johnny",
  "name": "Johnny Doe",
  "avatar": null,
  "total_earned": "5000.00",
  "total_spent": "3000.00",
  "current_balance": "2000.00",
  "completed_chores": 20,
  "pending_chores": 5
}
```

---

### 13. Settings

#### 13.1 Get User Profile Settings
```
GET /api/settings_waya/profile/
Authorization: Bearer <token>

Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "avatar": null,
  "phone_number": "+234XXXXXXXXXX",
  "notification_preferences": {
    "email_notifications": true,
    "push_notifications": true
  }
}
```

#### 13.2 Update User Profile
```
PUT /api/settings_waya/profile/
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Updated Doe",
  "phone_number": "+234XXXXXXXXXX"
}

Response (200):
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "John Updated Doe",
    "phone_number": "+234XXXXXXXXXX"
  }
}
```

#### 13.3 Get Notification Settings
```
GET /api/settings_waya/notification-settings/
Authorization: Bearer <token>

Response (200):
{
  "email_notifications": true,
  "push_notifications": true,
  "chore_completion_alerts": true,
  "allowance_reminders": true,
  "goal_milestone_alerts": true
}
```

#### 13.4 Update Notification Settings
```
PUT /api/settings_waya/notification-settings/
Authorization: Bearer <token>
Content-Type: application/json

{
  "email_notifications": false,
  "push_notifications": true,
  "chore_completion_alerts": true
}

Response (200):
{
  "message": "Notification settings updated successfully"
}
```

---

## Error Handling

### HTTP Status Codes
```
200 OK - Request successful
201 Created - Resource created successfully
204 No Content - Resource deleted successfully
400 Bad Request - Invalid request data
401 Unauthorized - Authentication required or token invalid
403 Forbidden - Insufficient permissions
404 Not Found - Resource not found
500 Internal Server Error - Server error
```

### Error Response Format
```json
{
  "error": "Error message",
  "detail": "Detailed error description",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Common Error Codes
```
INVALID_CREDENTIALS - Invalid email/password
TOKEN_EXPIRED - JWT token has expired
TOKEN_INVALID - JWT token is invalid
EMAIL_NOT_VERIFIED - Email verification required
INSUFFICIENT_FUNDS - Not enough balance
INVALID_PIN - Incorrect PIN
PERMISSION_DENIED - User lacks required permissions
RESOURCE_NOT_FOUND - Requested resource doesn't exist
VALIDATION_ERROR - Request data validation failed
```

### Example Error Responses

#### Authentication Error
```json
{
  "error": "Invalid credentials",
  "detail": "Email or password is incorrect",
  "code": "INVALID_CREDENTIALS",
  "status": 401
}
```

#### Validation Error
```json
{
  "error": "Validation error",
  "detail": {
    "email": ["Enter a valid email address"],
    "password": ["Password must be at least 6 characters"]
  },
  "code": "VALIDATION_ERROR",
  "status": 400
}
```

#### Insufficient Funds Error
```json
{
  "error": "Insufficient funds",
  "detail": "Your wallet balance is too low for this transaction",
  "code": "INSUFFICIENT_FUNDS",
  "status": 400
}
```

---

## Best Practices

### 1. Security
- Always use HTTPS in production
- Store JWT tokens securely (HttpOnly cookies preferred)
- Never expose sensitive data in logs
- Implement rate limiting to prevent abuse
- Hash all PINs and passwords using bcrypt or similar
- Validate and sanitize all user inputs

### 2. Authentication
- Refresh tokens before they expire
- Implement token refresh mechanism
- Use appropriate token lifetimes (access: 1 hour, refresh: 24 hours)
- Logout: Clear tokens from client storage

### 3. API Usage
- Always include proper error handling
- Use pagination for list endpoints
- Implement caching where appropriate
- Filter sensitive data in responses
- Version your API endpoints (/api/v1/)

### 4. Database
- Use database transactions for wallet operations
- Implement proper indexing for frequently queried fields
- Use UUID for primary keys for better security
- Backup database regularly

### 5. Testing
- Write unit tests for all endpoints
- Test authentication and authorization
- Test edge cases (insufficient funds, etc.)
- Load test critical endpoints

---

## cURL Examples

### Register User
```bash
curl -X POST https://waya-mentorled.onrender.com/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "password2": "SecurePass123",
    "role": "parent",
    "terms_accepted": true
  }'
```

### Login User
```bash
curl -X POST https://waya-mentorled.onrender.com/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

### Create Child (with auth token)
```bash
curl -X POST https://waya-mentorled.onrender.com/api/children/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "username": "johnny",
    "name": "Johnny Doe",
    "pin": "1234"
  }'
```

### Create Chore
```bash
curl -X POST https://waya-mentorled.onrender.com/api/taskmaster/chores/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Clean Room",
    "description": "Clean and organize your bedroom",
    "assigned_to": "CHILD_ID_HERE",
    "reward": 500,
    "due_date": "2025-01-20"
  }'
```

### Get Wallet Balance
```bash
curl -X GET https://waya-mentorled.onrender.com/api/familywallet/wallet/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Database Schema Implementation

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'parent',
    is_verified BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Children Table
```sql
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    pin VARCHAR(255) NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_children_username ON children(username);
```

### Chores Table
```sql
CREATE TABLE chores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    assigned_to UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chores_assigned_to ON chores(assigned_to);
CREATE INDEX idx_chores_parent ON chores(parent_id);
CREATE INDEX idx_chores_status ON chores(status);
```

### Wallets Table
```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'NGN',
    pin VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user ON wallets(user_id);
```

### Child Wallets Table
```sql
CREATE TABLE child_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID UNIQUE NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    total_earned DECIMAL(10, 2) DEFAULT 0.00,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_child_wallets_child ON child_wallets(child_id);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    chore_id UUID REFERENCES chores(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_child ON transactions(child_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

### Allowances Table
```sql
CREATE TABLE allowances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_paid_at TIMESTAMP,
    next_payment_date DATE
);

CREATE INDEX idx_allowances_parent ON allowances(parent_id);
CREATE INDEX idx_allowances_child ON allowances(child_id);
CREATE INDEX idx_allowances_status ON allowances(status);
```

---

## Conclusion

This documentation provides a comprehensive guide for building the Waya backend API from scratch. It includes:
- Complete authentication flow
- All endpoint specifications with request/response examples
- Data models and database schemas
- Error handling guidelines
- Best practices and security recommendations

For any questions or clarifications, refer to the frontend implementation in the repository at `/home/runner/work/mentorled-waya/mentorled-waya`.

**Version**: 1.0  
**Last Updated**: December 18, 2025  
**Backend URL**: https://waya-mentorled.onrender.com/api/

