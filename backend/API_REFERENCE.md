# Developer Reference - Reminders API

## Quick API Reference

### Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Reminder Endpoints

### Create Reminder
```
POST /api/reminders
Content-Type: application/json

{
  "noteId": "507f1f77bcf86cd799439011",
  "dueDate": "2025-12-25T14:30:00Z",
  "notificationType": "email",
  "recurring": {
    "enabled": false
  }
}
```

**Response 201:**
```json
{
  "message": "Reminder created successfully",
  "reminder": {
    "_id": "507f1f77bcf86cd799439012",
    "noteId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439013",
    "dueDate": "2025-12-25T14:30:00Z",
    "title": "Project deadline",
    "notificationType": "email",
    "notificationSent": false,
    "recurring": { "enabled": false },
    "status": "pending",
    "createdAt": "2025-12-01T10:00:00Z"
  }
}
```

### Get All Reminders
```
GET /api/reminders?status=pending
```

**Query Parameters:**
- `status` - Filter by status: pending, sent, failed, snoozed
- `noteId` - Filter by note

**Response 200:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "noteId": "507f1f77bcf86cd799439011",
    "dueDate": "2025-12-25T14:30:00Z",
    "title": "Project deadline",
    "notificationType": "email",
    "status": "pending",
    "recurring": { "enabled": false }
  }
]
```

### Get Due Reminders
```
GET /api/reminders/due
```

**Response 200:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "noteId": "507f1f77bcf86cd799439011",
    "dueDate": "2025-12-20T14:30:00Z",
    "title": "Overdue task",
    "status": "pending"
  }
]
```

### Get Specific Reminder
```
GET /api/reminders/507f1f77bcf86cd799439012
```

**Response 200:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "noteId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439013",
  "dueDate": "2025-12-25T14:30:00Z",
  "title": "Project deadline",
  "notificationType": "email",
  "notificationSent": false,
  "recurring": {
    "enabled": false,
    "frequency": null,
    "endDate": null,
    "lastTriggeredAt": null
  },
  "status": "pending",
  "snoozeUntil": null,
  "createdAt": "2025-12-01T10:00:00Z",
  "updatedAt": "2025-12-01T10:00:00Z"
}
```

### Update Reminder
```
PUT /api/reminders/507f1f77bcf86cd799439012
Content-Type: application/json

{
  "dueDate": "2025-12-26T15:00:00Z",
  "notificationType": "alert",
  "recurring": {
    "enabled": true,
    "frequency": "daily",
    "endDate": "2025-12-31T23:59:59Z"
  }
}
```

**Response 200:**
```json
{
  "message": "Reminder updated successfully",
  "reminder": { ... }
}
```

### Delete Reminder
```
DELETE /api/reminders/507f1f77bcf86cd799439012
```

**Response 200:**
```json
{
  "message": "Reminder deleted successfully"
}
```

### Snooze Reminder
```
POST /api/reminders/507f1f77bcf86cd799439012/snooze
Content-Type: application/json

{
  "minutesToSnooze": 15
}
```

**Response 200:**
```json
{
  "message": "Reminder snoozed for 15 minutes",
  "reminder": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "snoozed",
    "snoozeUntil": "2025-12-01T10:15:00Z"
  }
}
```

### Get Reminders for a Note
```
GET /api/reminders/note/507f1f77bcf86cd799439011
```

**Response 200:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "noteId": "507f1f77bcf86cd799439011",
    "dueDate": "2025-12-25T14:30:00Z",
    "notificationType": "email",
    "status": "pending"
  }
]
```

## Notification Endpoints

### Get All Notifications
```
GET /api/notifications?limit=50&unreadOnly=false
```

**Query Parameters:**
- `limit` - Maximum results (default: 50)
- `unreadOnly` - Only unread notifications (default: false)

**Response 200:**
```json
{
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439013",
      "reminderId": "507f1f77bcf86cd799439012",
      "noteId": "507f1f77bcf86cd799439011",
      "title": "Project deadline",
      "message": "Reminder for: \"Project deadline\"",
      "type": "reminder",
      "notificationMethod": "email",
      "priority": "normal",
      "read": false,
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

### Get Specific Notification
```
GET /api/notifications/507f1f77bcf86cd799439014
```

**Response 200:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439013",
  "reminderId": "507f1f77bcf86cd799439012",
  "noteId": "507f1f77bcf86cd799439011",
  "title": "Project deadline",
  "message": "Reminder for: \"Project deadline\" (Overdue)",
  "type": "overdue",
  "notificationMethod": "email",
  "priority": "urgent",
  "read": false,
  "actionUrl": "/notes/507f1f77bcf86cd799439011",
  "createdAt": "2025-12-01T10:00:00Z"
}
```

