# Frontend Implementation Guide - Reminders Feature

## Overview

The reminders feature is now fully implemented on the frontend with a complete React component ecosystem. This guide explains the architecture, components, and how everything integrates together.

## Frontend Components Created

### 1. **ReminderForm Component** (`frontend/src/components/ReminderForm.jsx`)

**Purpose**: Main form for users to set/edit reminders on notes

**Features**:
- Enabled/disabled toggle
- Date picker with minimum date validation
- Time picker (HH:MM format)
- Notification type selector (in-app, email, both)
- Recurring reminder options (daily, weekly, monthly, yearly)
- Optional recurring end date
- Summary preview of configured reminder
- Submit/Cancel buttons with loading state

**Props**:
```javascript
ReminderForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,    // (reminderData) => void
  onCancel: PropTypes.func.isRequired,    // () => void
  initialData: PropTypes.object,          // { enabled, dueDate, dueTime, notificationType, recurring }
  isLoading: PropTypes.bool,              // Show loading state
}
```

**Usage Example**:
```jsx
<ReminderForm
  onSubmit={(data) => handleSaveReminder(data)}
  onCancel={() => setShowForm(false)}
  initialData={existingReminder}
  isLoading={isSaving}
/>
```

### 2. **NotificationCenter Component** (`frontend/src/components/NotificationCenter.jsx`)

**Purpose**: Header notification bell with dropdown of recent notifications

**Features**:
- Bell icon with unread count badge
- Dropdown showing recent notifications (max 10)
- Mark individual notification as read
- Delete individual notifications
- Mark all as read button
- Clean up old notifications (7+ days old)
- Auto-closes when clicking outside
- Auto-refreshes every 30 seconds

**Data Structure**:
```javascript
notification = {
  _id: String,
  title: String,
  message: String,
  read: Boolean,
  createdAt: ISO8601String,
}
```

**Usage**: Add to Header component
```jsx
import NotificationCenter from './NotificationCenter';

// In Header render:
{user && <NotificationCenter />}
```

### 3. **RemindersList Component** (`frontend/src/components/RemindersList.jsx`)

**Purpose**: Full reminder management interface (typically for a Reminders page)

**Features**:
- Display all user reminders
- Filter by status: All, Overdue, Due Soon, Upcoming
- Sort: Earliest First, Latest First
- Group by date with collapsible groups
- Status indicators (color-coded)
- Quick actions:
  - Snooze overdue (1 hour, 1 day)
  - Delete reminder
  - View note title

