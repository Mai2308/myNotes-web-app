-- SQL script to create Notes table
CREATE TABLE IF NOT EXISTS Notes (
  id INT IDENTITY(1,1) PRIMARY KEY, -- for MS SQL
  userId INT NOT NULL,
  title NVARCHAR(255) NULL,
  content NVARCHAR(MAX) NULL,
  createdAt DATETIME DEFAULT GETDATE()
);

