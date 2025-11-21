-- Migration script to add folder support to existing NotesApp database
USE NotesApp;
GO

-- Create Folders table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Folders')
BEGIN
    CREATE TABLE Folders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        userId INT NOT NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    PRINT '✅ Folders table created successfully';
END
ELSE
BEGIN
    PRINT 'ℹ️ Folders table already exists';
END
GO

-- Add folderId column to Notes table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Notes') AND name = 'folderId')
BEGIN
    ALTER TABLE Notes ADD folderId INT NULL;
    ALTER TABLE Notes ADD CONSTRAINT FK_Notes_Folders FOREIGN KEY (folderId) REFERENCES Folders(id) ON DELETE SET NULL;
    PRINT '✅ folderId column added to Notes table';
END
ELSE
BEGIN
    PRINT 'ℹ️ folderId column already exists in Notes table';
END
GO

-- Add createdAt column to Notes table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Notes') AND name = 'createdAt')
BEGIN
    ALTER TABLE Notes ADD createdAt DATETIME DEFAULT GETDATE();
    PRINT '✅ createdAt column added to Notes table';
END
ELSE
BEGIN
    PRINT 'ℹ️ createdAt column already exists in Notes table';
END
GO

-- Rename user_id to userId in Notes table if needed
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Notes') AND name = 'user_id')
BEGIN
    EXEC sp_rename 'Notes.user_id', 'userId', 'COLUMN';
    PRINT '✅ Column user_id renamed to userId in Notes table';
END
ELSE
BEGIN
    PRINT 'ℹ️ userId column already exists or user_id does not exist';
END
GO

PRINT '✅ Migration completed successfully!';