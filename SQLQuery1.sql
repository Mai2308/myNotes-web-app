CREATE DATABASE NotesApp;
GO
USE NotesApp;
GO

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL,
    password NVARCHAR(100) NOT NULL
);

CREATE TABLE Notes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(100),
    content NVARCHAR(MAX),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
