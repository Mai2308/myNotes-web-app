# myNotes-web-app

A web application for creating and managing personal notes with rich text editing capabilities.

## Features

- **User Authentication**: Secure login and signup with JWT tokens
- **Rich Text Editor**: Create notes with formatting, colors, and styles
- **Note Management**: Create, read, update, and delete notes
- **Search Functionality**: Search notes by title
- **Favourite Notes**: Mark notes as favourites and access them in a dedicated page (always available by default)
- **Dark/Light Mode**: Toggle between themes

## New: Favourite Notes Feature

Users can now mark notes as favourites and access them through a dedicated page at `/favourites`. See [FAVOURITE_NOTES_FEATURE.md](FAVOURITE_NOTES_FEATURE.md) for detailed documentation.

### Quick Start with Favourites:
1. Navigate to `/notes` to view all notes
2. Click the star icon (☆) to mark a note as favourite
3. Access favourite notes anytime at `/favourites`

## Tech Stack

- **Frontend**: React, React Router
- **Backend**: Node.js, Express
- **Database**: Microsoft SQL Server
- **Authentication**: JWT (JSON Web Tokens)

## Setup

See individual README files in the `frontend` and `backend` directories for setup instructions.
