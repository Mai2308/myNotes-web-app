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

- To use the frontend against this backend, set `REACT_APP_API_URL` in the frontend environment or run the frontend with the default `http://localhost:5000`.
