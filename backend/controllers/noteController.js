import sanitizeHtml from "sanitize-html";
import Note from "../models/noteModel.js";
import Folder from "../models/folderModel.js"; // new
// Get all notes for the logged-in user
export const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId, sort } = req.query;

    const filter = { user: userId };
    if (folderId) filter.folderId = folderId === "null" ? null : folderId;

    let query = Note.find(filter);

    // 🔥 Sorting logic
    switch (sort) {
      case "newest":
        query = query.sort({ createdAt: -1 });
        break;

      case "oldest":
        query = query.sort({ createdAt: 1 });
        break;

      case "title_asc":
        query = query.sort({ title: 1 });
        break;

      case "title_desc":
        query = query.sort({ title: -1 });
        break;

      case "favorite":
        query = query.sort({ isFavorite: -1, createdAt: -1 }); 
        break;

      default:
        // Default: newest
        query = query.sort({ createdAt: -1 });
    }

    const notes = await query.exec();
    res.json(notes);

  } catch (error) {
    console.error("❌ Error fetching notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Toggle favorite status - creates a copy in Favorites folder
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    // Find the original note
    const originalNote = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!originalNote) return res.status(404).json({ message: "Note not found" });

    // Find or create the user's Favorites folder
    let favoritesFolder = await Folder.findOne({ user: userId, isDefault: true, name: "Favorites" }).exec();
    if (!favoritesFolder) {
      favoritesFolder = new Folder({ user: userId, name: "Favorites", parentId: null, isDefault: true });
      await favoritesFolder.save();
    }

    // Toggle the favorite status
    const newFavoriteStatus = !originalNote.isFavorite;

    if (newFavoriteStatus) {
      // Mark as favorite and create a copy in Favorites folder
      originalNote.isFavorite = true;
      await originalNote.save();

      // Avoid duplicate copies: if a copy already exists pointing to this source, reuse it
      let favoriteCopy = await Note.findOne({
        user: userId,
        folderId: favoritesFolder._id,
        sourceNoteId: originalNote._id,
      }).exec();

      if (!favoriteCopy) {
        // Create a copy of the note in the Favorites folder
        favoriteCopy = new Note({
          title: originalNote.title,
          content: originalNote.content,
          tags: originalNote.tags,
          user: userId,
          folderId: favoritesFolder._id,
          isFavorite: true,
          sourceNoteId: originalNote._id,
        });
        await favoriteCopy.save();
      } else {
        // Update existing copy content/title/tags to match latest
        favoriteCopy.title = originalNote.title;
        favoriteCopy.content = originalNote.content;
        favoriteCopy.tags = originalNote.tags;
        favoriteCopy.isFavorite = true;
        await favoriteCopy.save();
      }

      res.json({ 
        message: "Note added to favorites", 
        note: originalNote, 
        favoriteCopy: favoriteCopy 
      });
    } else {
      // Unfavorite: mark original as not favorite and delete the copy in Favorites
      originalNote.isFavorite = false;
      await originalNote.save();

      // Delete the copy in Favorites by source link
      await Note.deleteMany({
        user: userId,
        folderId: favoritesFolder._id,
        sourceNoteId: originalNote._id,
      }).exec();

      res.json({ 
        message: "Note removed from favorites", 
        note: originalNote 
      });
    }
  } catch (error) {
    console.error("❌ Error toggling favorite:", error);
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

// Search notes (title + content + tags)
export const searchNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const keyword = req.query.q?.trim() || "";
    const { folderId } = req.query;

    if (!keyword) {
      const filter = { user: userId };
      if (folderId) filter.folderId = folderId === "null" ? null : folderId;

      const notes = await Note.find(filter).sort({ createdAt: -1 }).exec();
      return res.json(notes);
    }

    const filter = {
      user: userId,
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
        { tags: { $elemMatch: { $regex: keyword, $options: "i" } } }
      ]
    };

    if (folderId) filter.folderId = folderId === "null" ? null : folderId;

    const notes = await Note.find(filter).sort({ createdAt: -1 }).exec();
    res.json(notes);

  } catch (error) {
    console.error("❌ Error searching notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

