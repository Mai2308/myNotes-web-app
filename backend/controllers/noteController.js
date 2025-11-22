import { pool } from "../database/db.js";
import sanitizeHtml from "sanitize-html";

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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let { title = "", content = "" } = req.body;
    title = String(title).trim();
    content = String(content || "");

    if (!title && !content) return res.status(400).json({ message: "Title or content required" });
    if (title.length > 255) return res.status(400).json({ message: "Title too long (max 255)" });

    // sanitize: allow basic formatting and inline styles for font/color
    const clean = sanitizeHtml(content, {
      allowedTags: ["b","i","u","strong","em","br","p","div","span","ul","ol","li","h1","h2","h3","pre","code"],
      allowedAttributes: { "*": ["style"] },
      allowedStyles: {
        "*": {
          "font-family": [/^[\w\s,"'-]+$/],
          "background-color": [/^#?[0-9a-fA-F(),\s.%]+$/],
          "color": [/^#?[0-9a-fA-F(),\s.%]+$/],
          "text-decoration": [/^underline$/]
        }
      }
    });

    const result = await pool.request()
      .input("userId", userId)
      .input("title", title)
      .input("content", clean)
      .query(`
        INSERT INTO Notes (userId, title, content, createdAt)
        VALUES (@userId, @title, @content, GETDATE());
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id, GETDATE() AS createdAt;
      `);

    const inserted = result.recordset?.[0] ?? null;
    res.status(201).json({ message: "Note created", id: inserted?.id ?? null, createdAt: inserted?.createdAt ?? null });
  } catch (error) {
    console.error(error);
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

// ✅ Get all favourite notes for the logged-in user
export const getFavouriteNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.request()
      .input("userId", userId)
      .query(`
        SELECT * FROM Notes
        WHERE userId = @userId AND isFavourite = 1
        ORDER BY createdAt DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error getting favourite notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Toggle favourite status of a note
export const toggleFavourite = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    // First, get the current favourite status
    const checkResult = await pool.request()
      .input("noteId", noteId)
      .input("userId", userId)
      .query("SELECT isFavourite FROM Notes WHERE id=@noteId AND userId=@userId");

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    const currentStatus = checkResult.recordset[0].isFavourite;
    const newStatus = !currentStatus;

    // Update the favourite status
    await pool.request()
      .input("noteId", noteId)
      .input("userId", userId)
      .input("isFavourite", newStatus)
      .query(`
        UPDATE Notes
        SET isFavourite = @isFavourite
        WHERE id = @noteId AND userId = @userId
      `);

    res.json({ 
      message: newStatus ? "⭐ Note added to favourites!" : "Note removed from favourites",
      isFavourite: newStatus 
    });
  } catch (error) {
    console.error("❌ Error toggling favourite:", error);
    res.status(500).json({ message: "Server error" });
  }
};