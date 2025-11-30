# Note Lock Feature - Backend Documentation

## Overview
The lock note feature secures sensitive notes by requiring authentication before they can be viewed or edited. This prevents unauthorized access to confidential information like passwords, personal reflections, financial data, etc.

## Features
- **Password Protection**: Lock notes with a secure password (hashed using bcrypt)
- **Biometric Support**: Option for biometric authentication (implementation handled client-side)
- **Content Protection**: Locked notes return `null` content until unlocked
- **Operation Protection**: Prevents editing, deleting, or converting locked notes without unlocking
- **Secure Storage**: Passwords are hashed before storage; never returned to client

## Database Schema Changes

### Note Model (`models/noteModel.js`)
Added three new fields to the Note schema:

```javascript
{
  isLocked: { type: Boolean, default: false },
  lockPassword: { type: String, default: null },  // bcrypt hashed
  lockType: { type: String, enum: ['password', 'biometric', null], default: null }
}
```

## API Endpoints

### 1. Lock a Note
**POST** `/api/notes/:id/lock`

Locks a note with password or biometric authentication.

**Request Body:**
```json
{
  "lockType": "password",      // "password" or "biometric"
  "password": "your-password"  // Required only for password type
}
```

**Response (Success):**
```json
{
  "message": "Note locked successfully",
  "note": {
    "_id": "...",
    "title": "My Secret Note",
    "isLocked": true,
    "lockType": "password"
    // content and lockPassword hidden
  }
}
```

**Validation:**
- Password must be at least 4 characters
- lockType must be "password" or "biometric"
- Note cannot already be locked

---

### 2. Verify/Unlock a Note
**POST** `/api/notes/:id/unlock`

Verifies credentials and returns the full note content.

**Request Body (Password):**
```json
{
  "password": "your-password"
}
```

**Request Body (Biometric):**
```json
{
  "biometricVerified": true
}
```

**Response (Success):**
```json
{
  "message": "Note unlocked successfully",
  "note": {
    "_id": "...",
    "title": "My Secret Note",
    "content": "Secret content here",
    "isLocked": true,
    "lockType": "password"
  },
  "unlocked": true
}
```

**Response (Invalid Credentials):**
```json
{
  "message": "Invalid credentials"
}
```
Status: 401

---

### 3. Remove Lock from Note
**DELETE** `/api/notes/:id/lock`

Permanently removes the lock from a note after verifying credentials.

**Request Body:**
```json
{
  "password": "your-password"  // or "biometricVerified": true
}
```

**Response (Success):**
```json
{
  "message": "Note lock removed successfully",
  "note": {
    "_id": "...",
    "title": "My Secret Note",
    "content": "Content here",
    "isLocked": false,
    "lockType": null
  }
}
```

---

## Protected Operations

The following operations are **blocked** for locked notes and return a `403` error:

### 1. Update Note
**PUT** `/api/notes/:id`

**Error Response:**
```json
{
  "message": "Cannot edit locked note. Please unlock it first."
}
```

### 2. Delete Note
**DELETE** `/api/notes/:id`

**Error Response:**
```json
{
  "message": "Cannot delete locked note. Please unlock it first."
}
```

### 3. Convert to Checklist
**POST** `/api/notes/:id/checklist/convert`

**Error Response:**
```json
{
  "message": "Cannot convert locked note. Please unlock it first."
}
```

### 4. Convert to Regular Note
**POST** `/api/notes/:id/checklist/revert`

**Error Response:**
```json
{
  "message": "Cannot convert locked note. Please unlock it first."
}
```

### 5. Update Checklist Items
**PUT** `/api/notes/:id/checklist/items`

**Error Response:**
```json
{
  "message": "Cannot update locked note. Please unlock it first."
}
```

### 6. Toggle Checklist Item
**PATCH** `/api/notes/:id/checklist/toggle`

**Error Response:**
```json
{
  "message": "Cannot modify locked note. Please unlock it first."
}
```

---

## Content Protection

### Get All Notes
**GET** `/api/notes`

When fetching notes, locked notes automatically have their sensitive content removed:

**Unlocked Note:**
```json
{
  "_id": "...",
  "title": "Regular Note",
  "content": "Full content visible",
  "isLocked": false
}
```

