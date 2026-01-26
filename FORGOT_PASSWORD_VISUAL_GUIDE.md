# Forgot Password Feature - Visual Guide

## User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                       USER FLOW DIAGRAM                      │
└─────────────────────────────────────────────────────────────┘

1. LOGIN PAGE
   ┌─────────────────────────────┐
   │  Login Form                 │
   │  ├─ Email input            │
   │  ├─ Password input         │
   │  └─ [Login Button]         │
   │                             │
   │  [Forgot password?] ← LINK  │
   └─────────────────────────────┘
           ↓
           ↓ Click "Forgot password?"
           ↓

2. FORGOT PASSWORD PAGE
   ┌─────────────────────────────┐
   │  Forgot Password Form        │
   │  ├─ Email input             │
   │  └─ [Send Reset Link] Button│
   └─────────────────────────────┘
           ↓
           ↓ Submit email
           ↓
   
3. BACKEND PROCESSING
   ├─ Check if email exists ✓
   ├─ Generate unique token ✓
   ├─ Hash token (SHA256) ✓
   ├─ Store in DB (30min expiry) ✓
   ├─ Send email with reset link ✓
   └─ Show success message ✓
           ↓
           ↓ Email sent
           ↓

4. EMAIL RECEIVED
   ┌─────────────────────────────┐
   │ Subject: Password Reset     │
   │ Request                      │
   │                              │
   │ Hi User,                     │
   │ Click here to reset password:│
   │ [Reset Password Link] ←─────┐│
   │                              │
   │ Link expires in 30 minutes  │
   └─────────────────────────────┘
           ↓
           ↓ Click reset link
           ↓

5. RESET PASSWORD PAGE
   ┌──────────────────────────────┐
   │  Reset Password Form           │
   │  ├─ New Password input        │
   │  ├─ Confirm Password input    │
   │  └─ [Reset Password] Button   │
   │  └─ Show/Hide toggle          │
   └──────────────────────────────┘
           ↓
           ↓ Submit new password
           ↓

6. BACKEND PROCESSING
   ├─ Hash provided token (SHA256) ✓
   ├─ Verify token exists in DB ✓
   ├─ Check token not expired ✓
   ├─ Hash new password ✓
   ├─ Update password in DB ✓
   ├─ Clear reset token ✓
   ├─ Send confirmation email ✓
   └─ Show success message ✓
           ↓
           ↓ Auto-redirect in 2 seconds
           ↓

7. LOGIN PAGE (Back to Start)
   ┌─────────────────────────────┐
   │  Login Form                 │
   │  ├─ Email input            │
   │  ├─ Password input ← NEW!  │
   │  └─ [Login Button] ✓       │
   └─────────────────────────────┘
```

## API Endpoints

### 1. Request Password Reset
```
POST /api/auth/request-password-reset

Request Body:
{
  "email": "user@company.com"
}

Response (Success):
{
  "success": true,
  "message": "If an account exists with this email, a password reset link will be sent"
}

Response (Error):
{
  "success": false,
  "message": "Email is required"
}
```

### 2. Reset Password
```
POST /api/auth/reset-password

Request Body:
{
  "token": "generated-token-from-email",
  "password": "newPassword123"
}

Response (Success):
{
  "success": true,
  "message": "Password reset successfully. You can now log in with your new password."
}

Response (Error):
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

## Frontend Routes

```
/login                    → Login page
/signup                   → Sign up page
/forgot-password          → Request password reset
/reset-password/:token    → Reset password with token
/                        → Dashboard (protected)
```

## Database Schema

### Users Table Changes
```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL;
```

### Example Data
```
id | name      | email            | password    | reset_token | reset_token_expires
---|-----------|------------------|-------------|-------------|--------------------
1  | John Doe  | john@company.com | $2a$12$... | NULL        | NULL
2  | Jane Smith| jane@company.com | $2a$12$... | abc123...   | 2024-01-26 15:30:00
```

## Security Timeline

```
Timeline: 30 Minutes (1800 seconds)

T+0:00   → User requests password reset
         → Email sent with unique token
         
T+5:00   → User checks email
         
T+10:00  → User clicks reset link
         → Token validated
         → Reset password page displayed
         
T+20:00  → User resets password
         → Token is now invalid
         → Can login with new password
         
T+30:00  → Old token automatically expires
         → Even if not used, cannot be reused
```

## Email Template

```html
┌──────────────────────────────────────────────────┐
│                   EMAIL PREVIEW                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Password Reset Request                          │
│                                                  │
│  Hi John Doe,                                    │
│                                                  │
│  You requested a password reset for your        │
│  account. Click the button below to reset your  │
│  password:                                       │
│                                                  │
│  ┌─────────────────────────────┐                │
│  │  [Reset Password Button]    │                │
│  └─────────────────────────────┘                │
│                                                  │
│  Or copy and paste this link:                   │
│  http://localhost:5173/reset-password/abc123...│
│                                                  │
│  This link will expire in 30 minutes.           │
│                                                  │
│  If you didn't request this, please ignore      │
│  this email.                                    │
│                                                  │
│  Best regards,                                  │
│  Employee Dashboard Team                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Error Handling

```
Case 1: Email doesn't exist
┌─ User enters unregistered email
├─ System returns success (for security)
└─ No email sent

Case 2: Invalid/Expired token
┌─ User tries to use old/modified token
├─ System validates token against DB
├─ Token check fails
└─ Shows "Invalid or expired reset token" error

Case 3: Password mismatch
┌─ User enters different passwords
├─ Frontend validation catches it
└─ Shows "Passwords do not match" error

Case 4: Short password
┌─ User enters less than 6 characters
├─ Frontend + Backend validation
└─ Shows "Password must be at least 6 characters"

Case 5: Email service down
┌─ Email fails to send
├─ System detects failure
└─ Shows user-friendly error message
```

## Implementation Checklist

✅ Backend
  ✅ Nodemailer installed
  ✅ requestPasswordReset function created
  ✅ resetPassword function created
  ✅ Email templates created
  ✅ Routes added (/request-password-reset, /reset-password)
  ✅ Database migration script created

✅ Frontend
  ✅ ForgotPassword component created
  ✅ ResetPassword component created
  ✅ Routes added to App.jsx
  ✅ "Forgot password?" link added to AuthForm

✅ Configuration
  ✅ Email variables in .env
  ✅ Documentation created
  ✅ Database columns added

✅ Security
  ✅ Token hashing implemented
  ✅ Token expiration set (30 minutes)
  ✅ One-time use enforcement
  ✅ Password validation
  ✅ Email verification
