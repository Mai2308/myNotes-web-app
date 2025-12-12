# Reminders & Notifications - Quick Start Guide

## Backend Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install nodemailer
```

### 2. Configure Environment
Copy and edit `.env`:
```bash
cp .env.example .env
```

**For Gmail (simplest option):**
1. Go to https://myaccount.google.com/apppasswords
2. Generate a 16-character app password
3. Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=your-email@gmail.com
ENABLE_EMAIL_NOTIFICATIONS=true
```

**Other providers** (SendGrid, Office365, AWS SES):
See `.env.example` for examples

### 3. Restart Server
```bash
npm start
# You should see: "✅ Email service initialized" and "🚀 Starting reminder scheduler..."
```

## Testing the Backend

### Create a Note with Reminder
```bash
# First, create a note
POST http://localhost:5000/api/notes
Headers: Authorization: Bearer YOUR_TOKEN
Body:
{
  "title": "Project deadline",
  "content": "Complete the project",
  "tags": ["work"],
  "reminder": {
    "enabled": true,
    "dueDate": "2025-12-25T14:00:00Z",
    "notificationSent": false,
    "recurring": { "enabled": false }
  }
}
```

### Create a Reminder Separately
```bash
POST http://localhost:5000/api/reminders
Headers: Authorization: Bearer YOUR_TOKEN
Body:
{
  "noteId": "NOTE_ID_HERE",
  "dueDate": "2025-12-25T14:00:00Z",
  "notificationType": "email",
  "recurring": {
    "enabled": false
  }
}
```

### Create a Daily Recurring Reminder
```bash
POST http://localhost:5000/api/reminders
Headers: Authorization: Bearer YOUR_TOKEN
Body:
{
  "noteId": "NOTE_ID_HERE",
  "dueDate": "2025-12-24T09:00:00Z",
  "notificationType": "email",
  "recurring": {
    "enabled": true,
    "frequency": "daily",
    "endDate": "2025-12-31T23:59:59Z"
  }
}
```

### Get All Reminders
```bash
GET http://localhost:5000/api/reminders
Headers: Authorization: Bearer YOUR_TOKEN
```

### Get Due Reminders
```bash
GET http://localhost:5000/api/reminders/due
Headers: Authorization: Bearer YOUR_TOKEN
```

### Snooze a Reminder (15 minutes)
```bash
POST http://localhost:5000/api/reminders/REMINDER_ID/snooze
Headers: Authorization: Bearer YOUR_TOKEN
Body:
{
  "minutesToSnooze": 15
}
```

### Get Notifications
```bash
GET http://localhost:5000/api/notifications
Headers: Authorization: Bearer YOUR_TOKEN
```

### Mark Notification as Read
```bash
PATCH http://localhost:5000/api/notifications/NOTIFICATION_ID/read
Headers: Authorization: Bearer YOUR_TOKEN
```

### Mark All Notifications as Read
```bash
POST http://localhost:5000/api/notifications/mark-all-read
Headers: Authorization: Bearer YOUR_TOKEN
```

## How It Works

1. **User creates a reminder** via API with a due date and notification type
2. **Scheduler runs every 60 seconds** and checks for due reminders
3. **When time comes:**
   - Creates a Notification record in database
   - Sends email if `notificationType` is "email" or "alert"
   - Updates reminder status to "sent"
4. **For recurring reminders:**
   - Automatically recalculates next due date
   - Continues until end date (if specified)
5. **User can snooze** to defer notification for X minutes
6. **Notifications** can be marked as read or deleted

## Key Features

✅ **Multiple Notification Types**
- `in-app`: Stored in database, fetched via API
- `email`: Sent via configured SMTP
- `alert`: Both email and in-app

✅ **Recurring Reminders**
- Daily, Weekly, Monthly, Yearly
- Optional end date
- Automatic rescheduling

