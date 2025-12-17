# Reminder/Deadline Feature - Frontend Implementation Guide

## Overview
This document provides complete information about the frontend implementation of the Reminder/Deadline feature for the Notes App.

## Created Frontend Files

### 1. **Components**

#### ReminderModal.jsx (`frontend/src/components/ReminderModal.jsx`)
- **Purpose**: Modal dialog for setting/editing reminders
- **Key Features**:
  - Date and time picker inputs
  - Recurring reminder toggle
  - Pattern selector (daily, weekly, monthly, yearly)
  - Notification method selection (email, in-app)
  - Input validation (reminder must be in the future)
  - Error handling and display

**Props**:
```javascript
{
  initialReminder: {
    reminderDate: "2024-01-15T14:00:00Z",
    isRecurring: false,
    recurringPattern: "daily",
    notificationMethods: ["in-app", "email"]
  },
  onSave: (reminderData) => {},
  onClose: () => {}
}
```

#### NotificationCenter.jsx (`frontend/src/components/NotificationCenter.jsx`)
- **Purpose**: Bell icon with notification dropdown panel
- **Key Features**:
  - Bell icon with unread notification badge counter
  - Dropdown panel showing all notifications
  - Polls backend for new notifications every 30 seconds
  - Mark notifications as read
  - Clear all notifications
  - Visual distinction for overdue notifications (red)
  - Empty state message when no notifications

**Features**:
- Automatically updates when new notifications arrive
- Displays notification type, title, and time
- Quick actions for each notification (mark read)
- Responsive design for mobile

### 2. **API Wrappers**

#### notificationsApi.js (`frontend/src/api/notificationsApi.js`)
- **Purpose**: API wrapper for notification endpoints
- **Functions**:
  - `getNotifications(token)` - Fetch all notifications
  - `markNotificationAsRead(notificationId, token)` - Mark as read
  - `clearNotifications(token)` - Clear all notifications

#### remindersApi.js (Already Exists)
- **Purpose**: API wrapper for reminder endpoints
- **Functions** (Pre-existing, fetch-based):
  - `setReminder(noteId, reminderData, token)`
  - `removeReminder(noteId, token)`
  - `getUpcomingReminders(token)`
  - `getOverdueNotes(token)`
  - `acknowledgeReminder(noteId, token)`
  - `snoozeReminder(noteId, token)`

### 3. **Styles**

