# Favourite Notes Feature

## Overview
This feature allows users to mark notes as favourites and view them in a dedicated page. Favourite notes are always accessible by default through the `/favourites` route.

## Database Changes

### Schema Update
Added `isFavourite` column to the `Notes` table:
- Type: `BIT`
- Default: `0` (false)

### Migration
A migration script is available at `backend/db/addFavouriteColumn.sql` to add the column to existing databases.

## Backend API Endpoints

### Get Favourite Notes
- **Endpoint**: `GET /api/notes/favourites`
- **Authentication**: Required (Bearer token)
- **Description**: Returns all notes marked as favourite for the logged-in user
- **Response**: Array of note objects with `isFavourite: true`

### Toggle Favourite Status
- **Endpoint**: `PATCH /api/notes/:id/favourite`
- **Authentication**: Required (Bearer token)
- **Description**: Toggles the favourite status of a note
- **Parameters**: 
  - `id` (path parameter): Note ID
- **Response**: 
  ```json
  {
    "message": "⭐ Note added to favourites!" or "Note removed from favourites",
    "isFavourite": true or false
  }
  ```

## Frontend Components

### FavouriteNotesPage
- **Route**: `/favourites`
- **Description**: Displays only favourite notes
- **Features**:
  - Shows all notes marked as favourite
  - Allows toggling favourite status (removes from list when unfavourited)
  - Navigation to all notes and create note pages

### AllNotesPage
- **Route**: `/notes`
- **Description**: Displays all notes with favourite toggle
- **Features**:
  - Shows all notes for the user
  - Star icon to mark/unmark favourites
  - Navigation to favourites and create note pages

### Updated Components
- **NotesList**: Now accepts `onToggleFavourite` callback and displays star icons
- **CreateNote**: Added navigation buttons to access favourites
- **App.jsx**: Added route for `/favourites`

## Usage

1. **Mark a note as favourite**:
   - Navigate to `/notes` to view all notes
   - Click the star icon (☆) next to any note
   - The star will fill (⭐) to indicate the note is now a favourite

2. **View favourite notes**:
   - Navigate to `/favourites` or click the "⭐ Favourites" button
   - All favourite notes will be displayed
   - This page is always accessible by default

3. **Remove from favourites**:
   - Click the filled star (⭐) on any favourite note
   - The note will be removed from favourites (star becomes ☆)

## Technical Details

- Favourite status is stored in the database and persists across sessions
- The feature is user-specific - each user has their own favourite notes
- The UI updates immediately when toggling favourite status
- All operations require authentication
