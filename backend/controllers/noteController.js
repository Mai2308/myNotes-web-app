import sanitizeHtml from "sanitize-html";
import Note from "../models/noteModel.js";
import Folder from "../models/folderModel.js"; // new
// Get all notes for the logged-in user
export const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId } = req.query; // optional filter
    const filter = { user: userId };
    if (folderId) filter.folderId = folderId === "null" ? null : folderId;
    const notes = await Note.find(filter).sort({ createdAt: -1 }).exec();
    res.json(notes);
  } catch (error) {
    console.error("❌ Error getting notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new note
export const createNote = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let { title = "", content = "", tags = [], folderId = null } = req.body;
    title = String(title).trim();
    content = String(content || "");

    if (!title && !content) return res.status(400).json({ message: "Title or content required" });
    if (title.length > 255) return res.status(400).json({ message: "Title too long (max 255)" });

    // If folderId provided, validate it belongs to the user
    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, user: userId }).exec();
      if (!folder) return res.status(400).json({ message: "Target folder not found." });
    } else {
      folderId = null;
    }

    const clean = sanitizeHtml(content, {
      allowedTags: ["b","i","u","strong","em","br","p","div","span","ul","ol","li","h1","h2","h3","pre","code"],
      allowedAttributes: { "*": ["style"] },
    });

    const note = new Note({ title, content: clean, tags, user: userId, folderId });
    await note.save();

    res.status(201).json({ message: "Note created", note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, tags, folderId } = req.body;

    // If folderId present, validate
    if (typeof folderId !== "undefined" && folderId !== null) {
      const folder = await Folder.findOne({ _id: folderId, user: userId }).exec();
      if (!folder) return res.status(400).json({ message: "Target folder not found." });
    }

    const update = {};
    if (typeof title !== "undefined") update.title = title;
    if (typeof content !== "undefined") update.content = content;
    if (typeof tags !== "undefined") update.tags = tags;
    if (typeof folderId !== "undefined") update.folderId = folderId;

    const note = await Note.findOneAndUpdate({ _id: noteId, user: userId }, update, { new: true }).exec();
    if (!note) return res.status(404).json({ message: "Note not found or not authorized" });

    res.json({ message: "✅ Note updated successfully!", note });
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Move a note to a folder (explicit endpoint)
export const moveNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { folderId = null } = req.body;

    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, user: userId }).exec();
      if (!folder) return res.status(400).json({ message: "Target folder not found." });
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, user: userId },
      { $set: { folderId } },
      { new: true }
    ).exec();

    if (!note) return res.status(404).json({ message: "Note not found." });
    res.json({ message: "Note moved", note });
  } catch (error) {
    console.error("❌ Error moving note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const result = await Note.findOneAndDelete({ _id: noteId, user: userId }).exec();
    if (!result) return res.status(404).json({ message: "Note not found or not authorized" });

    res.json({ message: "🗑️ Note deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search notes by keyword (title only)
export const searchNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const keyword = req.query.q || "";
    const { folderId } = req.query;

    const filter = { user: userId, title: { $regex: keyword, $options: "i" } };
    if (folderId) filter.folderId = folderId === "null" ? null : folderId;

    const notes = await Note.find(filter).sort({ createdAt: -1 }).exec();
    res.json(notes);
  } catch (error) {
    console.error("❌ Error searching notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};