### Mark Notification as Read
```
PATCH /api/notifications/507f1f77bcf86cd799439014/read
```

**Response 200:**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "_id": "507f1f77bcf86cd799439014",
    "read": true,
    "readAt": "2025-12-01T11:30:00Z"
  }
}
```

### Mark All Notifications as Read
```
POST /api/notifications/mark-all-read
```

**Response 200:**
```json
{
  "message": "All notifications marked as read",
  "updatedCount": 5
}
```

### Delete Notification
```
DELETE /api/notifications/507f1f77bcf86cd799439014
```

**Response 200:**
```json
{
  "message": "Notification deleted successfully"
}
```

### Cleanup Old Notifications
```
DELETE /api/notifications/cleanup
Content-Type: application/json

{
  "daysOld": 30
}
```

**Response 200:**
```json
{
  "message": "Cleaned up notifications older than 30 days",
  "deletedCount": 42
}
```

## Note Endpoints (Updated)

### Create Note with Reminder
```
POST /api/notes
Content-Type: application/json

{
  "title": "Project deadline",
  "content": "Complete the project by this date",
  "tags": ["work"],
  "reminder": {
    "enabled": true,
    "dueDate": "2025-12-25T14:30:00Z",
    "notificationSent": false,
    "recurring": {
      "enabled": false
    }
  }
}
```

### Update Note with Reminder
```
PUT /api/notes/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "title": "Updated title",
  "reminder": {
    "enabled": true,
    "dueDate": "2025-12-26T15:00:00Z",
    "notificationSent": false,
    "recurring": {
      "enabled": true,
      "frequency": "daily"
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "noteId and dueDate are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Reminder not found"
}
```

### 500 Server Error
```json
{
  "message": "Error creating reminder"
}
```

## Data Types

### Reminder Object
```javascript
{
  _id: ObjectId,
  noteId: ObjectId,        // Reference to Note
  userId: ObjectId,        // Reference to User
  dueDate: Date,           // ISO 8601 format
  title: String,           // From note
  notificationType: String, // email | in-app | alert
  notificationSent: Boolean,
  sentAt: Date,            // When sent
  recurring: {
    enabled: Boolean,
    frequency: String,     // daily | weekly | monthly | yearly
    endDate: Date,
    lastTriggeredAt: Date
  },
  status: String,          // pending | sent | failed | snoozed
  snoozeUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Object
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  reminderId: ObjectId,
  noteId: ObjectId,
  title: String,
  message: String,
  type: String,            // reminder | deadline-approaching | overdue | custom
  notificationMethod: String, // email | in-app | alert | push
  read: Boolean,
  readAt: Date,
  priority: String,        // low | normal | high | urgent
  actionUrl: String,       // Link to note
  metadata: Mixed,         // Extra data
  createdAt: Date,
  updatedAt: Date
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - GET, PUT, PATCH, DELETE |
| 201 | Created - POST successful |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

## Common Usage Patterns

### Create and Get Reminder
```javascript
// 1. Create reminder
const reminderRes = await fetch('/api/reminders', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ noteId, dueDate, notificationType })
});
const reminder = await reminderRes.json();

// 2. Retrieve it
const getRes = await fetch(`/api/reminders/${reminder.reminder._id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const fetchedReminder = await getRes.json();
```

### Update and Snooze
```javascript
// 1. Update reminder
await fetch(`/api/reminders/${reminderId}`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ dueDate: newDate })
});

// 2. Snooze it
await fetch(`/api/reminders/${reminderId}/snooze`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ minutesToSnooze: 15 })
});
```

### Get and Clear Notifications
```javascript
// 1. Get all
const notRes = await fetch('/api/notifications', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { notifications, unreadCount } = await notRes.json();

// 2. Mark all read
await fetch('/api/notifications/mark-all-read', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Rate Limiting
Currently no rate limiting. Recommended limits for production:
- 100 requests/minute per user
- 1000 requests/minute per IP

## Pagination
Use `limit` parameter for large result sets:
```
GET /api/notifications?limit=50&skip=0
```

## Sorting
Results are sorted by:
- Reminders: by dueDate (ascending)
- Notifications: by createdAt (descending)

---

**API Reference v1.0** ✅

For more information, see [REMINDERS_FEATURE.md](./REMINDERS_FEATURE.md)
