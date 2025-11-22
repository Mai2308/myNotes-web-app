-- SQL script to create Notes table
CREATE TABLE IF NOT EXISTS Notes (
  id INT IDENTITY(1,1) PRIMARY KEY, -- for MS SQL
Comment view  userId INT NOT NULL,
  title NVARCHAR(255) NULL,
  content NVARCHAR(MAX) NULL,
  createdAt DATETIME DEFAULT GETDATE()
  createdAt DATETIME DEFAULT GETDATE(),
  isFavourite BIT DEFAULT 0 -- favourite flag
);

