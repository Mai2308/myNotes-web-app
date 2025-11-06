import { pool } from "../database/db.js";

// Get all notes for the logged-in user (optionally filtered by folder)
export const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folder_id } = req.query;
    let queryStr = "SELECT * FROM Notes WHERE userId = @userId";
    const request = pool.request().input("userId", userId);

    if (folder_id) {
      queryStr += " AND folder_id = @folder_id";
      request.input("folder_id", folder_id);
    }
    queryStr += " ORDER BY createdAt DESC";
    const result = await request.query(queryStr);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error getting notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new note (optionally with folder_id)
export const createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, folder_id } = req.body;

    await pool.request()
      .input("userId", userId)
      .input("title", title)
      .input("content", content)
      .input("folder_id", folder_id || null)
      .query(`
        INSERT INTO Notes (userId, title, content, folder_id, createdAt)
        VALUES (@userId, @title, @content, @folder_id, GETDATE())
      `);

    res.status(201).json({ message: "✅ Note created successfully!" });
  } catch (error) {
    console.error("❌ Error creating note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a note (optionally move to another folder)
export const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, folder_id } = req.body;

    await pool.request()
      .input("noteId", noteId)
      .input("userId", userId)
      .input("title", title)
      .input("content", content)
      .input("folder_id", folder_id || null)
      .query(`
        UPDATE Notes
        SET title = @title,
            content = @content,
            folder_id = @folder_id
        WHERE id = @noteId AND userId = @userId
      `);

    res.json({ message: "✅ Note updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(500).json({ message: "Server error" });
  }
};