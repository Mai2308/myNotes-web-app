# Reminders & Notifications Feature Documentation

## Overview

The Notes App now includes a comprehensive reminder and notification system that allows users to:
- Set reminders/deadlines for notes
- Receive notifications via in-app alerts, emails, or both
- Create recurring reminders (daily, weekly, monthly, yearly)
- Snooze reminders for later
- Track notification history

## Architecture

### Backend Components

#### 1. **Models**
- **Note Model** (`models/noteModel.js`): Updated with reminder fields
- **Reminder Model** (`models/reminderModel.js`): Stores individual reminders
- **Notification Model** (`models/notificationModel.js`): Tracks notification history

#### 2. **Services**

**Reminder Service** (`services/reminderService.js`)
- `createReminder()` - Create a new reminder
- `updateReminder()` - Update existing reminder
- `getUserReminders()` - Fetch user's reminders
- `getDueReminders()` - Get reminders that are due
- `markReminderTriggered()` - Mark reminder as triggered
- `deleteReminder()` - Delete a reminder
- `snoozeReminder()` - Snooze for specified minutes
- `createNotification()` - Create notification record
- `deleteNotification()` - Delete notification

**Email Service** (`services/emailService.js`)
- `initializeEmailService()` - Initialize email transporter
- `sendReminderEmail()` - Send single reminder email
- `sendBulkReminderEmail()` - Send multiple reminders in one email
- `verifyEmailConfiguration()` - Test email setup

**Scheduler Service** (`services/schedulerService.js`)
- `startReminderScheduler()` - Start background reminder checker
- `stopReminderScheduler()` - Stop the scheduler
- `checkAndTriggerReminders()` - Check for due reminders and trigger notifications
- `manualTriggerReminderCheck()` - Manually trigger a check
- `cleanupOldSnoozedReminders()` - Remove stale snoozed reminders

#### 3. **Controllers**

**Reminder Controller** (`controllers/reminderController.js`)
- Handles all reminder CRUD operations
- Manages notifications (mark as read, delete, cleanup)
- Exposes scheduler control endpoints

#### 4. **Routes**