**Locked Note:**
```json
{
  "_id": "...",
  "title": "Secret Note",
  "content": null,              // Hidden
  "checklistItems": [],         // Hidden
  "isLocked": true,
  "lockType": "password"
}
```

---

## Security Considerations

### Password Hashing
- Passwords are hashed using **bcryptjs** with salt rounds of 10
- Original passwords are never stored in the database
- Password hashes are never returned to the client

### Biometric Authentication
- Biometric verification is performed on the client side
- Server accepts a `biometricVerified` boolean flag
- In production, this should be enhanced with:
  - Cryptographic signatures
  - Token-based verification
  - Time-limited authentication tokens

### Access Control
- All lock operations require authentication via JWT token
- Users can only lock/unlock their own notes
- Note ownership is verified on every request

---

## Implementation Details

### Controller Functions (`controllers/noteController.js`)

1. **setNoteLock**: Creates a lock on a note
2. **verifyNoteLock**: Verifies credentials and returns full note
3. **removeNoteLock**: Removes lock after verification
4. **getNotes**: Modified to filter locked content
5. **updateNote**: Added lock check before allowing updates
6. **deleteNote**: Added lock check before allowing deletion
7. **convertToChecklist**: Added lock check
8. **convertToRegularNote**: Added lock check
9. **updateChecklistItems**: Added lock check
10. **toggleChecklistItem**: Added lock check

### Routes (`routes/notes.js`)
```javascript
router.post("/:id/lock", protect, setNoteLock);
router.post("/:id/unlock", protect, verifyNoteLock);
router.delete("/:id/lock", protect, removeNoteLock);
```

---

## Frontend Integration Guide

### Locking a Note
```javascript
const lockNote = async (noteId, password) => {
  const response = await fetch(`/api/notes/${noteId}/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      lockType: 'password',
      password: password
    })
  });
  return await response.json();
};
```

### Unlocking a Note
```javascript
const unlockNote = async (noteId, password) => {
  const response = await fetch(`/api/notes/${noteId}/unlock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      password: password
    })
  });
  return await response.json();
};
```

### Displaying Locked Notes
```javascript
// In your notes list component
{notes.map(note => (
  <NoteItem key={note._id}>
    <h3>{note.title}</h3>
    {note.isLocked ? (
      <div className="locked-indicator">
        🔒 This note is locked
        <button onClick={() => handleUnlock(note._id)}>
          Unlock
        </button>
      </div>
    ) : (
      <div className="note-content">
        {note.content}
      </div>
    )}
  </NoteItem>
))}
```

---

## Testing Examples

### Test Lock with Password
```bash
curl -X POST http://localhost:5000/api/notes/NOTE_ID/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lockType": "password",
    "password": "mysecret123"
  }'
```

### Test Unlock
```bash
curl -X POST http://localhost:5000/api/notes/NOTE_ID/unlock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "mysecret123"
  }'
```

### Test Protected Operation (Should Fail)
```bash
curl -X PUT http://localhost:5000/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trying to edit locked note"
  }'
# Expected: 403 "Cannot edit locked note. Please unlock it first."
```

---

## Error Codes

| Status | Message | Cause |
|--------|---------|-------|
| 400 | "lockType must be 'password' or 'biometric'" | Invalid lock type |
| 400 | "Password must be at least 4 characters" | Password too short |
| 400 | "Note is already locked" | Attempting to lock an already locked note |
| 400 | "Note is not locked" | Attempting to unlock an unlocked note |
| 401 | "Invalid credentials" | Wrong password or biometric verification failed |
| 403 | "Cannot edit locked note. Please unlock it first." | Attempting to modify locked note |
| 404 | "Note not found" | Invalid note ID or unauthorized access |
| 500 | "Server error" | Internal server error |

---

## Future Enhancements

1. **Time-based Unlocking**: Auto-lock notes after a period of inactivity
2. **Lock History**: Track when notes are locked/unlocked
3. **Multiple Authentication Methods**: Allow both password and biometric on same note
4. **Shared Locked Notes**: Allow authorized users to access locked notes
5. **Password Recovery**: Security questions or backup methods
6. **Enhanced Biometric Security**: Server-side verification with cryptographic signatures

---

## Migration Notes

For existing notes in the database:
- All existing notes will have `isLocked: false` by default
- No migration script is needed as new fields have default values
- Users can start locking notes immediately after deployment
