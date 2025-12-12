# Troubleshooting Guide - Reminders Feature

## Server Startup Issues

### Problem: "✗ Email service not configured"
**Symptoms:** Server starts but no email service message appears

**Solutions:**
1. Check `.env` file exists and has SMTP settings
2. Verify these are set:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
3. Restart server: `npm start`

**If email is optional:**
This is normal. The feature will work with in-app notifications only.

---

### Problem: "⏹️ Reminder scheduler stopped"
**Symptoms:** Message appears in logs on startup

**Possible causes:**
1. MongoDB not connected yet
2. Database error during initialization
3. Memory issues

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   mongo
   # Should show connected shell
   ```
2. Check MongoDB URI in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/notes-app
   ```
3. Check server logs for errors above this message
4. Try restarting: `npm start`

---

### Problem: Server crashes with "Cannot find module"
**Symptoms:** `Error: Cannot find module 'nodemailer'`

**Solution:**
```bash
npm install nodemailer
npm start
```

---

## Reminder Not Triggering

### Problem: Reminders don't trigger even when due
**Symptoms:** Created reminder with past due date, but nothing happens

**Diagnosis steps:**
1. Check scheduler is running:
   ```
   Look for: "🚀 Starting reminder scheduler..."
   ```
2. Check reminder status in database:
   ```bash
   mongo
   > db.reminders.findOne({ dueDate: { $lt: new Date() } })
   # Check status, notificationSent fields
   ```
3. Check scheduler interval:
   - Default: 60 seconds
   - Check `REMINDER_CHECK_INTERVAL` in `.env`

**Solutions:**
- If scheduler not running: Check MongoDB connection
- If status is "snoozed": Wait for snoozeUntil time
- If status is "failed": Check error logs
- If notificationSent is true: Already sent (expected)
- Create new reminder to test

**Manual trigger for testing:**
```bash
POST /api/reminders/check
Headers: Authorization: Bearer YOUR_TOKEN
```

---

## Email Not Sending

### Problem: Reminders not sending emails
**Symptoms:** Reminder triggers but no email received

**Gmail specific:**
1. Check app password (not main password):
   - Go to: https://myaccount.google.com/apppasswords
   - Generate new 16-character password
   - Copy exact password to `.env`

2. Verify settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=your-email@gmail.com
   ```

3. Check if Gmail blocks connection:
   - Gmail may block "less secure" apps
   - Allow access: https://myaccount.google.com/lesssecureapps

**Other providers:**
1. Verify SMTP settings for your provider
2. Check credentials in `.env`
3. Ensure firewall allows outbound SMTP

**Test email configuration:**
```bash
# In MongoDB shell or code
const { verifyEmailConfiguration } = require('./services/emailService');
await verifyEmailConfiguration();
# Should return: "✅ Email configuration verified"
```

**Check server logs:**
```
Look for: "❌ Error sending reminder email:"
Copy error message and search for solution
```

### Problem: "SMTP connection timeout"
**Solutions:**
1. Check firewall allows SMTP port (usually 587 or 465)
2. Verify SMTP_PORT matches provider (Gmail: 587, not 465)
3. For corporate networks: may need VPN or proxy
4. Try different email provider temporarily to test

### Problem: "Invalid credentials" error
**Solutions:**
1. Verify username/password in `.env`
2. For Gmail: Use app password, not account password
3. For other providers: Check exact format (some need full email, some username)
4. Test credentials in email client first
5. Check for special characters that need escaping

---

## Database Issues

### Problem: "Note not found" when creating reminder
**Symptoms:** POST /api/reminders returns 404

**Causes:**
1. Wrong noteId
2. Note belongs to different user
3. Note was deleted

**Solutions:**
1. Verify noteId is correct
2. Get your notes: `GET /api/notes`
3. Copy noteId from response
4. Try creating reminder again

### Problem: Duplicate reminders created
**Symptoms:** Same reminder appears multiple times

**Causes:**
1. API called multiple times (network retry)
2. Scheduler triggered multiple times

**Solutions:**
1. Check `db.reminders.count()` - count total
2. Use unique indexes (already configured)
3. Delete duplicates if needed:
   ```bash
   mongo
   > db.reminders.deleteMany({ 
       userId: ObjectId("..."),
       noteId: ObjectId("..."),
       dueDate: ISODate("...")
     }, { justOne: true })
   ```

### Problem: Old notifications taking space
**Symptoms:** Notification collection growing very large

**Solutions:**
1. Cleanup old read notifications:
   ```bash
   DELETE /api/notifications/cleanup
   Body: { "daysOld": 30 }
   ```
2. Or manually delete:
   ```bash
   db.notifications.deleteMany({ 
     read: true, 
     createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
   })
   ```

---

## API Issues

### Problem: "Unauthorized" response
**Symptoms:** All endpoints return 401

**Causes:**
1. Missing Authorization header
2. Invalid or expired token
3. Token format incorrect

**Solutions:**
1. Ensure header format:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```
2. Get new token: `POST /api/users/login`
3. Token should not have "Bearer " prefix in body, only header

### Problem: "Invalid folder id" error
**Symptoms:** Creating reminder for note returns error

**Causes:**
1. Associated note/folder was deleted
2. User lost access to folder

**Solutions:**
1. Verify note still exists
2. Check user has access
3. Create in main folder (folderId: null)

