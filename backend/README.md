# Backend (myNotes) — Quick start

Prerequisites
- Node.js 18+ (or compatible)
- MongoDB running locally or a MongoDB Atlas cluster

Setup
1. Copy `.env.example` to `.env` and update values (especially `MONGO_URI` and `JWT_SECRET`).
2. For email notifications, configure SMTP settings (see `.env.example` for Gmail, SendGrid, Office365, etc.).

3. Install dependencies and start:

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

Features
- User authentication with JWT
- Note CRUD operations with folder organization
- Password-protected folders
- Favorites/bookmarks system
- Checklist notes
- **NEW: Reminders & Deadlines** with recurring options (daily, weekly, monthly, yearly)
- **NEW: Email & in-app notifications**
- **NEW: Background scheduler** for automatic reminder checking

Notes
- The server will only start after a successful MongoDB connection.
- The reminder scheduler automatically starts on server boot and checks every 60 seconds.
- Email service initializes if SMTP credentials are configured.
- API endpoints (examples):
  - `POST /api/users/register` — body: `{ name, email, password }`
  - `POST /api/users/login` — body: `{ email, password }`
  - `GET /api/notes` — Authorization: `Bearer <token>`
  - `POST /api/notes` — Authorization + body: `{ title, content, tags, reminder }`
  - `POST /api/reminders` — Create a reminder for a note
  - `GET /api/reminders` — Get all user reminders
  - `GET /api/reminders/due` — Get due reminders
  - `GET /api/notifications` — Get user notifications
  - `POST /api/notes/:id/emojis` — Authorization + body: `{ emoji }` → adds emoji to note metadata
  - `DELETE /api/notes/:id/emojis/:emoji` — Authorization → removes emoji from note metadata
  - `GET /api/emojis` — returns curated emoji categories for the picker
  - `GET /api/emojis/search?q=` — quick search over curated emoji list

For detailed reminder/notification setup and API reference, see [REMINDERS_FEATURE.md](./REMINDERS_FEATURE.md)

- To use the frontend against this backend, set `REACT_APP_API_URL` in the frontend environment or run the frontend with the default `http://localhost:5000`.
