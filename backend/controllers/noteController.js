import sanitizeHtml from "sanitize-html";
import bcrypt from "bcryptjs";
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
    
    // Hide content for locked notes
    const sanitizedNotes = notes.map(note => {
      const noteObj = note.toObject();
      if (noteObj.isLocked) {
        // Remove sensitive content from locked notes
        noteObj.content = null;
        noteObj.checklistItems = [];
        noteObj.lockPassword = undefined;
      } else {
        noteObj.lockPassword = undefined;
      }
      return noteObj;
    });
    
    res.json(sanitizedNotes);
  } catch (error) {
    console.error("❌ Error searching notes:", error);
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

    // First find the note to check if it's locked
    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found or not authorized" });

    // Prevent editing locked notes
    if (note.isLocked) {
      return res.status(403).json({ message: "Cannot edit locked note. Please unlock it first." });
    }

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

    const updatedNote = await Note.findOneAndUpdate({ _id: noteId, user: userId }, update, { new: true }).exec();

    res.json({ message: "✅ Note updated successfully!", note: updatedNote });
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

    // First find the note to check if it's locked
    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found or not authorized" });

    // Prevent deleting locked notes
    if (note.isLocked) {
      return res.status(403).json({ message: "Cannot delete locked note. Please unlock it first." });
    }

    const result = await Note.findOneAndDelete({ _id: noteId, user: userId }).exec();

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

// Convert a note to checklist mode
export const convertToChecklist = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Prevent converting locked notes
    if (note.isLocked) {
      return res.status(403).json({ message: "Cannot convert locked note. Please unlock it first." });
    }

    // Parse content into checklist items (split by lines)
    const content = note.content || "";
    
    // Strip HTML tags and get plain text, handle different HTML structures
    let plainText = content
      .replace(/<br\s*\/?>/gi, '\n')  // Convert br tags to newlines
      .replace(/<\/p>/gi, '\n')        // Convert closing p tags to newlines
      .replace(/<\/div>/gi, '\n')      // Convert closing div tags to newlines
      .replace(/<\/li>/gi, '\n')       // Convert closing li tags to newlines
      .replace(/<[^>]*>/g, '')         // Remove all other HTML tags
      .replace(/&nbsp;/g, ' ')         // Replace nbsp with space
      .replace(/&amp;/g, '&')          // Replace amp
      .replace(/&lt;/g, '<')           // Replace lt
      .replace(/&gt;/g, '>')           // Replace gt
      .trim();
    
    const lines = plainText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const checklistItems = lines.map((line, index) => ({
      text: line,
      completed: false,
      order: index
    }));

    note.isChecklist = true;
    note.checklistItems = checklistItems;
    await note.save();

    res.json({ message: "Note converted to checklist", note });
  } catch (error) {
    console.error("❌ Error converting to checklist:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Convert a checklist back to regular note
export const convertToRegularNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Prevent converting locked notes
    if (note.isLocked) {
      return res.status(403).json({ message: "Cannot convert locked note. Please unlock it first." });
    }

    // Convert checklist items back to content
    if (note.isChecklist && note.checklistItems.length > 0) {
      const sortedItems = note.checklistItems.sort((a, b) => a.order - b.order);
      const content = sortedItems.map(item => item.text).join('\n');
      note.content = content;
    }

    note.isChecklist = false;
    note.checklistItems = [];
    await note.save();

    res.json({ message: "Checklist converted to regular note", note });
  } catch (error) {
    console.error("❌ Error converting to regular note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update checklist items (add, edit, delete, reorder)
export const updateChecklistItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { checklistItems } = req.body;

    if (!Array.isArray(checklistItems)) {
      return res.status(400).json({ message: "checklistItems must be an array" });
    }

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Prevent updating locked notes
    if (note.isLocked) {
      return res.status(403).json({ message: "Cannot update locked note. Please unlock it first." });
    }

    if (!note.isChecklist) return res.status(400).json({ message: "Note is not in checklist mode" });

    // Validate and set checklist items
    const validatedItems = checklistItems.map((item, index) => ({
      text: String(item.text || "").trim(),
      completed: Boolean(item.completed),
      order: typeof item.order === 'number' ? item.order : index
    })).filter(item => item.text.length > 0);

    note.checklistItems = validatedItems;
    await note.save();

    res.json({ message: "Checklist items updated", note });
  } catch (error) {
    console.error("❌ Error updating checklist items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle completion status of a specific checklist item
export const toggleChecklistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { itemIndex } = req.body;

    if (typeof itemIndex !== 'number' || itemIndex < 0) {
      return res.status(400).json({ message: "Valid itemIndex is required" });
    }

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Prevent toggling locked notes
    if (note.isLocked) {
      return res.status(403).json({ message: "Cannot modify locked note. Please unlock it first." });
    }

    if (!note.isChecklist) return res.status(400).json({ message: "Note is not in checklist mode" });
    if (itemIndex >= note.checklistItems.length) {
      return res.status(400).json({ message: "Item index out of bounds" });
    }

    // Toggle the completed status
    note.checklistItems[itemIndex].completed = !note.checklistItems[itemIndex].completed;
    await note.save();

    res.json({ 
      message: "Checklist item toggled", 
      note,
      toggledItem: note.checklistItems[itemIndex]
    });
  } catch (error) {
    console.error("❌ Error toggling checklist item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add an emoji to a note's emoji list (metadata)
export const addEmojiToNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ message: "emoji is required as a string" });
    }

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.emojis = Array.isArray(note.emojis) ? note.emojis : [];
    if (!note.emojis.includes(emoji)) {
      note.emojis.push(emoji);
      await note.save();
    }

    res.json({ message: "Emoji added to note", note });
  } catch (error) {
    console.error("❌ Error adding emoji to note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove an emoji from a note's emoji list (metadata)
export const removeEmojiFromNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { emoji } = req.params;

    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ message: "emoji param is required" });
    }

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.emojis = (note.emojis || []).filter(e => e !== emoji);
    await note.save();

    res.json({ message: "Emoji removed from note", note });
  } catch (error) {
    console.error("❌ Error removing emoji from note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lock a note with password or biometric
export const setNoteLock = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { password, lockType = 'password' } = req.body;

    console.log("🔒 Lock request received");
    console.log("   User ID:", userId);
    console.log("   Note ID:", noteId);
    console.log("   Lock Type:", lockType);
    console.log("   Password provided:", password ? "Yes" : "No");
    console.log("   Request body:", req.body);

    if (!['password', 'biometric'].includes(lockType)) {
      return res.status(400).json({ message: "lockType must be 'password' or 'biometric'" });
    }

    if (lockType === 'password' && (!password || typeof password !== 'string' || password.length < 4)) {
      return res.status(400).json({ message: "Password must be at least 4 characters" });
    }

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    console.log("🔍 Note search result:");
    console.log("   Found:", note ? "Yes" : "No");
    if (note) {
      console.log("   Note ID:", note._id);
      console.log("   Note Title:", note.title);
      console.log("   Note User:", note.user);
    }
    if (!note) {
      console.log("❌ Note not found - returning 404");
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.isLocked) {
      return res.status(400).json({ message: "Note is already locked" });
    }

    // Find or create the user's Locked Notes folder
    let lockedFolder = await Folder.findOne({ user: userId, isDefault: true, name: "Locked Notes" }).exec();
    if (!lockedFolder) {
      lockedFolder = new Folder({ user: userId, name: "Locked Notes", parentId: null, isDefault: true });
      await lockedFolder.save();
    }

    // Store original folder ID before moving
    note.originalFolderId = note.folderId;

    // Hash password if password type
    let hashedPassword = null;
    if (lockType === 'password') {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    note.isLocked = true;
    note.lockPassword = hashedPassword;
    note.lockType = lockType;
    note.folderId = lockedFolder._id; // Move to Locked Notes folder
    await note.save();

    res.json({ 
      message: "Note locked successfully and moved to Locked Notes folder", 
      note: {
        ...note.toObject(),
        lockPassword: undefined // Don't send password hash to client
      }
    });
  } catch (error) {
    console.error("❌ Error locking note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify note lock with password or biometric
export const verifyNoteLock = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { password, biometricVerified = false } = req.body;

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (!note.isLocked) {
      return res.status(400).json({ message: "Note is not locked" });
    }

    let isValid = false;

    if (note.lockType === 'password') {
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      isValid = await bcrypt.compare(password, note.lockPassword);
    } else if (note.lockType === 'biometric') {
      // In a real implementation, biometric verification would be done on the client
      // and the server would validate a token or signature
      isValid = biometricVerified === true;
    }

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Return the full note with content
    res.json({ 
      message: "Note unlocked successfully", 
      note: {
        ...note.toObject(),
        lockPassword: undefined // Don't send password hash to client
      },
      unlocked: true
    });
  } catch (error) {
    console.error("❌ Error verifying note lock:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove lock from a note
export const removeNoteLock = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { password, biometricVerified = false } = req.body;

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (!note.isLocked) {
      return res.status(400).json({ message: "Note is not locked" });
    }

    // Verify credentials before unlocking
    let isValid = false;

    if (note.lockType === 'password') {
      if (!password) {
        return res.status(400).json({ message: "Password is required to remove lock" });
      }
      isValid = await bcrypt.compare(password, note.lockPassword);
    } else if (note.lockType === 'biometric') {
      isValid = biometricVerified === true;
    }

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Restore original folder before unlocking
    const originalFolderId = note.originalFolderId || null;

    note.isLocked = false;
    note.lockPassword = null;
    note.lockType = null;
    note.folderId = originalFolderId; // Move back to original folder
    note.originalFolderId = null; // Clear the stored original folder
    await note.save();

    res.json({ 
      message: "Note lock removed successfully and moved back to original folder", 
      note: {
        ...note.toObject(),
        lockPassword: undefined
      }
    });
  } catch (error) {
    console.error("❌ Error removing note lock:", error);
    res.status(500).json({ message: "Server error" });
  }
};
