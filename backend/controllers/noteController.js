import sanitizeHtml from "sanitize-html";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Note from "../models/noteModel.js";
import Folder from "../models/folderModel.js";
import { ensureLockedFolder, isLockedFolder } from "../utils/lockedFolder.js";
import { checkReminders, addInAppNotification } from "../services/notificationService.js";

const { Types: { ObjectId } } = mongoose;

// Determine whether a note is overdue using deadline or non-recurring reminder
const computeIsOverdue = (noteLike, now = new Date()) => {
  const deadlineAt = noteLike?.deadline ? new Date(noteLike.deadline) : null;
  const reminderAt = noteLike?.reminderDate ? new Date(noteLike.reminderDate) : null;

  const deadlinePassed = deadlineAt && !isNaN(deadlineAt) && deadlineAt < now;
  const reminderPassed = reminderAt && !isNaN(reminderAt) && !noteLike?.isRecurring && reminderAt < now;

  return Boolean(deadlinePassed || reminderPassed);
};
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
    const now = new Date();

    const payload = notes.map((n) => {
      const obj = n.toObject();
      obj.isOverdue = computeIsOverdue(obj, now);
      return obj;
    });

    res.json(payload);

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

    // Find the note being toggled
    const clickedNote = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!clickedNote) return res.status(404).json({ message: "Note not found" });

    // Determine if this is a copy or the original note
    let originalNote;
    if (clickedNote.sourceNoteId) {
      // User clicked on a copy in Favorites - find the original
      originalNote = await Note.findOne({ _id: clickedNote.sourceNoteId, user: userId }).exec();
      if (!originalNote) return res.status(404).json({ message: "Original note not found" });
    } else {
      // User clicked on the original note
      originalNote = clickedNote;
    }

    console.log("📝 Original Note:", {
      _id: originalNote._id,
      title: originalNote.title,
      isChecklist: originalNote.isChecklist,
      checklistItems: originalNote.checklistItems
    });

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
        const copyData = {
          title: originalNote.title,
          content: originalNote.content,
          tags: originalNote.tags,
          user: userId,
          folderId: favoritesFolder._id,
          isFavorite: true,
          sourceNoteId: originalNote._id,
          isChecklist: !!originalNote.isChecklist,
          checklistItems: originalNote.isChecklist && originalNote.checklistItems 
            ? originalNote.checklistItems.map(item => ({ ...item }))
            : []
        };
        favoriteCopy = new Note(copyData);
        await favoriteCopy.save();
        console.log("💾 Created Favorite Copy (before refresh):", copyData);
        // Refresh to ensure all fields are populated
        favoriteCopy = await Note.findById(favoriteCopy._id).exec();
        console.log("🔄 Favorite Copy (after refresh):", {
          _id: favoriteCopy._id,
          title: favoriteCopy.title,
          isChecklist: favoriteCopy.isChecklist,
          checklistItems: favoriteCopy.checklistItems
        });
      } else {
        // Update existing copy content/title/tags to match latest
        favoriteCopy.title = originalNote.title;
        favoriteCopy.content = originalNote.content;
        favoriteCopy.tags = originalNote.tags;
        favoriteCopy.isFavorite = true;
        favoriteCopy.isChecklist = !!originalNote.isChecklist;
        favoriteCopy.checklistItems = originalNote.isChecklist && originalNote.checklistItems 
          ? originalNote.checklistItems.map(item => ({ ...item }))
          : [];
        await favoriteCopy.save();
        // Refresh to ensure all fields are populated
        favoriteCopy = await Note.findById(favoriteCopy._id).exec();
      }

      res.json({ 
        message: "Note added to favorites", 
        note: originalNote.toObject(), 
        favoriteCopy: favoriteCopy.toObject() 
      });
      console.log("✅ Favorite Copy Response:", JSON.stringify(favoriteCopy.toObject(), null, 2));
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
        note: originalNote.toObject() 
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

    let { title = "", content = "", tags = [], folderId = null, reminderDate, isRecurring, recurringPattern, notificationMethods, deadline } = req.body;
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

    const noteData = { title, content: clean, tags, user: userId, folderId };

    // Attach deadline if provided
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (!isNaN(deadlineDate.getTime())) {
        noteData.deadline = deadlineDate;
      }
    }
    
    // Add reminder fields if provided
    if (reminderDate) {
      const reminderDateTime = new Date(reminderDate);
      if (!isNaN(reminderDateTime.getTime()) && reminderDateTime > new Date()) {
        noteData.reminderDate = reminderDateTime;
        noteData.isRecurring = isRecurring || false;
        noteData.recurringPattern = (isRecurring && recurringPattern) ? recurringPattern : null;
        noteData.notificationMethods = notificationMethods || ['in-app'];
      }
    }

    noteData.isOverdue = computeIsOverdue(noteData);

    const note = new Note(noteData);
    await note.save();

    // Send immediate notification when reminder is set
    if (reminderDate) {
      const userIdStr = String(userId);
      console.log(`🔔 Creating reminder notification for user ${userIdStr}, noteId: ${note._id}`);
      
      try {
        addInAppNotification(userIdStr, {
          noteId: note._id,
          title: `Reminder set: ${note.title || 'Untitled'}`,
          content: `Reminder scheduled for ${new Date(reminderDate).toLocaleString()}`,
          type: 'reminder_set',
          reminderDate: reminderDate,
        });
        
        // Verify it was added
        const { getInAppNotifications } = await import("../services/notificationService.js");
        const userNotifs = getInAppNotifications(userIdStr);
        console.log(`✅ Notification added! User ${userIdStr} now has ${userNotifs.length} notification(s)`);
      } catch (error) {
        console.error(`❌ Failed to add notification:`, error);
      }
    }

    // Trigger immediate reminder check if reminder was set
    if (reminderDate || deadline) {
      setTimeout(() => checkReminders().catch(console.error), 1000);
    }

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
    const { title, content, tags, folderId, reminderDate, isRecurring, recurringPattern, notificationMethods, deadline } = req.body;

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found or not authorized" });

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
    if (typeof deadline !== "undefined") {
      if (deadline) {
        const deadlineDate = new Date(deadline);
        if (!isNaN(deadlineDate.getTime())) {
          update.deadline = deadlineDate;
        }
      } else {
        update.deadline = null;
      }
    }
    
    // Handle reminder fields
    if (typeof reminderDate !== "undefined") {
      if (reminderDate) {
        const reminderDateTime = new Date(reminderDate);
        if (!isNaN(reminderDateTime.getTime())) {
          update.reminderDate = reminderDateTime;
          update.notificationSent = false;
          update.isOverdue = false;
        }
      } else {
        // Clear reminder if set to null
        update.reminderDate = null;
        update.isRecurring = false;
        update.recurringPattern = null;
        update.notificationSent = false;
       Send immediate notification when reminder is set/updated
    if (reminderDate) {
      const userIdStr = String(userId);
      console.log(`🔔 Creating reminder notification for user ${userIdStr}, noteId: ${updatedNote._id}`);
      
      try {
        addInAppNotification(userIdStr, {
          noteId: updatedNote._id,
          title: `Reminder set: ${updatedNote.title || 'Untitled'}`,
          content: `Reminder scheduled for ${new Date(reminderDate).toLocaleString()}`,
          type: 'reminder_set',
          reminderDate: reminderDate,
        });
        
        // Verify it was added
        const { getInAppNotifications } = await import("../services/notificationService.js");
        const userNotifs = getInAppNotifications(userIdStr);
        console.log(`✅ Notification added! User ${userIdStr} now has ${userNotifs.length} notification(s)`);
      } catch (error) {
        console.error(`❌ Failed to add notification:`, error);
      }
    }

    //  update.isOverdue = false;
      }
    }
    if (typeof isRecurring !== "undefined") update.isRecurring = isRecurring;
    if (typeof recurringPattern !== "undefined") update.recurringPattern = recurringPattern;
    if (typeof notificationMethods !== "undefined") update.notificationMethods = notificationMethods;

    update.isOverdue = computeIsOverdue({ ...note.toObject(), ...update });

    const updatedNote = await Note.findOneAndUpdate({ _id: noteId, user: userId }, update, { new: true }).exec();

    // Trigger immediate reminder check if reminder or deadline was updated
    if (typeof reminderDate !== "undefined" || typeof deadline !== "undefined") {
      setTimeout(() => checkReminders().catch(console.error), 1000);
    }

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

