# myNotes Web App 📝

A full-stack web application for creating and organizing notes with folder/category support.

## Features

✨ **User Authentication** - Secure signup and login  
✨ **Note Management** - Create, edit, and delete notes  
✨ **Folder Organization** - Organize notes into custom folders  
✨ **Smart Filtering** - Filter notes by folder or view all/unassigned  
✨ **Responsive Design** - Works on desktop and mobile devices  

## Quick Start

### Using Docker (Recommended)
```bash
# Clone and navigate to the repository
git clone https://github.com/Mai2308/myNotes-web-app.git
cd myNotes-web-app

# Start all services
docker-compose up -d

# Initialize database
docker exec -it notes-sql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong!Pass123 \
  -i /SQLQuery1.sql

# Access the app
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

### Manual Setup
```bash
# 1. Setup SQL Server and run SQLQuery1.sql

# 2. Start Backend
cd backend
npm install
npm start

# 3. Start Frontend (in new terminal)
cd frontend
npm install
npm start
```

## Technology Stack

**Frontend:** React, React Router  
**Backend:** Node.js, Express.js  
**Database:** Microsoft SQL Server  
**Authentication:** JWT, bcrypt  

## Documentation

- 📖 [Complete Setup Guide](SETUP_GUIDE.md) - Detailed installation and configuration
- 📁 [Folder Feature Documentation](FOLDER_FEATURE.md) - API and usage guide
- 🔒 [Security Summary](SECURITY_SUMMARY.md) - Security analysis and best practices
- 🎨 [UI Preview](UI_PREVIEW.md) - Interface layout and interactions

## Project Structure

```
myNotes-web-app/
├── backend/              # Express.js API server
│   ├── controllers/      # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   └── middleware/      # Auth middleware
├── frontend/            # React application
│   └── src/
│       ├── components/  # React components
│       └── auth/        # Authentication logic
├── SQLQuery1.sql        # Database schema
└── docker-compose.yml   # Docker configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC