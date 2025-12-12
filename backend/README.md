# Backend (myNotes) — Quick start

Prerequisites
- Node.js 18+ (or compatible)
- MongoDB running locally or a MongoDB Atlas cluster

Setup
1. Copy `.env.example` to `.env` and update values (especially `MONGO_URI` and `JWT_SECRET`).

2. Install dependencies and start:

```powershell
cd backend
npm install
npm start
```

Development with auto-reload (requires `nodemon`):

```powershell
cd backend
npm install --save-dev nodemon
npx nodemon server.js
```

Notes
- The server will only start after a successful MongoDB connection.
- API endpoints (examples):
  - `POST /api/users/register` — body: `{ name, email, password }`
  - `POST /api/users/login` — body: `{ email, password }`
  - `GET /api/notes` — Authorization: `Bearer <token>`
  - `POST /api/notes` — Authorization + body: `{ title, content, tags }`
  - `POST /api/notes/:id/emojis` — Authorization + body: `{ emoji }` → adds emoji to note metadata
  - `DELETE /api/notes/:id/emojis/:emoji` — Authorization → removes emoji from note metadata
  - Locked notes:
    - `GET /api/folders/locked` — ensure the default "Locked Notes" folder exists and return its metadata
    - `POST /api/folders/locked/password` — set the locked-folder password once (409 if already set)
    - `POST /api/folders/locked/verify` — verify the locked-folder password
    - `POST /api/notes/:id/lock` — move a note into the locked folder
    - Access locked folder contents via `GET /api/folders/:id?includeNotes=true` with header `x-folder-password: <password>`
  - `GET /api/emojis` — returns curated emoji categories for the picker
  - `GET /api/emojis/search?q=` — quick search over curated emoji list

- To use the frontend against this backend, set `REACT_APP_API_URL` in the frontend environment or run the frontend with the default `http://localhost:5000`.
