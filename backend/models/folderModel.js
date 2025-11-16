import { pool } from "../database/db.js";

// Folder model - handles database operations for folders
export const FolderModel = {
  // Get all folders for a specific user
  async getFoldersByUserId(userId) {
    const result = await pool.request()
      .input("userId", userId)
      .query(`
        SELECT id, name, userId, createdAt
        FROM Folders
        WHERE userId = @userId
        ORDER BY name ASC
      `);
    return result.recordset;
  },

  // Get a single folder by ID and userId
  async getFolderById(folderId, userId) {
    const result = await pool.request()
      .input("folderId", folderId)
      .input("userId", userId)
      .query(`
        SELECT id, name, userId, createdAt
        FROM Folders
        WHERE id = @folderId AND userId = @userId
      `);
    return result.recordset[0];
  },

  // Create a new folder
  async createFolder(name, userId) {
    const result = await pool.request()
      .input("name", name)
      .input("userId", userId)
      .query(`
        INSERT INTO Folders (name, userId, createdAt)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.userId, INSERTED.createdAt
        VALUES (@name, @userId, GETDATE())
      `);
    return result.recordset[0];
  },

  // Update folder name
  async updateFolder(folderId, name, userId) {
    const result = await pool.request()
      .input("folderId", folderId)
      .input("name", name)
      .input("userId", userId)
      .query(`
        UPDATE Folders
        SET name = @name
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.userId, INSERTED.createdAt
        WHERE id = @folderId AND userId = @userId
      `);
    return result.recordset[0];
  },

  // Delete a folder
  async deleteFolder(folderId, userId) {
    const result = await pool.request()
      .input("folderId", folderId)
      .input("userId", userId)
      .query(`
        DELETE FROM Folders
        WHERE id = @folderId AND userId = @userId
      `);
    return result.rowsAffected[0];
  },

  // Get notes count for a folder
  async getNotesCountByFolder(folderId, userId) {
    const result = await pool.request()
      .input("folderId", folderId)
      .input("userId", userId)
      .query(`
        SELECT COUNT(*) as count
        FROM Notes
        WHERE folderId = @folderId AND userId = @userId
      `);
    return result.recordset[0].count;
  }
};