✅ **Flexible Snoozing**
- Snooze for 5, 15, 30 minutes or custom duration
- Automatically reactivates when snooze time ends

✅ **Notification Management**
- Mark as read
- Delete old notifications
- Unread count tracking
- Priority levels (low, normal, high, urgent)

✅ **Email Customization**
- Single reminder emails
- Bulk reminder emails (multiple reminders per user)
- HTML formatted with note content preview

## Database Schema Overview

### Notes Collection
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  user: ObjectId,
  reminder: {
    enabled: Boolean,
    dueDate: Date,
    notificationSent: Boolean,
    recurring: {
      enabled: Boolean,
      frequency: String,
      endDate: Date
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Reminders Collection
```javascript
{
  _id: ObjectId,
  noteId: ObjectId,
  userId: ObjectId,
  dueDate: Date,
  notificationType: String,
  notificationSent: Boolean,
  status: String,
  recurring: { ... },
  snoozeUntil: Date,
  createdAt: Date
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  reminderId: ObjectId,
  noteId: ObjectId,
  title: String,
  message: String,
  type: String,
  read: Boolean,
  priority: String,
  createdAt: Date
}
```

## Troubleshooting

### Issue: Reminders not triggering
**Solution:**
1. Check server logs for scheduler start message
2. Verify MongoDB is running
3. Ensure reminder dueDate is in the past
4. Check reminder status is not "snoozed" or "failed"

### Issue: Emails not sending
**Solution:**
1. Verify `.env` SMTP settings
2. For Gmail: ensure app password is correct (not main password)
3. Check email logs in server console
4. Try test email: Gmail will show "Less secure app" warning if using wrong password

### Issue: Recurring reminders not working
**Solution:**
1. Verify `recurring.enabled` is `true`
2. Check `frequency` is valid (daily/weekly/monthly/yearly)
3. Ensure `endDate` hasn't passed
4. Check database for reminder documents

## Monitorng Reminders

### View Server Logs
```bash
# Watch for these messages:
# ✅ Email service initialized
# 🚀 Starting reminder scheduler...
# ⏰ Found X due reminders
# ✅ Reminder triggered: REMINDER_ID
# 📬 Notification created
```

### Check Pending Reminders
```bash
db.reminders.find({ status: "pending", dueDate: { $lt: new Date() } })
```

### Check Failed Reminders
```bash
db.reminders.find({ status: "failed" })
```

### View Notification History
```bash
db.notifications.find({ userId: ObjectId("...") }).sort({ createdAt: -1 }).limit(20)
```

## Frontend Integration (Next Step)

The frontend needs to:
1. Add reminder fields to note editor
2. Create reminder management UI
3. Display notification center
4. Call reminder API endpoints

See REMINDERS_FEATURE.md for complete frontend integration guide.

## Production Considerations

1. **Email Service**: Use managed service (SendGrid, AWS SES) not Gmail
2. **Scheduler Interval**: Adjust based on requirements (more frequent = more resource usage)
3. **Database Backup**: Regularly backup reminder and notification data
4. **Cleanup**: Configure notification retention policy
5. **Monitoring**: Set up alerts for failed reminders
6. **Error Handling**: Log and track email delivery failures
7. **Timezone**: Always use UTC (ISO 8601) for dates

## API Summary

**Reminders:**
- `POST /api/reminders` - Create
- `GET /api/reminders` - Get all
- `GET /api/reminders/due` - Get due
- `PUT /api/reminders/:id` - Update
- `DELETE /api/reminders/:id` - Delete
- `POST /api/reminders/:id/snooze` - Snooze

**Notifications:**
- `GET /api/notifications` - Get all
- `PATCH /api/notifications/:id/read` - Mark read
- `DELETE /api/notifications/:id` - Delete
- `POST /api/notifications/mark-all-read` - Mark all read

See [REMINDERS_FEATURE.md](./REMINDERS_FEATURE.md) for complete API documentation.
