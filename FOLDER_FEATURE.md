# Folder/File Grouping Feature

## Overview
This feature adds folder/category management to the myNotes web application, allowing users to organize their notes into folders.

## Features

### Backend
- **Folders Table**: New database table to store user folders
- **Folder CRUD Operations**: Complete REST API for folder management
  - `GET /api/folders` - Get all folders for the logged-in user
  - `POST /api/folders` - Create a new folder
  - `GET /api/folders/:id` - Get a specific folder
  - `PUT /api/folders/:id` - Update a folder name
  - `DELETE /api/folders/:id` - Delete a folder
  - `GET /api/folders/:id/notes-count` - Get notes count for a folder
- **Enhanced Notes API**: Notes API updated to support folder assignment
  - Notes can be assigned to folders via `folderId` parameter
  - Filter notes by folder using query parameter `?folderId=<id>`
  - Filter unassigned notes using `?folderId=null` or `?folderId=unassigned`

### Frontend
- **Folder Sidebar**: Left sidebar showing all folders with quick navigation
  - View all notes
  - View unassigned notes
  - View notes by folder
  - Create/edit/delete folders inline
- **Enhanced Notes List**: Notes display with folder support
  - Create notes and assign to folders
  - Edit notes and change folder assignment
  - Visual indication of note's folder
  - Filter notes by selected folder
- **Responsive Design**: Mobile-friendly layout that adapts to smaller screens

## Database Schema

### Folders Table
```sql
CREATE TABLE Folders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    userId INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
```

### Updated Notes Table
```sql
CREATE TABLE Notes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(100),
    content NVARCHAR(MAX),
    userId INT NOT NULL,
    folderId INT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (folderId) REFERENCES Folders(id) ON DELETE SET NULL
);
```

## Migration

To add folder support to an existing database, run the migration script:

```bash
sqlcmd -S localhost -U sa -P YourPassword -d NotesApp -i SQLQuery_Migration.sql
```

Or using SQL Server Management Studio, execute `SQLQuery_Migration.sql`.

## API Documentation

### Folders API

#### Get All Folders
```http
GET /api/folders
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": 1,
    "name": "Work",
    "userId": 1,
    "createdAt": "2025-11-16T12:00:00.000Z"
  }
]
```

#### Create Folder
```http
POST /api/folders
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Personal"
}
```

#### Update Folder
```http
PUT /api/folders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete Folder
```http
DELETE /api/folders/:id
Authorization: Bearer <token>
```

### Enhanced Notes API

#### Get Notes with Folder Filter
```http
GET /api/notes?folderId=1
Authorization: Bearer <token>
```

#### Create Note with Folder
```http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Note",
  "content": "Note content",
  "folderId": 1
}
```

## Usage

1. **Creating Folders**: Click the "+" button in the folder sidebar
2. **Organizing Notes**: When creating or editing a note, select a folder from the dropdown
3. **Filtering Notes**: Click on a folder in the sidebar to view only notes in that folder
4. **Managing Folders**: Hover over a folder to see edit and delete options
5. **Unassigned Notes**: Click "Unassigned" to view notes without a folder

## Technical Details

### Components
- `FolderSidebar.jsx` - Folder navigation and management
- `NotesList.jsx` - Note display and management with folder support
- `Dashboard.jsx` - Main layout combining sidebar and notes list

### Models
- `folderModel.js` - Database operations for folders

### Controllers
- `folderController.js` - Business logic for folder operations
- `noteController.js` - Enhanced to support folder assignment

### Routes
- `folders.js` - Folder API endpoints

## Future Enhancements
- Nested folders (subfolders)
- Folder colors and icons
- Drag and drop notes between folders
- Folder sharing between users
- Sort folders alphabetically or by date
