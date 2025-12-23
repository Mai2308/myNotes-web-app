# myNotes — Full‑Stack Notes App

Modern notes, reminders, flashcards, and folder organization with a secure locked folder. Monorepo with React front end and Node/Express API backed by MongoDB.

## Features
- Authentication: register/login with JWT.
- Notes: create, edit, delete; HTML content sanitization; tags.
- Sort & Search: newest/oldest/title/favorites; keyword search across title/content/tags.
- Favorites: toggle favorite and auto‑copy into a default "Favorites" folder.
- Checklists: convert note ⇄ checklist, manage items, toggle completion.
- Highlights: add/update/delete/clear per note.
- Folders: nested tree, rename/move/delete with cycle prevention; default folders ensured.
- Locked Folder: special protected folder with password verification for access.
- Folder Protection: set/remove password on any folder (except locked folder removal).
- Emojis: curated emoji catalog + search; add/remove emojis on notes.
- Reminders & Deadlines: one‑time or recurring (daily/weekly/monthly/yearly), snooze, overdue detection.
- In‑App Notifications: reminder events and manual tests; mark as read, clear.
- Flashcards: CRUD, spaced repetition scheduling, due for review.
- Theming: dark/light theme in the frontend.

## Tech Stack
- Frontend: React, CSS, Axios
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Tests: Vitest (+ jsdom for frontend)
- Deploy: Vercel (frontend), Railway (backend)

## Live Deployment 🚀

- **Frontend:** https://my-notes-web-app-seven.vercel.app
- **Backend API:** https://mynotes-web-app-production.up.railway.app
- **Backend API Docs:** https://mynotes-web-app-production.up.railway.app/ (health check)

## Repository Structure
```
myNotes-web-app/
├─ backend/         # Express API, models, routes, tests
├─ frontend/        # React app
├─ api/             # Alternative API folder (for certain deploy targets)
├─ README.md        # This file
├─ DEPLOYMENT_SETUP.md
├─ VERCEL_ENV_SETUP.md
├─ vercel.json
```

## Getting Started

### Try the Live App
Simply visit: **https://my-notes-web-app-seven.vercel.app** and sign up!

### Or run locally:

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git, a code editor, optional Postman

### 1) Clone and install
```bash
git clone <this-repo>
cd myNotes-web-app

# install backend
cd backend && npm install

# install frontend
cd ../frontend && npm install
```

### 2) Configure environment
Create `backend/.env` with:
```
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<strong_random_secret>
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

Create `frontend/.env.local` with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

For Vercel deployment variables, see [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md).

### 3) Run locally
Backend (port 5000):
```bash
cd backend
npm start
```

Frontend (port 3000):
```bash
cd frontend
npm start
```

## API Overview (quick reference)

Auth
- `POST /api/users/register` — `{ name, email, password }`
- `POST /api/users/login` — `{ email, password }`

Notes
- `GET /api/notes?folderId=<id>&sort=<newest|oldest|title_asc|title_desc|favorite>`
- `GET /api/notes/search?q=<keyword>&folderId=<id|null>`
- `POST /api/notes` — `{ title, content, tags, folderId?, reminderDate?, isRecurring?, recurringPattern?, notificationMethods?, deadline? }`
- `PUT /api/notes/:id`
- `PUT /api/notes/:id/move` — `{ folderId }`
- `POST /api/notes/:id/lock` — move note into locked folder
- `PUT /api/notes/:id/favorite` — toggle favorite (creates synced copy in Favorites)
- Checklist: `POST /api/notes/:id/checklist/convert`, `POST /api/notes/:id/checklist/revert`,
  `PUT /api/notes/:id/checklist/items`, `PATCH /api/notes/:id/checklist/toggle`
- Emojis: `POST /api/notes/:id/emojis` (add), `DELETE /api/notes/:id/emojis/:emoji` (remove)
- Highlights: `GET/POST /api/notes/:id/highlights`, `PUT /api/notes/:noteId/highlights/:highlightId`,
  `DELETE /api/notes/:noteId/highlights/:highlightId`, `DELETE /api/notes/:id/highlights/clear`
- `DELETE /api/notes/:id`

Folders
- `GET /api/folders` — ensures defaults (Favorites + Locked) and returns user folders
- `GET /api/folders/locked` — returns locked folder metadata
- `POST /api/folders/locked/password` — set locked folder password (once)
- `POST /api/folders/locked/verify` — verify locked folder password
- `GET /api/folders/:id?includeNotes=true` — requires `x-folder-password` header if protected
- `POST /api/folders` — create
- `PATCH /api/folders/:id` — rename/move (cycle protection)
- `DELETE /api/folders/:id` — reparent children; move notes to root
- Protect: `POST /api/folders/:id/protect`, `DELETE /api/folders/:id/protect`

Reminders & Notifications
- Reminders: `POST /api/reminders/:id/reminder`, `DELETE /api/reminders/:id/reminder`,
  `GET /api/reminders/upcoming`, `GET /api/reminders/overdue`,
  `POST /api/reminders/:id/reminder/acknowledge`, `POST /api/reminders/:id/reminder/snooze`
- Notifications: `GET /api/notifications`, `PUT /api/notifications/:notificationId/read`,
  `POST /api/notifications/check`, `POST /api/notifications/test`, `GET /api/notifications/debug`, `DELETE /api/notifications`

Emojis
- `GET /api/emojis` — curated catalog categories
- `GET /api/emojis/search?q=` — simple search

Flashcards
- `GET /api/flashcards` (+ `?noteId=` filter)
- `GET /api/flashcards/due` — due for review
- `POST /api/flashcards` — `{ front, back, noteId?, tags? }`
- `PUT /api/flashcards/:id`
- `DELETE /api/flashcards/:id`
- `POST /api/flashcards/:id/review` — `{ correct: boolean }` (spaced repetition)

For details and examples, see [backend/README.md](backend/README.md).

## Testing
Run unit tests with coverage:
```bash
cd backend && npm run test:ci
cd ../frontend && npm run test:ci
```
CI status and configuration are documented in [CI_VERIFICATION_REPORT.md](CI_VERIFICATION_REPORT.md).

## Deployment Guide

### Backend Deployment (Railway)
The backend is deployed on Railway. For detailed setup instructions, see [RAILWAY_QUICK_START.md](RAILWAY_QUICK_START.md).

- **Service URL:** https://mynotes-web-app-production.up.railway.app
- **Database:** MongoDB Atlas
- **Environment Variables:** Auto-configured during deployment
- **Auto-deployment:** Enabled on GitHub push to `main`

### Frontend Deployment (Vercel)
The frontend is deployed on Vercel and automatically redeploys on GitHub push.

- **Live URL:** https://my-notes-web-app-seven.vercel.app
- **Environment Variable:** `REACT_APP_API_URL=https://mynotes-web-app-production.up.railway.app`

### CI/CD Pipeline
All tests run automatically on every push via GitHub Actions. See [CI_VERIFICATION_REPORT.md](CI_VERIFICATION_REPORT.md) for details.


## Security Notes
- Use a strong `JWT_SECRET` in production.
- Restrict `CORS_ORIGIN` to your actual frontend domain.
- Rotate MongoDB credentials periodically.
