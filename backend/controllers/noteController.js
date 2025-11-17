import { pool } from "../database/db.js";

export const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId } = req.query;
    
    let query = `
      SELECT n.*, f.name as folderName
      FROM Notes n
      LEFT JOIN Folders f ON n.folderId = f.id
      WHERE n.userId = @userId
    `;
    
    const request = pool.request().input("userId", userId);
    
    // Filter by folder if folderId is provided
    if (folderId) {
      if (folderId === 'null' || folderId === 'unassigned') {
        query += ` AND n.folderId IS NULL`;
      } else {
        query += ` AND n.folderId = @folderId`;
        request.input("folderId", folderId);
      }
    }
    
    query += ` ORDER BY n.createdAt DESC`;
    
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error getting notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, folderId } = req.body;

    await pool.request()
      .input("userId", userId)
      .input("title", title)
      .input("content", content)
      .input("folderId", folderId || null)
      .query(`
        INSERT INTO Notes (userId, title, content, folderId, createdAt)
        VALUES (@userId, @title, @content, @folderId, GETDATE())
      `);

    res.status(201).json({ message: "✅ Note created successfully!" });
  } catch (error) {
    console.error("❌ Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, folderId } = req.body;

    await pool.request()
      .input("noteId", noteId)
      .input("userId", userId)
      .input("title", title)
      .input("content", content)
      .input("folderId", folderId || null)
      .query(`
        UPDATE Notes
        SET title = @title,
            content = @content,
            folderId = @folderId
        WHERE id = @noteId AND userId = @userId
      `);

    res.json({ message: "✅ Note updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    await pool.request()
      .input("noteId", noteId)
      .input("userId", userId)
      .query(`
        DELETE FROM Notes
        WHERE id = @noteId AND userId = @userId
      `);

    res.json({ message: "✅ Note deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};