# Testing Guide for myNotes Web App

This guide helps you test all features of the myNotes application.

## Prerequisites

Ensure you have:
- Docker and Docker Compose installed
- Ports 3000, 5000, and 1433 available

## Quick Start

1. **Start the Application**
   ```bash
   docker-compose up -d --build
   ```

2. **Wait for Services**
   - SQL Server: ~30 seconds to initialize
   - Backend: ~10 seconds after SQL Server is ready
   - Frontend: ~5 seconds

3. **Access the Application**
   - Open browser: http://localhost:3000

## Test Cases

### 1. User Registration
- Navigate to http://localhost:3000
- Click "Sign Up" link
- Fill in:
  - Name: Test User
  - Email: test@example.com
  - Password: Test123!
- Click "Sign Up"
- Expected: Redirect to login page

### 2. User Login
- Enter credentials:
  - Email: test@example.com
  - Password: Test123!
- Click "Log In"
- Expected: Redirect to create note page

### 3. Create Note
- You should see the rich text editor
- Test the following features:
  
  **Text Formatting:**
  - Type some text
  - Select text and click **B** (Bold)
  - Select text and click *I* (Italic)
  - Select text and click U (Underline)
  
  **Font Selection:**
  - Select text
  - Choose font from dropdown (Arial, Georgia, etc.)
  
  **Colors:**
  - Select text
  - Click first color picker (text color)
  - Choose a color
  - Select text
  - Click second color picker (highlight)
  - Choose a color
  - Click third color picker (background)
  - Choose a color for note background
  
  **Title:**
  - Enter a title in the "Title" field
  
- Click "Create Note"
- Expected: Redirect to notes list with your new note

### 4. View Notes
- Click on "Notes" link or navigate to /notes
- Expected: See list of all your notes with:
  - Title
  - Formatted content (with your styles)
  - Created date
  - Delete button

### 5. Search Notes
- Create several notes with different titles
- Navigate to notes list
- Look for search functionality (if implemented)
- Test searching by title keywords

### 6. Delete Note
- Navigate to notes list
- Click "Delete" button on a note
- Confirm deletion
- Expected: Note removed from list

### 7. Dark/Light Theme
- Look for theme toggle button (sun/moon icon)
- Click to toggle between dark and light modes
- Expected: UI changes theme instantly
- Theme preference saved in localStorage

### 8. Draft Functionality
- Start creating a note
- Click "💾 Save Draft"
- Expected: "Draft saved" message
- Refresh page or navigate away
- Click "📂 Load Draft"
- Expected: Your draft content restored

### 9. Undo/Redo
- Type some text in editor
- Make formatting changes
- Click ↩ (Undo) button
- Expected: Last change reverted
- Click ↪ (Redo) button
- Expected: Change reapplied

### 10. Session Persistence
- Login and create notes
- Close browser completely
- Reopen browser
- Navigate to http://localhost:3000
- Expected: Still logged in (token in localStorage)
- Can view and manage notes

## API Testing

You can also test the API directly using curl:

### Register User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test","email":"api@test.com","password":"Test123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"Test123"}'
```
Save the token from response.

### Create Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"API Note","content":"<p>Created via API</p>"}'
```

### Get Notes
```bash
curl http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Notes
```bash
curl "http://localhost:5000/api/notes/search?q=API" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete Note
```bash
curl -X DELETE http://localhost:5000/api/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues

### Database Connection Failed
- Wait longer for SQL Server to initialize
- Check logs: `docker-compose logs sqlserver`
- Verify password in docker-compose.yml matches backend config

### Frontend Can't Connect to Backend
- Check backend is running: `docker-compose logs backend`
- Verify backend is on port 5000: `curl http://localhost:5000`
- Check nginx configuration in frontend

### Port Already in Use
```bash
# Stop all containers
docker-compose down

# Check what's using the ports
lsof -i :3000
lsof -i :5000
lsof -i :1433

# Kill the process or change ports in docker-compose.yml
```

## Logs

View logs for debugging:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f sqlserver
```

## Cleanup

To stop and remove all containers:

```bash
docker-compose down

# To also remove volumes (database data):
docker-compose down -v
```

## Security Notes

1. **Default Credentials**: Change the SA_PASSWORD in production
2. **JWT Secret**: Change JWT_SECRET in production
3. **HTTPS**: Use HTTPS in production with proper SSL certificates
4. **CORS**: Configure CORS properly for your domain

## Success Criteria

✅ User can sign up and login  
✅ User can create notes with rich formatting  
✅ User can view list of all notes  
✅ User can delete notes  
✅ Notes are saved in SQL Server database  
✅ Authentication works with JWT tokens  
✅ Theme toggle works  
✅ Draft save/load works  
✅ All formatting features work (bold, italic, colors, fonts)  
✅ Responsive design works on mobile and desktop
