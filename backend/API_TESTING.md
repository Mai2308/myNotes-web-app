# Reminder Feature - API Testing Guide

## Quick Start
1. Update `.env` with your email credentials
2. Start the backend: `npm run dev`
3. Use these cURL commands or Postman to test

## Prerequisites
- Logged-in user with valid JWT token
- Replace `YOUR_JWT_TOKEN` with an actual token from login
- Replace `YOUR_NOTE_ID` with an actual note ID
- Replace `YOUR_USER_EMAIL` with your email for testing

## Test Endpoints

### 1. Create a Note with Reminder
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Team Meeting",
    "content": "Discuss quarterly goals",
    "reminderDate": "2025-12-18T14:30:00Z",
    "notificationMethods": ["in-app", "email"]
  }'
```

### 2. Set Reminder on Existing Note
```bash
curl -X POST http://localhost:5000/api/reminders/YOUR_NOTE_ID/reminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reminderDate": "2025-12-18T15:00:00Z",
    "isRecurring": false,
    "notificationMethods": ["in-app", "email"]
  }'
```

### 3. Set Recurring Daily Reminder
```bash
curl -X POST http://localhost:5000/api/reminders/YOUR_NOTE_ID/reminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reminderDate": "2025-12-18T09:00:00Z",
    "isRecurring": true,
    "recurringPattern": "daily",
    "notificationMethods": ["in-app", "email"]
  }'
```

### 4. Get Upcoming Reminders
```bash
curl -X GET http://localhost:5000/api/reminders/upcoming \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "count": 2,
  "reminders": [
    {
      "_id": "note-id",
      "title": "Team Meeting",
      "reminderDate": "2025-12-18T14:30:00Z",
      "isRecurring": false,
      "isOverdue": false,
      "notificationSent": false
    }
  ]
}
```

### 5. Get Overdue Notes
```bash
curl -X GET http://localhost:5000/api/reminders/overdue \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Snooze a Reminder (10 minutes)
```bash
curl -X POST http://localhost:5000/api/reminders/YOUR_NOTE_ID/reminder/snooze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "snoozeMinutes": 10
  }'
```

### 7. Acknowledge Reminder (Mark as Seen)
```bash
curl -X POST http://localhost:5000/api/reminders/YOUR_NOTE_ID/reminder/acknowledge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Get In-App Notifications
```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "count": 2,
  "notifications": [
    {
      "id": 1702900800000,
      "noteId": "note-id",
      "title": "Team Meeting",
      "content": "Discuss quarterly goals",
      "type": "reminder",
      "timestamp": "2025-12-18T14:30:00Z",
      "read": false
    }
  ]
}
```

### 9. Mark Notification as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/1702900800000/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 10. Clear All Notifications
```bash
curl -X DELETE http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 11. Remove Reminder from Note
```bash
curl -X DELETE http://localhost:5000/api/reminders/YOUR_NOTE_ID/reminder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 12. Update Note with New Reminder
```bash
curl -X PUT http://localhost:5000/api/notes/YOUR_NOTE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "reminderDate": "2025-12-19T10:00:00Z",
    "isRecurring": true,
    "recurringPattern": "weekly",
    "notificationMethods": ["in-app", "email"]
  }'
```

## Testing with Postman

1. **Import the endpoints** as a Postman collection
2. **Set up environment variables**:
   - `base_url`: http://localhost:5000
   - `jwt_token`: Your JWT token from login
   - `note_id`: ID of a test note
   - `user_email`: Your email

3. **Use pre-request scripts** to automatically add auth headers:
```javascript
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.environment.get('jwt_token')
});
```

## Email Testing

### Setting Up Gmail for Testing
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated 16-character password in `.env` as `EMAIL_PASSWORD`

### Verifying Email Delivery
1. Check your inbox for reminder emails
2. Subject: `⏰ Reminder: [Note Title]`
3. Subject for overdue: `🔴 Overdue: [Note Title]`

## Scheduler Testing

The notification scheduler runs every minute. To test:

1. **Create a note with reminder 2-3 minutes from now**
2. **Watch the console logs** in the backend for:
   ```
   🔍 Checking for reminders...
   📋 Found 1 due reminder(s)
   📢 Processing reminder for note: [Title]
   ✅ In-app notification added
   ✅ Email sent: [MessageID]
   ```

3. **Check notifications**:
   - GET `/api/notifications` for in-app
   - Check email inbox for email notifications

## Debugging Tips

- Check backend logs for scheduler messages (🔍 🔄 ✅ ❌)
- Verify `.env` email credentials are correct
- Test email directly with `sendReminderEmail()` function
- Check database for `notificationSent` and `lastNotificationDate` fields
- Ensure note `reminderDate` is set and in future

## Common Issues

| Issue | Solution |
|-------|----------|
| Email not sending | Check `.env` credentials, enable Less Secure Apps (old Gmail), or use App Password |
| Reminder not triggering | Ensure `reminderDate` is in future, check scheduler logs |
| Recurring not working | Verify `isRecurring: true` and `recurringPattern` is set |
| 401 Unauthorized | JWT token expired, re-login to get new token |
| Note not found | Verify `YOUR_NOTE_ID` is correct and belongs to logged-in user |
