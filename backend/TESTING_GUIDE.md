# Lock Note Feature - Quick Start Testing Guide

## Prerequisites
- Backend server running on http://localhost:5000
- Valid JWT authentication token
- At least one existing note

## Step 1: Get Your Auth Token and Note ID

### Login to get token
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the token from response: `"token": "eyJhbGc..."`

### Get your notes
```bash
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Save a note ID from response: `"_id": "65abc123..."`

## Step 2: Test Lock Feature

### 1. Lock a note with password
```bash
curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lockType": "password",
    "password": "mysecret123"
  }'
```

**Expected Response:**
```json
{
  "message": "Note locked successfully",
  "note": {
    "_id": "...",
    "title": "Your Note Title",
    "content": "Your content",
    "isLocked": true,
    "lockType": "password"
  }
}
```

### 2. Fetch notes - verify content is hidden
```bash
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected for locked note:**
```json
{
  "_id": "...",
  "title": "Your Note Title",
  "content": null,  // ← Content hidden!
  "checklistItems": [],
  "isLocked": true,
  "lockType": "password"
}
```

### 3. Try to edit locked note (should fail)
```bash
curl -X PUT http://localhost:5000/api/notes/YOUR_NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trying to edit",
    "content": "New content"
  }'
```

**Expected Response (403):**
```json
{
  "message": "Cannot edit locked note. Please unlock it first."
}
```

### 4. Unlock the note with correct password
```bash
curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/unlock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "mysecret123"
  }'
```

**Expected Response:**
```json
{
  "message": "Note unlocked successfully",
  "note": {
    "_id": "...",
    "title": "Your Note Title",
    "content": "Your full content is visible now!",
    "isLocked": true,
    "lockType": "password"
  },
  "unlocked": true
}
```

### 5. Try unlocking with wrong password
```bash
curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/unlock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "wrongpassword"
  }'
```

**Expected Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

### 6. Remove the lock
```bash
curl -X DELETE http://localhost:5000/api/notes/YOUR_NOTE_ID/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "mysecret123"
  }'
```

**Expected Response:**
```json
{
  "message": "Note lock removed successfully",
  "note": {
    "_id": "...",
    "title": "Your Note Title",
    "content": "Your content",
    "isLocked": false,  // ← Lock removed!
    "lockType": null
  }
}
```

## Step 3: Test Biometric Lock (Optional)

### Lock with biometric
```bash
curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lockType": "biometric"
  }'
```

### Unlock with biometric verification
```bash
curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/unlock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "biometricVerified": true
  }'
```

## Common Test Scenarios

### Scenario 1: Locked note cannot be deleted
```bash
# Lock the note first
curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lockType":"password","password":"test123"}'

# Try to delete it (should fail with 403)
curl -X DELETE http://localhost:5000/api/notes/YOUR_NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Scenario 2: Locked checklist cannot be modified
```bash
# First convert to checklist and lock
curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/checklist/convert \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lockType":"password","password":"test123"}'

# Try to toggle an item (should fail with 403)
curl -X PATCH http://localhost:5000/api/notes/YOUR_NOTE_ID/checklist/toggle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemIndex": 0}'
```

### Scenario 3: Double-locking protection
```bash
# Lock once
curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lockType":"password","password":"test123"}'

# Try to lock again (should fail with 400)
curl -X POST http://localhost:5000/api/notes/YOUR_NOTE_ID/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lockType":"password","password":"newpass456"}'
```

## Verification Checklist

- [ ] Can lock a note with password
- [ ] Can lock a note with biometric
- [ ] Locked note content returns null in GET /api/notes
- [ ] Cannot edit locked note (403)
- [ ] Cannot delete locked note (403)
- [ ] Cannot convert locked note to checklist (403)
- [ ] Cannot modify locked checklist (403)
- [ ] Can unlock with correct password
- [ ] Cannot unlock with wrong password (401)
- [ ] Can remove lock with correct password
- [ ] Cannot lock an already locked note (400)
- [ ] lockPassword never appears in responses

## Troubleshooting

### Error: "Note not found"
- Check that the note ID is correct
- Verify the note belongs to your user account
- Ensure you're using the correct authentication token

### Error: "Invalid credentials"
- Double-check the password you're using
- Password is case-sensitive
- Make sure you're using the same password used to lock

### Error: "Cannot edit locked note"
- This is expected behavior! 
- Unlock the note first or remove the lock
- Then you can edit it

### Error: "lockType must be 'password' or 'biometric'"
- Check your lockType value
- Must be exactly "password" or "biometric" (case-sensitive)

## PowerShell Examples (Windows)

If using PowerShell, use these examples instead:

```powershell
# Lock a note
$token = "YOUR_TOKEN"
$noteId = "YOUR_NOTE_ID"
$body = @{
    lockType = "password"
    password = "mysecret123"
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:5000/api/notes/$noteId/lock" `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body $body

# Unlock a note
$body = @{ password = "mysecret123" } | ConvertTo-Json
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:5000/api/notes/$noteId/unlock" `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body $body
```

---

**Ready to test!** Start with Step 1 and work through each test scenario.
