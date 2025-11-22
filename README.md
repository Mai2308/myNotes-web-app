# myNotes Web App

A full-stack note-taking application with rich text editing, user authentication, and a modern UI.

## Features

- 📝 Rich text editor with formatting options (bold, italic, underline, colors, highlights)
- 🎨 Custom font selection and background colors
- 🌓 Dark/Light theme toggle
- 🔐 User authentication (signup/login)
- 💾 Save, edit, and delete notes
- 🔍 Search notes by title
- 📱 Responsive design
- 🐳 Docker support for easy deployment

## Tech Stack

### Backend
- Node.js + Express
- MS SQL Server
- JWT authentication
- bcrypt for password hashing
- sanitize-html for content security

### Frontend
- React 19
- React Router for navigation
- ContentEditable for rich text editing
- Theme Context for dark/light mode

## Prerequisites

- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized deployment)
- MS SQL Server (if running locally without Docker)

## Setup Instructions

### Option 1: Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/Mai2308/myNotes-web-app.git
   cd myNotes-web-app
   ```

2. Build and start all services:
   ```bash
   docker-compose up -d --build
   ```

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - SQL Server: localhost:1433

4. Initialize the database (first time only):
   ```bash
   # Connect to SQL Server container
   docker exec -it notes-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Mynoteswebapp27 -C
   
   # Run the schema script
   # Copy and paste the contents from SQLQuery1.sql or backend/db/schema.sql
   ```

### Option 2: Local Development

#### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env` and update with your database credentials
   - Default configuration:
     ```
     PORT=5000
     DB_HOST=localhost
     DB_USER=sa
     DB_PASSWORD=Mynoteswebapp27
     DB_NAME=NotesDB
     JWT_SECRET=your-secret-jwt-key-change-this-in-production
     ```

4. Set up the database:
   - Start MS SQL Server
   - Run the SQL scripts in order:
     1. `SQLQuery1.sql` (creates database and tables)
     2. Or `backend/db/schema.sql`

5. Start the backend:
   ```bash
   npm start
   ```

#### Frontend Setup

1. Navigate to frontend directory:
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

4. The frontend will open at http://localhost:3000

## Usage

1. **Sign Up**: Create a new account with name, email, and password
2. **Login**: Sign in with your email and password
3. **Create Notes**: Use the rich text editor to create formatted notes
4. **Customize**: 
   - Apply text formatting (bold, italic, underline)
   - Change font families
   - Add text colors and highlights
   - Set note background colors
   - Toggle dark/light theme
5. **Manage Notes**:
   - View all your notes in the Notes list
   - Search notes by title
   - Delete notes you no longer need
6. **Save Drafts**: Save work in progress locally (uses localStorage)

## API Endpoints

### User Routes
- `POST /api/users/register` - Create new user
- `POST /api/users/login` - Login user

### Note Routes (Protected)
- `GET /api/notes` - Get all notes for logged-in user
- `GET /api/notes/search?q=keyword` - Search notes by title
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Database Schema

### Users Table
- `id` (INT, PRIMARY KEY, IDENTITY)
- `name` (NVARCHAR(100))
- `email` (NVARCHAR(100), UNIQUE)
- `password` (NVARCHAR(255), hashed)
- `createdAt` (DATETIME)

### Notes Table
- `id` (INT, PRIMARY KEY, IDENTITY)
- `userId` (INT, FOREIGN KEY)
- `title` (NVARCHAR(255))
- `content` (NVARCHAR(MAX))
- `createdAt` (DATETIME)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTML sanitization to prevent XSS attacks
- Secure SQL queries with parameterized inputs
- CORS enabled for frontend-backend communication

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=Mynoteswebapp27
DB_NAME=NotesDB
JWT_SECRET=your-secret-jwt-key-change-this-in-production
```

## Troubleshooting

### Database Connection Issues
- Ensure SQL Server is running
- Check credentials in `.env` match your SQL Server configuration
- For Docker: wait for SQL Server to be fully initialized (healthcheck)

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check proxy configuration in `frontend/package.json`
- Ensure CORS is properly configured

### Docker Issues
- Run `docker-compose down` and `docker-compose up --build` to rebuild
- Check logs: `docker-compose logs -f`
- Verify ports 3000, 5000, and 1433 are not in use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.

## Author

Mai2308

## Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend
- Microsoft for SQL Server