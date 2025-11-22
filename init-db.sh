#!/bin/bash
set -e

# Wait for SQL Server to be ready with proper health checks
echo "Waiting for SQL Server to be ready..."
RETRY_COUNT=0
MAX_RETRIES=30

until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -C -Q "SELECT 1" &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ SQL Server did not become ready in time"
        exit 1
    fi
    echo "⏳ Waiting for SQL Server... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo "✅ SQL Server is ready!"

# Run the schema script
echo "📦 Creating database and tables..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -C -Q "
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'NotesDB')
BEGIN
    CREATE DATABASE NotesDB;
END
GO

USE NotesDB;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notes')
BEGIN
    CREATE TABLE Notes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        title NVARCHAR(255) NULL,
        content NVARCHAR(MAX) NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
END
GO
"

echo "✅ Database initialization completed!"
