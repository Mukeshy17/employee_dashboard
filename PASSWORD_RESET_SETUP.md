# Forgot Password Feature Setup Guide

## Overview
The forget password feature has been successfully implemented with the following components:

### Backend Components
1. **Email Service**: Nodemailer integration for sending password reset emails
2. **Password Reset Endpoints**:
   - `POST /api/auth/request-password-reset` - Request password reset link
   - `POST /api/auth/reset-password` - Reset password with token

3. **Database Changes**: New columns added to users table:
   - `reset_token` - Stores the hashed reset token
   - `reset_token_expires` - Token expiration timestamp (30 minutes)

### Frontend Components
1. **ForgotPassword Page** (`src/pages/ForgotPassword.jsx`)
   - Form to enter email
   - Email validation
   - Success message with instructions

2. **ResetPassword Page** (`src/pages/ResetPassword.jsx`)
   - Form to reset password with confirmation
   - Password validation (minimum 6 characters)
   - Show/hide password toggle
   - Automatic redirect to login after successful reset

3. **Updated AuthForm** (`src/components/AuthForm.jsx`)
   - "Forgot password?" link on login page

4. **Updated App.jsx**
   - Routes for `/forgot-password` and `/reset-password/:token`

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install nodemailer
```

### 2. Database Migration
Run the setup script to add the reset token columns:
```bash
node scripts/setupPasswordReset.js
```

### 3. Environment Variables
Update your `.env` file in the backend directory:

```env
# Email Configuration for Password Reset
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Important**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

### 4. Email Provider Setup (Gmail Example)

#### Step 1: Enable 2-Step Verification
1. Go to your [Google Account](https://myaccount.google.com/)
2. Select **Security** on the left
3. Enable **2-Step Verification**

#### Step 2: Generate App Password
1. Go back to **Security**
2. Find and select **App passwords**
3. Select Mail and Windows Computer (or your device)
4. Copy the generated 16-character password
5. Use this as your `EMAIL_PASSWORD` in `.env`

#### Step 3: Update .env
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-character app password
```

### Alternative Email Providers

#### Using Gmail's SMTP directly
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### Using SendGrid
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key
```

#### Using Custom SMTP
```env
EMAIL_SERVICE=custom
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
```

## Flow Overview

### Request Password Reset
1. User clicks "Forgot password?" on login page
2. User enters email address
3. Backend generates a unique token and sends reset email
4. Email contains a link to reset password page with token in URL
5. Token expires in 30 minutes

### Reset Password
1. User clicks the link in email
2. User navigates to reset password page with token in URL
3. User enters new password and confirmation
4. Backend validates token and updates password
5. User is redirected to login page
6. Confirmation email is sent to user

## Files Modified/Created

### Backend
- `controllers/authController.js` - Added password reset functions
- `routes/auth.js` - Added password reset routes
- `scripts/setupPasswordReset.js` - Database migration script
- `.env` - Added email configuration variables

### Frontend
- `src/pages/ForgotPassword.jsx` - New component
- `src/pages/ResetPassword.jsx` - New component
- `src/components/AuthForm.jsx` - Added forgot password link
- `src/App.jsx` - Added new routes

## Testing

### Manual Testing Steps
1. Start the backend server: `npm run dev`
2. Start the frontend: `npm run dev`
3. Go to login page and click "Forgot password?"
4. Enter a valid email address
5. Check the console/email for the reset link
6. Click the reset link and enter a new password
7. Verify you can login with the new password

### For Development/Testing
You can use services like:
- **Mailtrap**: For testing emails without sending real emails
- **MailHog**: For local email testing
- **Gmail**: For production

## Security Considerations

1. **Token Expiration**: Reset tokens expire after 30 minutes
2. **Token Hashing**: Tokens are hashed before storage in database
3. **One-time Use**: Tokens are cleared after successful password reset
4. **Email Verification**: Email is used as additional verification layer
5. **Password Requirements**: Minimum 6 characters (can be enhanced)

## Troubleshooting

### Emails not sending
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- For Gmail, ensure you're using App Password, not regular password
- Check that 2-Step Verification is enabled for Gmail
- Verify `EMAIL_SERVICE` is correctly set

### Token expired error
- Reset tokens are valid for 30 minutes only
- User needs to request a new reset link if token expires
- Can be adjusted by modifying the 30-minute value in `authController.js`

### Database migration fails
- Ensure database credentials in `.env` are correct
- Verify MySQL server is running
- Check that `employee_management` database exists

## Future Enhancements

1. Add password strength requirements
2. Implement rate limiting on password reset requests
3. Add email verification for new accounts
4. Implement two-factor authentication
5. Add admin dashboard to view password reset requests
6. Implement password history to prevent reusing old passwords