### Problem: CORS errors
**Symptoms:** Frontend can't call API

**Solutions:**
1. Check CORS_ORIGIN in `.env`:
   ```
   CORS_ORIGIN=http://localhost:3000
   ```
2. Restart server after changing
3. If using different port, update CORS_ORIGIN

---

## Performance Issues

### Problem: Scheduler checks taking too long
**Symptoms:** Server response slow, high CPU usage

**Causes:**
1. Too many reminders in database
2. Check interval too short
3. Inefficient queries

**Solutions:**
1. Verify indexes exist:
   ```bash
   db.reminders.getIndexes()
   ```
2. Increase check interval in `.env`:
   ```
   REMINDER_CHECK_INTERVAL=120000  # 2 minutes instead of 1
   ```
3. Archive old reminders to separate collection

### Problem: Memory usage increasing
**Symptoms:** Server becomes slower over time

**Solutions:**
1. Cleanup old notifications regularly:
   ```bash
   DELETE /api/notifications/cleanup
   ```
2. Check for memory leaks in logs
3. Restart server periodically (e.g., daily)
4. Monitor with: `top` or `htop` command

---

## Recurring Reminder Issues

### Problem: Recurring reminder not rescheduling
**Symptoms:** Reminder triggers once, dueDate doesn't update

**Causes:**
1. `recurring.enabled` is false
2. Scheduler failed to update
3. `endDate` has passed

**Debugging:**
```bash
db.reminders.findOne({ _id: ObjectId("...") })
# Check:
# - recurring.enabled === true
# - recurring.frequency is valid
# - recurring.endDate not in past
# - status not "failed"
```

**Solutions:**
1. Delete and recreate reminder with recurring enabled
2. Check server logs for errors
3. Manually update if needed:
   ```bash
   db.reminders.updateOne(
     { _id: ObjectId("...") },
     { $set: { dueDate: new Date("2025-12-26T09:00:00Z") } }
   )
   ```

### Problem: Recurring reminder not stopping
**Symptoms:** Keeps rescheduling past endDate

**Causes:**
1. `endDate` not set correctly
2. Scheduler bug (unlikely)

**Solutions:**
1. Update endDate:
   ```bash
   db.reminders.updateOne(
     { _id: ObjectId("...") },
     { $set: { "recurring.enabled": false } }
   )
   ```
2. Or delete reminder

---

## Frontend Integration Issues

### Problem: New notes don't show reminder field
**Symptoms:** Created note, reminder field missing

**Causes:**
1. Frontend not sending reminder field
2. Backend didn't add default

**Solutions:**
1. Restart backend server
2. Ensure noteModel has reminder field:
   ```bash
   db.notes.findOne()
   # Check for reminder field
   ```
3. Add default via database if missing

---

## Notification Issues

### Problem: Notifications not showing in frontend
**Symptoms:** Created notifications, don't appear in UI

**Causes:**
1. Frontend not calling GET /api/notifications
2. Frontend not refreshing
3. Notifications marked as read

**Debugging:**
1. Check in database:
   ```bash
   db.notifications.count({ userId: ObjectId("...") })
   ```
2. Check unread count:
   ```bash
   db.notifications.count({ userId: ObjectId("..."), read: false })
   ```

### Problem: "Notification already read"
**Symptoms:** Can't mark notification as read twice

**Solutions:**
This is normal behavior. Check `readAt` timestamp:
```bash
db.notifications.findOne({ _id: ObjectId("...") })
# If already has readAt, it's already marked
```

---

## General Debugging Steps

1. **Check server logs:**
   ```bash
   npm start 2>&1 | tee server.log
   # Check for ❌ or ⚠️ messages
   ```

2. **Test database connection:**
   ```bash
   mongo
   > db.reminders.count()
   # Should return a number
   ```

3. **Verify .env file:**
   ```bash
   cat .env | grep REMINDER
   cat .env | grep SMTP
   ```

4. **Test API endpoints:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:5000/api/reminders
   ```

5. **Check MongoDB collections:**
   ```bash
   mongo
   > show collections
   # Should include: reminders, notifications
   ```

6. **Monitor in real-time:**
   ```bash
   # Terminal 1: Watch logs
   npm start
   
   # Terminal 2: Test API
   curl ...
   ```

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "noteId and dueDate required" | Missing fields in request | Add both fields |
| "Note not found" | Note doesn't exist | Verify noteId |
| "Unauthorized" | No/invalid token | Add Bearer token |
| "Reminder not found" | Reminder doesn't exist | Check reminderId |
| "Email service not configured" | No SMTP settings | Configure .env |
| "SMTP connection timeout" | Can't reach email server | Check firewall/port |
| "Invalid credentials" | Wrong email password | Use app password for Gmail |

---

## Getting Help

1. Check these docs first:
   - [REMINDERS_QUICK_START.md](./REMINDERS_QUICK_START.md)
   - [REMINDERS_FEATURE.md](./REMINDERS_FEATURE.md)
   - [API_REFERENCE.md](./API_REFERENCE.md)

2. Check server logs for error messages

3. Use database queries to inspect data

4. Test with curl before testing frontend

5. Enable verbose logging:
   ```bash
   NODE_ENV=development npm start
   ```

---

**Last Updated:** 2025-12-01
**Version:** 1.0
