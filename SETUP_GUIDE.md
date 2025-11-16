# myNotes Web App - Setup & Run Guide

## Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **SQL Server** - Either:
  - Local SQL Server installation, OR
  - Docker (recommended for easy setup)

## Option 1: Quick Start with Docker (Recommended)

This will run the entire application (frontend, backend, and database) in containers.

### 1. Install Docker
- Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Run the Application
```bash
# Clone the repository
git clone https://github.com/Mai2308/myNotes-web-app.git
cd myNotes-web-app

# Start all services (database, backend, frontend)
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

### 3. Initialize Database
```bash
# Connect to SQL Server and run the schema
docker exec -it notes-sql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong!Pass123 \
  -i /SQLQuery1.sql

# Or if you have an existing database, run the migration
docker exec -it notes-sql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong!Pass123 \
  -i /SQLQuery_Migration.sql
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **SQL Server**: localhost:1433

### 5. Stop the Application
```bash
docker-compose down
```

## Option 2: Manual Setup (Local Development)

### Step 1: Setup SQL Server Database

#### Using Local SQL Server:
1. Open SQL Server Management Studio (SSMS)
2. Connect to your SQL Server instance
3. Open and execute `SQLQuery1.sql` from the repository root

#### Using Docker for SQL Server only:
```bash
# Start SQL Server container
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Pass123" \
  -p 1433:1433 --name sql-server \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Execute the schema
docker exec -it sql-server /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong!Pass123 \
  -Q "CREATE DATABASE NotesApp"

# Copy and execute the SQL file
# (Alternative: Use Azure Data Studio or SSMS to connect to localhost:1433)
```

### Step 2: Configure Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create or update `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=YourStrong!Pass123
DB_NAME=NotesApp
JWT_SECRET=your-secret-key-here
```

3. Install dependencies:
```bash
npm install
```

4. Start the backend server:
```bash
npm start
```

The backend will run on http://localhost:5000

### Step 3: Setup Frontend

1. Open a new terminal and navigate to frontend directory:
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

The frontend will run on http://localhost:3000 (or the next available port)

## Using the Application

### First Time Setup
1. Open the frontend URL in your browser
2. Click on **Sign Up** to create a new account
3. Fill in your username and password
4. Click **Log In** to access your dashboard

### Creating Folders
1. In the left sidebar, click the **[+]** button next to "📁 Folders"
2. Enter a folder name
3. Click the ✓ button to save

### Creating Notes
1. Click **[+ New Note]** button in the main area
2. Enter a title and content
3. Select a folder from the dropdown (optional)
4. Click **Create**

### Organizing Notes
- Click on a folder in the sidebar to view only notes in that folder
- Click "📝 All Notes" to view all notes
- Click "📄 Unassigned" to view notes without a folder
- Edit notes to change their folder assignment

## Troubleshooting

### Backend won't start
- **Error: "Cannot connect to SQL Server"**
  - Verify SQL Server is running
  - Check `.env` file has correct database credentials
  - For Docker: ensure container is running with `docker ps`

- **Error: "Port 5000 already in use"**
  - Change PORT in `.env` file
  - Or stop the process using port 5000

### Frontend won't start
- **Error: "react-scripts not found"**
  - Run `npm install` in the frontend directory
  
- **Error: "Port 3000 already in use"**
  - The app will automatically use the next available port
  - Or stop the process using port 3000

### Database issues
- **Tables don't exist**
  - Run `SQLQuery1.sql` to create the schema
  - Or run `SQLQuery_Migration.sql` if you have an existing database

- **Column 'folderId' doesn't exist**
  - Run `SQLQuery_Migration.sql` to update existing database schema

### CORS errors in browser
- Ensure backend is running on port 5000
- Check frontend is making requests to `http://localhost:5000/api`

## Development Scripts

### Backend
```bash
cd backend
npm start          # Start server
npm test           # Run tests (if available)
```

### Frontend
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## Environment Variables

### Backend (.env)
```env
PORT=5000                              # Backend server port
DB_HOST=localhost                      # SQL Server host
DB_USER=sa                             # SQL Server username
DB_PASSWORD=YourStrong!Pass123         # SQL Server password
DB_NAME=NotesApp                       # Database name
JWT_SECRET=your-secret-key-here        # JWT secret for authentication
```

## Folder Feature

This application now includes folder/category management for organizing notes:

- **Create folders** to organize your notes
- **Assign notes** to folders when creating or editing
- **Filter notes** by clicking on folders in the sidebar
- **Rename folders** by clicking the edit icon
- **Delete folders** - notes remain but become unassigned

See `FOLDER_FEATURE.md` for detailed documentation.

## Additional Resources

- **Feature Documentation**: `FOLDER_FEATURE.md`
- **Security Information**: `SECURITY_SUMMARY.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **UI Preview**: `UI_PREVIEW.md`

## Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/Mai2308/myNotes-web-app).
