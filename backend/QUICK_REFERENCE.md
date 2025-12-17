# Reminder Feature - Quick Reference Card

## 🎯 What Was Built

Complete **Reminder/Deadline system** for the Notes app with:
- ⏰ One-time and recurring reminders
- 📧 Email notifications
- 🔔 In-app notifications  
- 📅 Visual cues (overdue highlighting)
- 🔄 Recurring patterns (daily/weekly/monthly/yearly)
- 🤐 Snooze functionality

## 🚀 Quick Start

### 1. Configure Email
Edit `.env` in `/backend`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### 2. Start Server
```bash
cd backend
npm install  # Already done: node-cron, nodemailer
npm run dev
```

### 3. Test Example
```bash
# Set reminder for 2 minutes from now
curl -X POST http://localhost:5000/api/reminders/NOTEID/reminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "reminderDate": "2025-12-18T14:30:00Z",
    "notificationMethods": ["in-app", "email"]
  }'

# Get notifications after trigger
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer TOKEN"
```

## 📚 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/reminders/:id/reminder` | Set/update reminder |
| DELETE | `/api/reminders/:id/reminder` | Remove reminder |
| GET | `/api/reminders/upcoming` | List upcoming |
| GET | `/api/reminders/overdue` | List overdue |
| POST | `/api/reminders/:id/reminder/acknowledge` | Mark seen |
| POST | `/api/reminders/:id/reminder/snooze` | Snooze by X min |
| GET | `/api/notifications` | Get in-app notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| DELETE | `/api/notifications` | Clear all |

## 📁 Files Added

```
backend/
├── controllers/reminderController.js    ← Reminder logic
├── routes/reminders.js                  ← Reminder endpoints
├── routes/notifications.js              ← Notification endpoints  
├── services/emailService.js             ← Email sending
├── services/notificationService.js      ← Scheduler (cron job)
├── .env                                 ← Updated with email config
├── .env.example                         ← Configuration template
├── REMINDER_FEATURE.md                  ← Full documentation
├── API_TESTING.md                       ← Testing guide
└── IMPLEMENTATION_SUMMARY.md            ← This implementation
```

## 🔄 How Scheduler Works

```
Every 60 seconds:
  ├─ Check for reminders due in next 5 minutes
  ├─ Send email notifications
  ├─ Add in-app notifications
  ├─ For recurring: Schedule next occurrence
  └─ Update status flags
```

## 📧 Email Credentials (Gmail)

1. Go to: https://myaccount.google.com/apppasswords
2. Generate App Password for "Mail" / "Windows/Mac/Linux"
3. Copy 16-character password
4. Paste into `.env` as `EMAIL_PASSWORD`

## 🎯 Database Fields Added to Note

```javascript
{
  reminderDate: Date,              // When to trigger
  isRecurring: Boolean,            // Repeats?
  recurringPattern: String,        // "daily"|"weekly"|"monthly"|"yearly"
  notificationSent: Boolean,       // Already sent?
  lastNotificationDate: Date,      // Last trigger time
  notificationMethods: Array,      // ["in-app", "email"]
  isOverdue: Boolean               // Past deadline?
}
```

## 💡 Usage Examples

### Create note with reminder
```javascript
POST /api/notes
{
  "title": "Meeting",
  "content": "Q1 planning",
  "reminderDate": "2025-12-20T14:00:00Z",
  "notificationMethods": ["in-app", "email"]
}
```

### Set recurring daily reminder
```javascript
POST /api/reminders/NOTEID/reminder
{
  "reminderDate": "2025-12-18T09:00:00Z",
  "isRecurring": true,
  "recurringPattern": "daily",
  "notificationMethods": ["in-app", "email"]
}
```

### Snooze 30 minutes
```javascript
POST /api/reminders/NOTEID/reminder/snooze
{
  "snoozeMinutes": 30
}
```

### Get upcoming
```javascript
GET /api/reminders/upcoming
→ { count: 5, reminders: [...] }
```

## ✅ Testing Checklist

- [ ] Email configured in `.env`
- [ ] Server started (`npm run dev`)
- [ ] Create note with reminder 2 min from now
- [ ] Wait for notification trigger
- [ ] Check email inbox
- [ ] GET `/api/notifications` → see in-app notification
- [ ] POST acknowledge → recurring scheduled next
- [ ] POST snooze → reminder postponed
- [ ] GET `/api/reminders/upcoming` → returns reminders
- [ ] GET `/api/reminders/overdue` → returns past deadlines

## 🐛 Debugging

### Check scheduler logs (backend console)
```
🔍 Checking for reminders...
📋 Found 1 due reminder(s)
📢 Processing reminder for note: Team Meeting
✅ In-app notification added
✅ Email sent: [MessageID]
```

### No notifications showing?
1. Check `.env` email credentials
2. Verify reminder is due (not in future)
3. Check if notification already sent (`notificationSent: true`)
4. Wait 60 seconds for scheduler to run

### Email not sending?
1. Verify Gmail App Password (16 chars)
2. Check `.env` EMAIL_USER matches Gmail
3. Check backend logs for error message
4. Verify internet connection

## 🔐 Security

- ✅ All routes require JWT authentication
- ✅ Email credentials in `.env` (not in code)
- ✅ Validation on all inputs
- ✅ SQL injection protection (Mongoose)
- ✅ XSS protection (sanitizeHtml)

## 📊 Performance

- Scheduler: Runs every 60 seconds
- 5-minute buffer for due reminders
- In-memory notifications (can upgrade to Redis)
- Efficient MongoDB queries with indexing

## 🔮 Future Enhancements

- [ ] WebSocket for real-time notifications
- [ ] Redis for scalable notification storage
- [ ] SMS notifications
- [ ] Push notifications (browser/mobile)
- [ ] Notification templates/customization
- [ ] Notification history/archive
- [ ] Timezone-aware reminders
- [ ] Notification preferences per user

---

**Status**: ✅ Backend Complete | ⏳ Ready for Frontend Integration