#### reminder.css (`frontend/src/styles/reminder.css`)
- Pastel-themed styling for ReminderModal
- Light mode: Pink accent (#ff7eb9), gradient background, white cards
- Dark mode: Dark blue-grey theme (#1b2536), text #f1f5f9
- CSS variables for theme support
- Responsive design for mobile

#### notificationCenter.css (`frontend/src/styles/notificationCenter.css`)
- Pastel-themed styling for NotificationCenter
- Bell icon with animated badge
- Dropdown panel with scrollable notification list
- Overdue notification styling (red)
- Light and dark mode support
- Mobile-responsive layout

## Integration Points

### 1. **NoteEditor.jsx** - Updated
- Added Clock icon import from lucide-react
- Added reminder button to toolbar
- State for reminder modal visibility
- State for reminder data
- Expose reminder data via `getReminder()` and `setReminder()` ref methods
- Render ReminderModal when requested

**Modified Methods**:
```javascript
// In useImperativeHandle
getReminder: () => reminder,
setReminder: (remindData) => setReminder(remindData),
```

### 2. **CreateNote.jsx** - Updated
- Extract reminder data from editor via `ref.current.getReminder()`
- Pass reminder fields to `createNote()` API call:
  - `reminderDate`
  - `isRecurring`
  - `recurringPattern`
  - `notificationMethods`

### 3. **EditNote.jsx** - Updated
- Load existing reminder data from note
- Initialize reminder state from loaded note
- Extract reminder data when updating
- Pass reminder fields to `updateNote()` API call

### 4. **App.jsx** - Updated
- Import NotificationCenter component
- Render NotificationCenter in header (only when user logged in)
- Component automatically handles polling and display

### 5. **Dashboard.jsx** - Updated
- Import Clock and AlertCircle icons from lucide-react
- Display reminder indicator badge for notes with reminders
- Display overdue indicator badge for overdue notes
- Add visual styling for overdue notes (red left border, gradient background)
- Show reminder date on hover

## Data Flow

### Creating a Note with Reminder

```
User Input
    ↓
NoteEditor (set reminder via ReminderModal)
    ↓
CreateNote (extract reminder data from editor)
    ↓
notesApi.createNote({
  title,
  content,
  reminderDate,
  isRecurring,
  recurringPattern,
  notificationMethods
})
    ↓
Backend (set reminder in database)
    ↓
Success message
```

### Notification Flow

```
Backend (every 60 seconds)
    ↓
Check reminders & create notifications
    ↓
Store in-app notifications
    ↓
NotificationCenter (polls every 30 seconds)
    ↓
Fetch notifications
    ↓
Display bell badge with count
    ↓
User clicks bell → view notification panel
    ↓
User marks as read or clears
```

## Theme Integration

### CSS Variables Used
- Light Mode (`body.light`):
  - Background: `#ffffff` (cards), gradient `#fef6fb` to `#e0f7fa`
  - Accent: `#ff7eb9` (pink)
  - Text: `#0f172a`
  - Border: `rgba(15, 23, 42, 0.08)`

- Dark Mode (`body.dark`):
  - Background: `#1b2536` (cards), gradient `#0f172a` to `#1e293b`
  - Accent: `#ff7eb9` (pink)
  - Text: `#f1f5f9`
  - Border: `rgba(255, 255, 255, 0.08)`

### Theme Context Usage
Both new components use `useTheme()` hook from ThemeContext to access current theme and apply proper styling.

## Testing Checklist

### Component Tests
- [ ] ReminderModal opens when clock button clicked
- [ ] Date and time inputs accept valid dates
- [ ] Future date validation works (shows error for past dates)
- [ ] Recurring checkbox toggles pattern selector visibility
- [ ] Pattern selector shows all options (daily, weekly, monthly, yearly)
- [ ] Notification methods can be toggled
- [ ] Save button saves reminder data
- [ ] Cancel button closes without saving

### Notification Center Tests
- [ ] Bell icon displays correctly
- [ ] Unread notification badge shows correct count
- [ ] Dropdown opens on bell click
- [ ] Notifications update every 30 seconds
- [ ] Mark as read button works
- [ ] Clear all button works
- [ ] Overdue notifications show red styling

### Integration Tests
- [ ] Create note with reminder saves to backend
- [ ] Edit note with reminder updates backend
- [ ] Reminders display in Dashboard with badges
- [ ] Overdue notes show red styling in Dashboard
- [ ] NotificationCenter displays notifications from backend
- [ ] Theme switching affects all components correctly

### API Tests
- [ ] POST /api/notes - includes reminder fields
- [ ] PUT /api/notes/:id - includes reminder fields
- [ ] GET /api/notifications - returns notification list
- [ ] PUT /api/notifications/:id/read - marks as read
- [ ] DELETE /api/notifications - clears all

## Backend API Integration

### Note Creation/Update
The frontend now sends reminder data to the backend:

```javascript
// CreateNote payload
{
  title: "My Note",
  content: "...",
  reminderDate: "2024-01-15T14:00:00Z",
  isRecurring: true,
  recurringPattern: "daily",
  notificationMethods: ["in-app", "email"]
}
```

### Notification Polling
The NotificationCenter polls the `/api/notifications` endpoint every 30 seconds:

```javascript
GET /api/notifications
Response: [
  {
    _id: "...",
    noteId: "...",
    title: "Reminder: My Note",
    message: "Your reminder for 'My Note' is due",
    type: "reminder",
    createdAt: "2024-01-15T14:00:00Z",
    isRead: false
  }
]
```

## Browser Compatibility

- Modern browsers with ES6 support
- CSS variables support required (IE11 not supported)
- Local storage required for theme persistence
- Fetch API or Axios for HTTP requests

## Performance Considerations

### NotificationCenter Polling
- Polls every 30 seconds (configurable in component)
- Only active when component is rendered (in header)
- Can be optimized with WebSocket connection
- Debounces multiple rapid updates

### Memory Usage
- Notification list stored in component state
- Automatically cleared with "Clear All" button
- Recommended limit: 50 unread notifications per user

## Known Limitations

1. **Notification Polling**: Uses HTTP polling (30s interval) instead of WebSocket for real-time updates
   - Solution: Upgrade to WebSocket connection for instant notifications

2. **Reminder Time Precision**: Frontend uses datetime-local input
   - Browser interprets times in user's local timezone
   - Backend handles timezone conversion

3. **Mobile UI**: Modal and dropdown may need scrolling on small screens
   - Responsive design implemented
   - Further optimization possible for mobile-first

## Future Enhancements

1. **WebSocket Support**: Replace polling with WebSocket for real-time notifications
2. **Calendar View**: Add calendar component for viewing reminders
3. **Reminder History**: Display past reminders in a dedicated view
4. **Notification Sound**: Add audio notifications option
5. **Browser Notifications**: Use Notification API for desktop notifications
6. **Reminder Analytics**: Show reminder completion statistics
7. **Snooze Functionality**: UI for snoozing reminders in notification panel

## Troubleshooting

### Reminder Modal Not Showing
- Check that Clock icon button is visible in toolbar
- Verify ReminderModal component is imported
- Check browser console for errors

### Notifications Not Appearing
- Verify NotificationCenter is rendered in App.jsx
- Check network tab for polling requests to `/api/notifications`
- Verify user is logged in (token in localStorage)
- Check backend API is responding

### Styling Issues
- Verify CSS files are imported correctly
- Check theme-light/theme-dark classes on body element
- Clear browser cache if using old CSS versions
- Check CSS variables are defined in root/body

### Theme Not Switching
- Verify ThemeContext is providing theme value
- Check component uses `useTheme()` hook
- Verify theme selector in Header works
- Check localStorage has 'theme' key after switching

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ReminderModal.jsx (NEW)
│   │   ├── NotificationCenter.jsx (NEW)
│   │   ├── NoteEditor.jsx (UPDATED)
│   │   ├── Dashboard.jsx (UPDATED)
│   │   └── ...
│   ├── pages/
│   │   ├── CreateNote.jsx (UPDATED)
│   │   ├── EditNote.jsx (UPDATED)
│   │   └── ...
│   ├── api/
│   │   ├── notificationsApi.js (NEW)
│   │   ├── remindersApi.js (EXISTS)
│   │   └── ...
│   ├── styles/
│   │   ├── reminder.css (NEW)
│   │   ├── notificationCenter.css (NEW)
│   │   └── ...
│   ├── App.jsx (UPDATED)
│   └── ...
└── package.json
```

## Quick Start

1. **Import CSS files** in components where used
2. **Verify API endpoints** are accessible at `http://localhost:5000/api`
3. **Test reminder creation** by creating a new note
4. **Check notifications** in the notification center
5. **Verify styling** matches project's pastel theme

## Development Notes

### Adding to Existing Notes
When editing existing notes, reminder data is automatically loaded from the backend:
- Check `note.reminderDate` to determine if reminder exists
- Display existing reminder data in ReminderModal
- Allow user to modify or remove reminder

### Updating Reminder
To remove a reminder, pass `null` for `reminderDate` in update payload.

### Email Notifications
Ensure backend has email service configured:
- SMTP credentials in `.env`
- Email template customization in backend
- Frontend only controls notification method selection

## Support and Questions

For issues or questions:
1. Check backend logs for API errors
2. Verify network requests in browser DevTools
3. Check browser console for JavaScript errors
4. Review Git history for recent changes
5. Contact development team with error details
