
## Features

### 1. Lock Types
- **Password Lock**: Secure notes with a password (minimum 4 characters)
- **Biometric Lock**: Simulate biometric authentication (fingerprint/face ID)

### 2. Automatic Folder Management
When a note is locked:
- The note is automatically moved to the "Locked Notes" folder
- The original folder location is preserved in `originalFolderId` field
- The "Locked Notes" folder is created automatically if it doesn't exist

When a note is unlocked:
- The note is automatically restored to its original folder
- The `originalFolderId` is cleared

### 3. Content Protection
- Locked notes display only metadata (title, timestamps) in the notes list
- Content is replaced with "🔒 This note is locked"
- Edit and delete operations require unlocking first

## Backend Implementation

### Database Schema Changes

#### Note Model (`models/noteModel.js`)
```javascript
{
  isLocked: Boolean,           // Whether the note is locked
  lockPassword: String,        // Hashed password (bcrypt)
  lockType: String,           // "password" or "biometric"
  originalFolderId: ObjectId   // Stores folder before locking
}
```

### API Endpoints

#### 1. Lock a Note
**POST** `/api/notes/:id/lock`

Request body:
```json
{
  "lockType": "password",  // or "biometric"
  "password": "secretpass" // required for password type
}
```

Response:
```json
{
  "message": "Note locked successfully",
  "note": { /* updated note with isLocked: true */ }
}
```

Features:
- Creates "Locked Notes" folder if it doesn't exist
- Stores original folder ID in `originalFolderId`
- Moves note to "Locked Notes" folder
- Hashes password with bcrypt (salt rounds: 10)

#### 2. Unlock a Note
**POST** `/api/notes/:id/unlock`

Request body:
```json
{
  "password": "secretpass",     // required for password type
  "biometricVerified": true     // required for biometric type
}
```

Response:
```json
{
  "message": "Note unlocked successfully",
  "note": { /* full note with content */ }
}
```

Features:
- Verifies credentials (password or biometric)
- Returns full note content including locked fields
- Note remains locked until lock is removed

#### 3. Remove Lock
**DELETE** `/api/notes/:id/lock`

Request body:
```json
{
  "password": "secretpass",     // required for password type
  "biometricVerified": true     // required for biometric type
}
```

Response:
```json
{
  "message": "Lock removed successfully",
  "note": { /* note with lock removed */ }
}
```

Features:
- Verifies credentials before removing lock
- Restores note to original folder (from `originalFolderId`)
- Clears all lock-related fields
- Clears `originalFolderId`

### Controller Logic (`controllers/noteController.js`)

#### setNoteLock
```javascript
// 1. Find or create "Locked Notes" folder
const lockedFolder = await Folder.findOneAndUpdate(
  { userId, name: "Locked Notes", isDefault: true },
  { userId, name: "Locked Notes", isDefault: true, parentId: null },
  { upsert: true, new: true }
);

// 2. Store original folder and move to Locked Notes
note.originalFolderId = note.folderId;
note.folderId = lockedFolder._id;
note.isLocked = true;
// ... set lock fields
```

#### removeNoteLock
```javascript
// 1. Restore to original folder
if (note.originalFolderId) {
  note.folderId = note.originalFolderId;
  note.originalFolderId = null;
}

// 2. Clear lock fields
note.isLocked = false;
note.lockPassword = undefined;
note.lockType = undefined;
```

#### listFolders (`controllers/folderController.js`)
```javascript
// Ensure default folders exist
const defaults = ["Favorites", "Locked Notes"];
for (const name of defaults) {
  await Folder.findOneAndUpdate(
    { userId, name, isDefault: true },
    { userId, name, isDefault: true, parentId: null },
    { upsert: true, new: true }
  );
}
```

## Frontend Implementation

### Components

#### 1. LockNoteModal (`components/LockNoteModal.jsx`)
- Modal for locking notes
- Lock type selection (password/biometric)
- Password input with confirmation
- Validation: min 4 characters, passwords must match

#### 2. UnlockNoteModal (`components/UnlockNoteModal.jsx`)
- Modal for unlocking notes
- Different UI for password vs biometric
- Password input with show/hide toggle
- Biometric simulation button

#### 3. Dashboard (`components/Dashboard.jsx`)
- Lock/unlock button in note actions
- Locked note indicator in note cards
- Remove lock option
- Content protection for locked notes
- Lock status reflected in folder tree

#### 4. FolderTree (`components/FolderTree.jsx`)
- Special styling for "Locked Notes" folder
- Lock icon (from lucide-react)
- Red color highlighting
- Bold font weight
- Non-editable/deletable (default folder)

