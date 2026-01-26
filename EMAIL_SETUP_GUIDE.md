# 📧 Email Configuration - Step by Step

## Issue
You're getting "Failed to send reset email" because email credentials are not configured in `.env`

## Solution

### Step 1: Get Your Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com/)
2. Click **Security** in the left menu
3. Scroll down to **How you sign in to Google**
4. Make sure **2-Step Verification** is ON (turn it on if needed)
5. Go back to **Security** page
6. Scroll down to **App passwords** (appears after 2-Step is enabled)
7. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device type)
8. Google will generate a **16-character password**
9. Copy this password

### Step 2: Update Your `.env` File

Edit `backend/.env` and replace the empty values:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

Example:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=akhil.sharma@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

⚠️ **IMPORTANT**: 
- Use the **16-character App Password** from step 1
- NOT your regular Gmail password
- Include spaces in the password as Google shows them

### Step 3: Restart Your Backend

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

### Step 4: Test Again

1. Go to login page
2. Click "Forgot password?"
3. Enter your email
4. Click "Send Reset Link"
5. Check your email

---

## Common Issues & Solutions

### Issue: "Failed to send reset email"
**Cause**: EMAIL_USER or EMAIL_PASSWORD is missing or incorrect
**Solution**: 
- Check that both values are filled in `.env`
- For Gmail, make sure you're using App Password, not regular password
- Restart backend after changing `.env`

### Issue: "App passwords" option not showing
**Cause**: 2-Step Verification is not enabled
**Solution**:
1. Go to [myaccount.google.com](https://myaccount.google.com/)
2. Click **Security**
3. Find "How you sign in to Google"
4. Click **2-Step Verification**
5. Follow the setup process
6. Then "App passwords" will appear

### Issue: Still getting error after adding credentials
**Solution**:
- Make sure you completely stopped the old backend server
- Restart with `npm run dev`
- Check backend console for specific error messages

---

## Other Email Services

If you're not using Gmail:

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo Mail
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-password
```

### SendGrid
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key
```

### Custom SMTP
```env
EMAIL_SERVICE=custom
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
```

---

## How to Verify It's Working

After updating `.env`:

1. **Check backend logs** - Look for this message:
   ```
   Email sending error: [specific error details]
   ```

2. **Test the flow**:
   - Request password reset
   - Watch the backend console for error messages
   - If error, check the console message and fix the issue

3. **Successful email** looks like:
   - No error in console
   - Email appears in inbox
   - Email contains reset link

---

## Quick Checklist

- [ ] 2-Step Verification enabled on Google Account
- [ ] Generated an App Password (16 characters)
- [ ] Copied App Password exactly as shown
- [ ] Updated `EMAIL_USER` with your gmail address
- [ ] Updated `EMAIL_PASSWORD` with the 16-character password
- [ ] Restarted backend server (`npm run dev`)
- [ ] Tested forget password flow

---

Once you complete these steps, the password reset email should work! 📧
