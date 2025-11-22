# myNotes-web-app

A full-stack web application for creating and managing notes with rich text editing capabilities.

## Features

- User authentication (register/login)
- Create, read, update, and delete notes
- Rich text editor with formatting options
- Search functionality
- Dark/Light theme toggle
- Persistent storage with SQL Server database

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Rich text editor with contentEditable
- Nginx (for production deployment)

### Backend
- Node.js with Express
- SQL Server (MSSQL)
- JWT authentication
- bcryptjs for password hashing
- sanitize-html for content sanitization

## Prerequisites

- Docker and Docker Compose (recommended)
- OR Node.js 18+ and SQL Server (for local development)

## Running with Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/Mai2308/myNotes-web-app.git
cd myNotes-web-app
```

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - SQL Server: localhost:1433

4. Stop the services:
```bash
docker-compose down
```

## Local Development Setup

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
SQL_SERVER=localhost
SQL_USER=sa
SQL_PASSWORD=YourStrong!Pass123
SQL_DATABASE=NotesDB
JWT_SECRET=your_jwt_secret_here
```

4. Start the backend server:
```bash
npm start
```

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## Environment Variables

### Backend (.env)
- `PORT` - Backend server port (default: 5000)
- `SQL_SERVER` - SQL Server host
- `SQL_USER` - SQL Server username
- `SQL_PASSWORD` - SQL Server password
- `SQL_DATABASE` - Database name
- `JWT_SECRET` - Secret key for JWT tokens

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Notes (Protected)
- `GET /api/notes` - Get all notes for logged-in user
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `GET /api/notes/search?q=keyword` - Search notes by title

## Fixed Issues

This project has been fixed to resolve the following issues:

1. ✅ Added missing `sanitize-html` dependency to backend
2. ✅ Fixed unused variable warning in frontend (NoteEditor.jsx)
3. ✅ Created Dockerfile for frontend with nginx
4. ✅ Added nginx configuration for API proxying
5. ✅ Updated docker-compose.yml with correct port mappings
6. ✅ Added .gitignore for repository hygiene

## License

ISC