**Reminder Routes** (`routes/reminders.js`)
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/due` - Get due reminders
- `GET /api/reminders/:id` - Get specific reminder
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `POST /api/reminders/:id/snooze` - Snooze reminder
- `GET /api/reminders/note/:noteId` - Get reminders for a note
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all as read

## Data Models

### Reminder Model Structure
```javascript
{
  noteId: ObjectId,
  userId: ObjectId,
  dueDate: Date,
  title: String,
  notificationType: "email" | "in-app" | "alert",
  notificationSent: Boolean,
  sentAt: Date,
  recurring: {
    enabled: Boolean,
    frequency: "daily" | "weekly" | "monthly" | "yearly",
    endDate: Date,
    lastTriggeredAt: Date
  },
  status: "pending" | "sent" | "failed" | "snoozed",
  snoozeUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model Structure
```javascript
{
  userId: ObjectId,
  reminderId: ObjectId,
  noteId: ObjectId,
  title: String,
  message: String,
  type: "reminder" | "deadline-approaching" | "overdue" | "custom",
  notificationMethod: "email" | "in-app" | "alert" | "push",
  read: Boolean,
  readAt: Date,
  priority: "low" | "normal" | "high" | "urgent",
  actionUrl: String,
  metadata: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

## Setup Instructions

### 1. Environment Configuration

Copy the `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Email Service (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # For Gmail, use 16-char app password
SMTP_FROM=your-email@gmail.com

# Reminder settings
REMINDER_CHECK_INTERVAL=60000  # Check every 60 seconds
```

### 2. Email Service Setup

#### Gmail Configuration
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use the 16-character password in `SMTP_PASS`

#### Other Email Services
- **SendGrid**: Use `apikey` as username and API key as password
- **Office365**: Use your email and password
- **AWS SES**: Use your SES credentials

### 3. Install Dependencies

```bash
cd backend
npm install nodemailer
```

### 4. Database Indexes

The reminder and notification models automatically create indexes for efficient querying:
- User + Due Date (reminders)
- User + Status (reminders)
- User + Created Date (notifications)

## Usage Examples

### Creating a Reminder

```javascript
// POST /api/reminders
{
  "noteId": "507f1f77bcf86cd799439011",
  "dueDate": "2025-12-20T14:30:00Z",
  "notificationType": "email",
  "recurring": {
    "enabled": false
  }
}
```

### Creating a Recurring Reminder

```javascript
{
  "noteId": "507f1f77bcf86cd799439011",
  "dueDate": "2025-12-20T09:00:00Z",
  "notificationType": "email",
  "recurring": {
    "enabled": true,
    "frequency": "daily",
    "endDate": "2026-12-31T23:59:59Z"
  }
}
```

### Snoozing a Reminder

```javascript
// POST /api/reminders/:id/snooze
{
  "minutesToSnooze": 15
}
```

### Getting User Notifications

```javascript
// GET /api/notifications?limit=50&unreadOnly=false
// Response includes unread count
{
  "notifications": [...],
  "unreadCount": 5
}
```

## Background Scheduler

The reminder scheduler automatically:
1. Starts when the server boots up
2. Checks for due reminders every 60 seconds (configurable)
3. Creates notifications for due reminders
4. Sends emails if configured
5. Recalculates recurring reminders
4. Stops gracefully on server shutdown

### Scheduler Features
- **Efficient querying** using MongoDB indexes
- **Recurring reminder support** with automatic rescheduling
- **Snoozed reminder handling** that reactivates when snooze time expires
- **Email batching** to send multiple reminders in one email
- **Error resilience** that continues on individual reminder failures

## Frontend Integration (Next Steps)

The frontend will need to:

1. **Create/Edit Reminder UI**
   - Date/time picker for due date
   - Recurring options selector
   - Notification type toggle
   - Note edit form integration

2. **Display Reminders**
   - Upcoming reminders list
   - Past due reminders (highlighted in red)
   - Calendar view option
   - Notification bell icon with unread count

3. **Notification Center**
   - Display in-app notifications
   - Mark as read functionality
   - Delete notifications
   - Show priority visual indicators

4. **API Integration** (`frontend/src/api/remindersApi.js`)
   ```javascript
   - getReminders()
   - getDueReminders()
   - createReminder()
   - updateReminder()
   - deleteReminder()
   - snoozeReminder()
   - getNotifications()
   - markNotificationAsRead()
   ```

## API Endpoints Reference

### Reminder Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | Get all reminders |
| GET | `/api/reminders/due` | Get due reminders |
| GET | `/api/reminders/:id` | Get specific reminder |
| POST | `/api/reminders` | Create reminder |
| PUT | `/api/reminders/:id` | Update reminder |
| DELETE | `/api/reminders/:id` | Delete reminder |
| POST | `/api/reminders/:id/snooze` | Snooze reminder |
| GET | `/api/reminders/note/:noteId` | Get note's reminders |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/:id` | Get specific notification |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| DELETE | `/api/notifications/:id` | Delete notification |
| POST | `/api/notifications/mark-all-read` | Mark all as read |
| DELETE | `/api/notifications/cleanup` | Clean up old notifications |

## Security Considerations

1. **User Isolation**: All endpoints verify user ownership of notes/reminders
2. **Authentication**: All reminder endpoints require `protect` middleware
3. **Email Validation**: Verify email configuration before sending
4. **Data Cleanup**: Periodic cleanup of old notifications prevents database bloat
5. **Timezone Handling**: Use ISO 8601 format for all dates

## Troubleshooting

### Reminders Not Being Triggered
1. Check if scheduler is running in server logs
2. Verify MongoDB connection
3. Check reminder due dates are in the past
4. Verify `status` is not "snoozed" or "failed"

### Emails Not Sending
1. Check `.env` configuration
2. Run email verification: `GET /api/reminders/verify-email`
3. For Gmail: verify app password is correct
4. Check email service SMTP settings
5. Monitor server logs for email errors

### Recurring Reminders Not Rescheduling
1. Verify `recurring.enabled` is `true`
2. Check `frequency` is valid (daily, weekly, monthly, yearly)
3. Ensure `endDate` hasn't passed
4. Check reminder status in database

## Performance Optimization

- **MongoDB Indexes**: Pre-created on userId, dueDate, status, recurring
- **Batch Email Sending**: Multiple reminders grouped per user
- **Efficient Querying**: Only checks pending/snoozed reminders
- **Automatic Cleanup**: Old snoozed reminders removed after 7 days
- **Configurable Scheduler**: Adjust check frequency based on needs

## Future Enhancements

- [ ] Webhook support for external integrations
- [ ] Push notifications
- [ ] SMS notifications
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Reminder templates
- [ ] Collaborative reminders
- [ ] Reminder attachments
- [ ] Advanced scheduling (cron-like expressions)
- [ ] Analytics on reminder completion rates