**Status Colors**:
- Overdue: Red (#dc3545)
- Due Soon (< 24h): Yellow (#ffc107)
- Upcoming: Green (#28a745)

**Usage Example**:
```jsx
<RemindersList onReminderUpdated={() => refetchData()} />
```

### 4. **UpcomingRemindersWidget Component** (`frontend/src/components/UpcomingRemindersWidget.jsx`)

**Purpose**: Dashboard widget showing next 5 due reminders

**Features**:
- Shows reminders due in next 7 days or overdue
- Color-coded by status
- Formatted dates (Today, Tomorrow, In X days)
- Time display for each reminder
- Empty state message

**Usage**:
```jsx
import UpcomingRemindersWidget from './UpcomingRemindersWidget';

// In Dashboard (root view):
{selectedFolderId === null && <UpcomingRemindersWidget />}
```

## Styling

### CSS File: `frontend/src/styles/reminder.css`

Comprehensive stylesheet including:

**ReminderForm Styles**:
- `.reminder-form` - Main form container
- `.form-group` - Form field grouping
- `.form-input`, `.form-select` - Input elements with focus states
- `.recurring-options` - Recurring frequency section
- `.reminder-summary` - Preview of configured reminder
- `.form-actions` - Submit/Cancel buttons

**NotificationCenter Styles**:
- `.notification-center` - Container
- `.notification-bell-button` - Bell icon button
- `.notification-badge` - Unread count badge
- `.notification-dropdown` - Dropdown menu
- `.notification-item` - Individual notification item
- `.notification-item.unread` - Unread notification styling

**RemindersList Styles**:
- `.reminders-list` - Container
- `.reminder-item` - Individual reminder with status color
- `.reminder-item.overdue`, `.reminder-item.due-soon`, `.reminder-item.upcoming`
- `.reminder-controls` - Filter/sort buttons
- `.filter-button` - Status/sort filter button

**Dark Mode Support**: All components support dark mode via CSS variables

**Responsive Design**: Mobile-friendly layouts with breakpoints at 768px

## State Management

### ReminderContext (`frontend/src/context/ReminderContext.jsx`)

Global state management for reminders and notifications.

**Provider Setup** (in App.jsx):
```jsx
import { ReminderProvider } from './context/ReminderContext';

export default function App() {
  return (
    <ReminderProvider>
      {/* Routes */}
    </ReminderProvider>
  );
}
```

**Hook Usage**:
```javascript
import { useReminders } from '../context/ReminderContext';

function MyComponent() {
  const {
    reminders,                    // Array of all reminders
    notifications,                // Array of all notifications
    isLoading,                    // Loading state
    error,                        // Error message if any
    fetchReminders,               // () => Promise
    fetchNotifications,           // () => Promise
    createReminderHandler,        // (noteId, data) => Promise
    updateReminderHandler,        // (reminderId, data) => Promise
    deleteReminderHandler,        // (reminderId) => Promise
    snoozeReminderHandler,        // (reminderId, minutes) => Promise
    getUpcomingReminders,         // () => Array (due in 24h or overdue)
    getOverdueReminders,          // () => Array
    getUnreadNotifications,       // () => Array
  } = useReminders();
}
```

**Auto-refresh Schedule**:
- Reminders: Every 5 minutes (or manually via fetchReminders)
- Notifications: Every 30 seconds (or manually via fetchNotifications)

## API Integration

### Reminders API (`frontend/src/api/remindersApi.js`)

All reminder and notification API calls are centralized in this module.

**Reminder Functions**:
```javascript
// Create new reminder
createReminder(noteId, data) // Returns reminder object

// Get all reminders
getReminders(filters) // Returns array of reminders

// Get reminders for specific note
getRemindersForNote(noteId) // Returns array

// Get due reminders (overdue + due in 24h)
getDueReminders() // Returns array

// Get single reminder
getReminder(id) // Returns reminder object

// Update reminder
updateReminder(id, data) // Returns updated reminder

// Delete reminder
deleteReminder(id) // Returns void

// Snooze reminder (reschedule for later)
snoozeReminder(id, minutes) // Returns updated reminder
```

**Notification Functions**:
```javascript
// Get notifications
getNotifications(limit, unreadOnly) // Returns array

// Get single notification
getNotification(id) // Returns notification object

// Mark as read
markNotificationAsRead(id) // Returns updated notification

// Mark all as read
markAllNotificationsAsRead() // Returns void

// Delete notification
deleteNotification(id) // Returns void

// Cleanup old notifications
cleanupNotifications(daysOld) // Returns void
```

**Utility Functions**:
```javascript
// Format reminder for display (adds computed properties)
formatReminderForDisplay(reminder) // Returns enhanced reminder

// Sort by due date
sortRemindersByDueDate(reminders, ascending) // Returns array

// Filter by status
filterRemindersByStatus(reminders, status) // Returns array

// Group by date
groupRemindersByDate(reminders) // Returns { "Today": [...], "Tomorrow": [...], ... }
```

## Integration Points

### 1. CreateNote Page

**File**: `frontend/src/pages/CreateNote.jsx`

Added:
- Reminder state: `reminderData`, `showReminderForm`
- Reminder UI section with toggle to show ReminderForm
- When saving note: Create reminder if `reminderData` is set
- Display current reminder status

### 2. EditNote Page

**File**: `frontend/src/pages/EditNote.jsx`

Added:
- Reminder state: `reminder`, `showReminderForm`
- Load reminders for note when component mounts
- Reminder UI section with toggle to show ReminderForm
- When saving: Update/create/delete reminder based on changes
- Display current reminder with due date and time

### 3. Header

**File**: `frontend/src/components/Header.jsx`

Added:
- NotificationCenter component import
- Render bell icon: `{user && <NotificationCenter />}`

### 4. Dashboard

**File**: `frontend/src/components/Dashboard.jsx`

Added:
- UpcomingRemindersWidget import
- Display widget only in root view (not in folders)
- Shows next 5 due reminders with status indicators

## Data Flow

```
User Creates/Edits Note
        ↓
Shows ReminderForm
        ↓
Sets reminder details (date, time, recurring, notification type)
        ↓
Submits: createReminder(noteId, reminderData) via ReminderContext
        ↓
Backend creates/updates reminder
        ↓
ReminderContext fetches updated reminders
        ↓
Components re-render with new reminder
        ↓
UpcomingRemindersWidget shows reminder
NotificationCenter polls for notifications
        ↓
When reminder is due:
- Backend triggers scheduler
- Creates notification record
- Sends email (if configured)
- Shows in-app alert (if configured)
        ↓
NotificationCenter displays new notification
User can mark read, delete, or snooze
```

## Usage Examples

### Example 1: Adding Reminder When Creating Note

```jsx
// In CreateNote.jsx
const [reminderData, setReminderData] = useState(null);

// When user clicks "Set Reminder"
<ReminderForm
  onSubmit={(data) => {
    setReminderData(data);
    setShowReminderForm(false);
  }}
  ...
/>

// When saving note
if (reminderData && noteId) {
  await createReminder(noteId, reminderData);
}
```

### Example 2: Checking Upcoming Reminders

```jsx
// In Dashboard or any component
const { getUpcomingReminders } = useReminders();

const upcomingReminders = getUpcomingReminders(); // Get next 24h + overdue
upcomingReminders.forEach(reminder => {
  console.log(`${reminder.noteTitle} is due at ${reminder.dueDate}`);
});
```

### Example 3: Showing Notifications

```jsx
// In any component
const { getUnreadNotifications } = useReminders();

const unread = getUnreadNotifications();
console.log(`You have ${unread.length} unread notifications`);
```

## Testing Checklist

- [ ] Create note with reminder - verify saves
- [ ] Edit note reminder - verify updates
- [ ] Delete reminder - verify removes
- [ ] View upcoming reminders widget on dashboard
- [ ] Filter reminders list by status
- [ ] Sort reminders list ascending/descending
- [ ] Mark notification as read
- [ ] Delete notification
- [ ] Snooze overdue reminder
- [ ] Test recurring reminder configuration
- [ ] Test with different notification types
- [ ] Mobile responsive layout
- [ ] Dark mode styling

## Performance Considerations

1. **Polling Strategy**: 
   - Reminders: 5-minute intervals (can be adjusted)
   - Notifications: 30-second intervals
   - Adjust based on your needs

2. **Component Optimization**:
   - Components using Context subscribe to updates
   - Consider using selectors for fine-grained updates in future

3. **Notification Cleanup**:
   - Old notifications should be cleaned up periodically
   - Default: 7 days via `cleanupNotifications(7)`

## Future Enhancements

1. **Calendar View**: Display reminders on calendar
2. **Toast Notifications**: Real-time in-app alerts when reminder triggers
3. **Browser Notifications**: Show system notifications
4. **Reminder Analytics**: Charts showing reminder completion rates
5. **Snooze Presets**: Quick snooze buttons (5min, 15min, 1h, 1d)
6. **Reminder Templates**: Save common reminder configs
7. **Team Reminders**: Share reminders with other users
8. **Recurring Exceptions**: Skip specific occurrences of recurring reminders

## Troubleshooting

**Reminders not appearing?**
1. Check browser console for API errors
2. Verify backend is running and accessible
3. Check localStorage for token: `localStorage.getItem('token')`
4. Verify ReminderProvider is wrapping app

**Notifications not updating?**
1. Check network tab for polling requests
2. Verify backend notification service is running
3. Check email configuration if using email notifications

**Styling issues?**
1. Ensure `reminder.css` is properly imported
2. Check CSS variable definitions: `--bg-secondary`, `--text-primary`, etc.
3. Verify dark mode preference: `prefers-color-scheme: dark`

## File Summary

**Created Files**:
- `frontend/src/components/ReminderForm.jsx` - Form component
- `frontend/src/components/NotificationCenter.jsx` - Notification bell + dropdown
- `frontend/src/components/RemindersList.jsx` - Reminders management interface
- `frontend/src/components/UpcomingRemindersWidget.jsx` - Dashboard widget
- `frontend/src/context/ReminderContext.jsx` - Global state management
- `frontend/src/styles/reminder.css` - All reminder-related styles

**Modified Files**:
- `frontend/src/api/remindersApi.js` - API integration layer (already created)
- `frontend/src/pages/CreateNote.jsx` - Added reminder section
- `frontend/src/pages/EditNote.jsx` - Added reminder section
- `frontend/src/components/Header.jsx` - Added NotificationCenter
- `frontend/src/components/Dashboard.jsx` - Added UpcomingRemindersWidget
- `frontend/src/App.jsx` - Added ReminderProvider wrapper

**Total**: 6 new files, 5 modified files

## Backend Integration

The frontend integrates with the following backend endpoints:

**Reminder Endpoints**:
- `POST /api/reminders` - Create reminder
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/due` - Get due reminders
- `GET /api/reminders/:id` - Get single reminder
- `PATCH /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `POST /api/reminders/:id/snooze` - Snooze reminder

**Notification Endpoints**:
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/:id` - Get single notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/cleanup` - Cleanup old

See backend documentation for request/response schemas.
