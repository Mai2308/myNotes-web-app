# Database Migration Guide

## Overview
This guide helps you add the reminders feature to an existing Notes App database.

## What's New in Database Schema

### Note Model Changes
The Note model now includes a `reminder` object:
```javascript
reminder: {
  enabled: Boolean,           // default: false
  dueDate: Date,              // default: null
  notificationSent: Boolean,  // default: false
  recurring: {
    enabled: Boolean,         // default: false
    frequency: String,        // enum: daily, weekly, monthly, yearly
    endDate: Date,            // optional
    lastNotificationDate: Date // optional
  }
}
```

### New Collections
Two new collections are created automatically:
- `reminders` - Stores reminder data
- `notifications` - Stores notification history

## Migration Steps

### Option 1: Fresh Start (Recommended for Development)
If you're in development and don't have important data:

```bash
# Drop and recreate database
mongo
> use notes-app
> db.dropDatabase()
> exit

# Restart server
npm start
```

Server will automatically create collections and indexes.

### Option 2: Keep Existing Notes (Production)

#### Step 1: Backup Your Database
```bash
# Backup MongoDB
mongodump --db notes-app --out ./backup

# Or backup to MongoDB Atlas:
# Download from the Atlas dashboard
```

#### Step 2: Add Default Reminder Fields
If using MongoDB client:

```javascript
// Add reminder field to all existing notes
db.notes.updateMany(
  {},
  {
    $set: {
      "reminder": {
        enabled: false,
        dueDate: null,
        notificationSent: false,
        recurring: {
          enabled: false,
          frequency: null,
          endDate: null,
          lastNotificationDate: null
        }
      }
    }
  }
);

// Verify update
db.notes.findOne() // should show reminder field
```

Or using MongoDB Compass:
1. Right-click collection → Query
2. Filter: `{}`
3. Update: 
```json
{
  "$set": {
    "reminder": {
      "enabled": false,
      "dueDate": null,
      "notificationSent": false,
      "recurring": {
        "enabled": false,
        "frequency": null,
        "endDate": null,
        "lastNotificationDate": null
      }
    }
  }
}
```

#### Step 3: Create Indexes

Automatically created, but you can verify:

```javascript
// In MongoDB shell
db.reminders.createIndex({ userId: 1, dueDate: 1, notificationSent: 1 });
db.reminders.createIndex({ userId: 1, status: 1 });
db.reminders.createIndex({ "recurring.enabled": 1, "recurring.lastTriggeredAt": 1 });

db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, read: 1 });
```

#### Step 4: Deploy New Code
```bash
# Pull latest changes
git pull

# Install new dependencies
npm install nodemailer

# Start server
npm start
```

## Rollback Plan

### If Something Goes Wrong

#### Restore from Backup
```bash
# From mongodump backup
mongorestore --db notes-app ./backup/notes-app

# From MongoDB Atlas backup (restore from dashboard)
```

#### Remove Reminder Fields (if needed)
```javascript
db.notes.updateMany({}, { $unset: { reminder: "" } });
```

#### Drop New Collections
```javascript
db.reminders.drop();
db.notifications.drop();
```

## Verification Steps

After migration:

```bash
# Check notes have reminder field
mongo
> use notes-app
> db.notes.findOne({}, { title: 1, reminder: 1 })

# Should output:
{
  "_id": ObjectId("..."),
  "title": "Example note",
  "reminder": {
    "enabled": false,
    "dueDate": null,
    "notificationSent": false,
    "recurring": {
      "enabled": false,
      "frequency": null,
      "endDate": null,
      "lastNotificationDate": null
    }
  }
}

# Check new collections exist
> db.getCollectionNames()
# Should include: "reminders", "notifications"

# Verify indexes
> db.reminders.getIndexes()
> db.notifications.getIndexes()
```

## Data Validation

After migration, validate data integrity:

```javascript
// Count notes without reminder field
db.notes.countDocuments({ reminder: { $exists: false } });
// Should be 0

// Count reminders
db.reminders.countDocuments();
// Should be 0 initially

// Count notifications
db.notifications.countDocuments();
// Should be 0 initially

// Check for invalid reminder data
db.notes.find({
  "reminder.recurring.frequency": { 
    $nin: [null, "daily", "weekly", "monthly", "yearly"] 
  }
});
// Should return 0
```

## Testing After Migration

### 1. Test Existing Notes Still Work
```javascript
// Create a note (should have default reminder)
POST /api/notes
{
  "title": "Test note",
  "content": "Test content"
}

// Should return note with reminder field
```

### 2. Test Create Reminder
```javascript
POST /api/reminders
{
  "noteId": "NOTE_ID",
  "dueDate": "2025-12-25T14:00:00Z",
  "notificationType": "email"
}
```

### 3. Test Scheduler
```bash
# Monitor logs
# Should see: "⏰ Found X due reminders"
```

## Environment Configuration

After migration, configure `.env`:

```env
# Email service (required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Scheduler
REMINDER_CHECK_INTERVAL=60000

# Features
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_REMINDERS=true
```

## Common Issues & Solutions

### Issue: "reminder" field undefined in new notes
**Solution:** Ensure server has latest code. Restart with `npm start`

### Issue: Scheduler not running
**Solution:** Check logs for `🚀 Starting reminder scheduler...`. If not present, check MongoDB connection.

### Issue: Email not sending
**Solution:** Verify `.env` SMTP configuration. Run email verification test.

### Issue: Old data shows duplicate reminders
**Solution:** This is normal if you manually added reminders. Use migration script to clean up:
```javascript
db.reminders.deleteMany({ _id: { $in: [old_ids] } });
```

## Performance Impact

Migration typically has minimal impact:
- Adding fields to existing notes: < 1ms per note
- Creating indexes: Depends on data size (usually < 1 second)
- No downtime required for users

## Monitoring After Migration

Watch for:
1. **Scheduler logs:** Look for check frequency
2. **Email errors:** Check if SMTP configured
3. **Database performance:** Monitor index usage
4. **User feedback:** Ensure existing functionality still works

## Rollback Procedure

If you need to rollback:

```bash
# Stop server
Ctrl+C

# Restore backup
mongorestore --db notes-app ./backup/notes-app

# Revert code
git checkout previous-version

# Restart
npm start
```

## Documentation

- See [REMINDERS_FEATURE.md](./REMINDERS_FEATURE.md) for full feature docs
- See [REMINDERS_QUICK_START.md](./REMINDERS_QUICK_START.md) for setup
- See [CHECKLIST.md](./CHECKLIST.md) for verification

---

## Timeline

**Estimated Migration Time:**
- Fresh start: 1 minute
- Existing database: 5-10 minutes
- Testing: 15-20 minutes

**Total: 20-30 minutes**

## Support

If you encounter issues:
1. Check server logs for errors
2. Verify MongoDB connection
3. Run validation queries
4. Consult troubleshooting section
5. Check documentation files

---

**Migration Complete!** ✅

Your database is now ready for the reminders feature.