// Move a note into the locked folder
export const lockNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, user: userId }).exec();
    if (!note) return res.status(404).json({ message: "Note not found." });

    const lockedFolder = await ensureLockedFolder(userId);
    note.folderId = lockedFolder._id;
    await note.save();

    res.json({
      message: "Note moved to locked folder",
      note,
      lockedFolderId: lockedFolder._id,
      requiresPassword: Boolean(lockedFolder.passwordHash),
    });
  } catch (error) {
    console.error("❌ Error locking note:", error);
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
    const excludedFolderIds = [];
    const lockedFolder = await ensureLockedFolder(userId);
    if (lockedFolder) excludedFolderIds.push(lockedFolder._id.toString());
    const protectedFolders = await Folder.find({ user: userId, isProtected: true }).select("_id isProtected passwordHash name isDefault").lean();
    protectedFolders.forEach((f) => excludedFolderIds.push(f._id.toString()));

    const filter = { user: userId };
    const isFolderScoped = typeof folderId !== "undefined" && folderId !== "";

    if (isFolderScoped) {
      if (folderId !== "null" && !ObjectId.isValid(folderId)) {
        return res.status(400).json({ message: "Invalid folder id" });
      }

      const targetFolder = folderId && folderId !== "null"
        ? await Folder.findOne({ _id: folderId, user: userId }).lean()
        : null;

      if (folderId && folderId !== "null" && !targetFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      if (targetFolder && (targetFolder.isProtected || isLockedFolder(targetFolder))) {
        const supplied = req.headers["x-folder-password"] || req.query.password;
        if (!supplied) return res.status(403).json({ message: "Folder password required" });
        const ok = await bcrypt.compare(String(supplied), targetFolder.passwordHash || "");
        if (!ok) return res.status(403).json({ message: "Invalid folder password" });
      }

      filter.folderId = folderId === "null" ? null : folderId;
    } else if (excludedFolderIds.length > 0) {
      filter.folderId = { $nin: [...new Set(excludedFolderIds)] };
    }

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
        { tags: { $elemMatch: { $regex: keyword, $options: "i" } } },
      ];
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 }).exec();
    const now = new Date();
    const payload = notes.map((n) => {
      const obj = n.toObject();
      obj.isOverdue = computeIsOverdue(obj, now);
      return obj;
    });
    res.json(payload);
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



