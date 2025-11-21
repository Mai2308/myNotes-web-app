import { pool } from "../database/db.js";

// ✅ Get all notes for the logged-in user
export const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.request()
      .input("userId", userId)
      .query(`
        SELECT * FROM Notes
        WHERE userId = @userId
        ORDER BY createdAt DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error getting notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create a new note
export const createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content } = req.body;

    await pool.request()
      .input("userId", userId)
      .input("title", title)
      .input("content", content)
      .query(`
        INSERT INTO Notes (userId, title, content, createdAt)
        VALUES (@userId, @title, @content, GETDATE())
      `);

    res.status(201).json({ message: "✅ Note created successfully!" });
  } catch (error) {
    console.error("❌ Error creating note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update a note
export const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content } = req.body;

    await pool.request()
      .input("noteId", noteId)
      .input("userId", userId)
      .input("title", title)
      .input("content", content)
      .query(`
        UPDATE Notes
        SET title = @title,
            content = @content
        WHERE id = @noteId AND userId = @userId
      `);

    res.json({ message: "✅ Note updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete a note
export const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    await pool.request()
      .input("noteId", noteId)
      .input("userId", userId)
      .query("DELETE FROM Notes WHERE id=@noteId AND userId=@userId");

    res.json({ message: "🗑️ Note deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Search notes by keyword (title only) for the logged-in user
export const searchNotes = async (req, res) => {
  try {
    const userId = req.user.id;        
    const keyword = req.query.q || ""; 

    const result = await pool.request()
      .input("userId", userId)
      .input("keyword", `%${keyword}%`) 
      .query("SELECT * FROM Notes WHERE userId=@userId AND title LIKE @keyword ORDER BY createdAt DESC");

    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error searching notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

