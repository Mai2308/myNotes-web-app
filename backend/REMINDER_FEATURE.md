# Reminder/Deadline Feature - Backend Implementation

## Overview
This feature adds reminder and deadline functionality to notes, including recurring reminders, multiple notification methods, and visual cues for overdue items.

## Features Implemented

### 1. **Database Schema (Note Model)**
Added new fields to the Note model:
- `reminderDate` - Date/time when the reminder should trigger
- `isRecurring` - Boolean flag for recurring reminders
- `recurringPattern` - Pattern for recurrence (daily, weekly, monthly, yearly)
- `notificationSent` - Tracks if notification was delivered
- `lastNotificationDate` - Timestamp of last notification
- `notificationMethods` - Array of notification methods (in-app, email)
- `isOverdue` - Flag to mark overdue notes

### 2. **API Endpoints**

#### Reminder Routes (`/api/reminders/`)
- `POST /:id/reminder` - Set or update a reminder for a note
- `DELETE /:id/reminder` - Remove a reminder from a note
- `GET /upcoming` - Get all upcoming reminders
- `GET /overdue` - Get all overdue notes
- `POST /:id/reminder/acknowledge` - Mark reminder as seen (and schedule next for recurring)
- `POST /:id/reminder/snooze` - Snooze a reminder by X minutes

#### Notification Routes (`/api/notifications/`)
- `GET /` - Get all in-app notifications for the user
- `PUT /:notificationId/read` - Mark a notification as read
- `DELETE /` - Clear all notifications for the user

### 3. **Notification System**

#### Scheduler Service
- Runs every minute via cron job
- Checks for reminders due within 5 minutes
- Processes notifications via configured methods
- Handles recurring reminders automatically

#### Email Service
- Sends HTML-formatted reminder emails
- Sends overdue notification emails
- Customizable email templates

#### In-App Notifications
- Stored in memory (can be upgraded to database/Redis)
- Includes notification ID, timestamp, read status
- Accessible via API endpoints

### 4. **Recurring Reminders**
Supported patterns:
- **Daily** - Repeats every day
- **Weekly** - Repeats every 7 days
- **Monthly** - Repeats every month
- **Yearly** - Repeats every year

After notification is acknowledged, the system automatically calculates the next occurrence.

### 5. **Visual Cues Support**
The backend provides:
- `isOverdue` flag for highlighting past deadlines
- Sorted endpoints for ordering by reminder date
- Status fields for frontend to apply visual indicators

## Configuration

### Environment Variables (.env)
Add these to your `.env` file:

```env
# Email Configuration (for Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# For Gmail: Generate App Password at https://myaccount.google.com/apppasswords
# For other providers: Use appropriate SMTP settings
```

### For Gmail Users
1. Enable 2-Factor Authentication
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate a password for "Mail" on "Other"
3. Use the generated password in `EMAIL_PASSWORD`

## Usage Examples

### Setting a Reminder
```javascript
POST /api/reminders/:noteId/reminder
{
  "reminderDate": "2025-12-20T10:00:00Z",
  "isRecurring": false,
  "notificationMethods": ["in-app", "email"]
}
```

### Setting a Recurring Reminder
```javascript
POST /api/reminders/:noteId/reminder
{
  "reminderDate": "2025-12-18T09:00:00Z",
  "isRecurring": true,
  "recurringPattern": "daily",
  "notificationMethods": ["in-app", "email"]
}
```

### Creating a Note with Reminder
```javascript
POST /api/notes
{
  "title": "Team Meeting",
  "content": "Discuss Q1 goals",
  "reminderDate": "2025-12-20T14:00:00Z",
  "notificationMethods": ["in-app", "email"]
}
```

### Snoozing a Reminder
```javascript
POST /api/reminders/:noteId/reminder/snooze
{
  "snoozeMinutes": 30
}
```

### Getting Upcoming Reminders
```javascript
GET /api/reminders/upcoming
Response: {
  "count": 5,
  "reminders": [...]
}
```

## Files Added/Modified

### New Files
1. `/backend/controllers/reminderController.js` - Reminder management logic
2. `/backend/routes/reminders.js` - Reminder API routes
3. `/backend/routes/notifications.js` - Notification API routes
4. `/backend/services/emailService.js` - Email sending functionality
5. `/backend/services/notificationService.js` - Notification scheduler and cron jobs

### Modified Files
1. `/backend/models/noteModel.js` - Added reminder fields to schema
2. `/backend/controllers/noteController.js` - Added reminder support to create/update
3. `/backend/server.js` - Registered new routes and started scheduler
4. `/backend/package.json` - Added node-cron and nodemailer dependencies

## Testing

### Manual Testing
1. Start the server: `npm start` or `npm run dev`
2. Create a note with a reminder 2-3 minutes in the future
3. Wait for the notification to trigger
4. Check in-app notifications via `GET /api/notifications`
5. Check your email for email notifications

### Test Scenarios
- ✅ Set reminder in future
- ✅ Set recurring reminder (daily/weekly/monthly/yearly)
- ✅ Remove reminder
- ✅ Snooze reminder
- ✅ Acknowledge reminder
- ✅ Get upcoming reminders
- ✅ Get overdue notes
- ✅ Email notifications
- ✅ In-app notifications

## Next Steps (Frontend Integration)

To complete this feature, the frontend should:
1. Add reminder date/time picker to note creation/editing UI
2. Add recurring reminder options (daily, weekly, monthly, yearly)
3. Display notification badge for pending in-app notifications
4. Show visual indicators (red highlighting) for overdue notes
5. Implement notification panel/dropdown
6. Add calendar view for notes with reminders
7. Sort notes by reminder date
8. Add snooze/acknowledge buttons in notifications

## Performance Considerations
- In-app notifications currently use in-memory storage
- For production, consider:
  - Redis for notification storage
  - WebSocket/SSE for real-time notifications
  - Message queue (RabbitMQ/Redis) for scaling
  - Separate notification service for high volume

## Security Notes
- All routes require authentication via JWT
- Email credentials should be kept secure
- Use app-specific passwords for Gmail
- Consider rate limiting for notification endpoints