### API Functions (`api/notesApi.js`)

```javascript
// Lock a note
export const lockNote = async (noteId, lockType, password) => {
  const response = await fetch(`${API_URL}/notes/${noteId}/lock`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ lockType, password }),
  });
  return response.json();
};

// Unlock a note
export const unlockNote = async (noteId, password, biometricVerified) => {
  const response = await fetch(`${API_URL}/notes/${noteId}/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password, biometricVerified }),
  });
  return response.json();
};

// Remove lock
export const removeLock = async (noteId, password, biometricVerified) => {
  const response = await fetch(`${API_URL}/notes/${noteId}/lock`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password, biometricVerified }),
  });
  return response.json();
};
```

### UI/UX Features

1. **Lock Button**
   - Appears when note is unlocked
   - Lock icon from lucide-react
   - Opens LockNoteModal

2. **Unlock Button**
   - Appears when note is locked
   - Unlock icon from lucide-react
   - Opens UnlockNoteModal

3. **Remove Lock Button**
   - Appears when note is unlocked (temporary state)
   - LockOpen icon from lucide-react
   - Requires authentication

4. **Locked Content Display**
   - Title and metadata visible
   - Content replaced with "🔒 This note is locked"
   - "Unlock to view content" message

5. **Folder Tree**
   - "Locked Notes" folder with lock icon
   - Red color for visibility
   - Cannot be renamed or deleted
   - Automatically created when needed

## Security Features

### Password Protection
- Minimum 4 character length
- Passwords hashed with bcrypt
- Salt rounds: 10
- Never stored in plain text
- Never returned in API responses

### Content Protection
- Locked note content not included in list responses
- Full content only returned after successful unlock
- Edit operations blocked on locked notes
- Delete operations blocked on locked notes

### Biometric Protection
- Simulated in current implementation
- Requires explicit verification flag
- Can be integrated with device biometric APIs

## Testing Checklist

### Backend Testing
- [ ] Lock note with password
- [ ] Lock note with biometric
- [ ] Unlock note with correct password
- [ ] Unlock note with incorrect password (should fail)
- [ ] Remove lock with correct credentials
- [ ] Remove lock with incorrect credentials (should fail)
- [ ] Verify note moves to "Locked Notes" folder on lock
- [ ] Verify note returns to original folder on unlock
- [ ] Verify "Locked Notes" folder is created automatically
- [ ] Verify locked content is not returned in list

### Frontend Testing
- [ ] Open lock modal and select password
- [ ] Open lock modal and select biometric
- [ ] Password validation (min 4 chars)
- [ ] Password confirmation matching
- [ ] Unlock with password
- [ ] Unlock with biometric
- [ ] Remove lock
- [ ] Locked notes show protected content
- [ ] Edit/delete disabled on locked notes
- [ ] "Locked Notes" folder appears with lock icon
- [ ] Notes appear in "Locked Notes" folder when locked
- [ ] Notes return to original folder when unlocked

## Debug Logging

### Backend Logs
```javascript
console.log("🔒 Lock request:", { noteId, lockType });
console.log("🔍 Note found:", note ? "Yes" : "No");
console.log("📁 Locked folder:", lockedFolder._id);
console.log("📦 Original folder stored:", note.originalFolderId);
```

### Frontend Logs
```javascript
console.log("Locking note:", noteId, "Type:", lockType);
console.log("Note locked successfully:", updatedNote);
console.log("Unlocking note:", noteId);
console.log("Note unlocked:", unlockedNote);
```

## Future Enhancements

1. **Actual Biometric Integration**
   - Integrate with Web Authentication API
   - Support fingerprint and face recognition
   - Device-specific enrollment

2. **Password Recovery**
   - Security questions
   - Email recovery
   - Admin override

3. **Lock History**
   - Track lock/unlock events
   - Audit log for security
   - Failed unlock attempts

4. **Bulk Operations**
   - Lock multiple notes at once
   - Unlock multiple notes
   - Batch folder protection

5. **Advanced Security**
   - Note expiration
   - Auto-lock after timeout
   - Two-factor authentication

## Troubleshooting

### "Note not found" Error
- Check that note ID is valid
- Verify user owns the note
- Check authentication token
- Review backend logs for details

### Lock Not Applied
- Verify password meets requirements (min 4 chars)
- Check network requests in browser DevTools
- Review backend response for errors

### Folder Not Created
- Check folderController.js listFolders function
- Verify MongoDB connection
- Check user permissions

### Notes Not Moving
- Verify originalFolderId field is set
- Check noteController.js setNoteLock function
- Review database for proper folder IDs
