import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "Mynoteswebapp27",
  server: process.env.DB_HOST || "localhost",
  database: "master", // Connect to master first to create database
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function initializeDatabase() {
  try {
    console.log("🔄 Connecting to SQL Server...");
    const pool = await sql.connect(config);
    
    console.log("✅ Connected to SQL Server");
    console.log("📦 Creating NotesDB database if it doesn't exist...");
    
    // Create database
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'NotesDB')
      BEGIN
        CREATE DATABASE NotesDB;
      END
    `);
    
    console.log("✅ Database NotesDB ready");
    
    // Close connection to master
    await pool.close();
    
    // Reconnect to NotesDB
    config.database = "NotesDB";
    const notesPool = await sql.connect(config);
    
    console.log("📊 Creating Users table if it doesn't exist...");
    await notesPool.request().query(`
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
    `);
    
    console.log("✅ Users table ready");
    
    console.log("📊 Creating Notes table if it doesn't exist...");
    await notesPool.request().query(`
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
    `);
    
    console.log("✅ Notes table ready");
    console.log("🎉 Database initialization completed successfully!");
    
    await notesPool.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

initializeDatabase();
