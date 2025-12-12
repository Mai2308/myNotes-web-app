import express from "express";
import { 
  getNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  searchNotes, 
  moveNote, 
  lockNote,
  toggleFavorite,
  convertToChecklist,
  convertToRegularNote,
  updateChecklistItems,
  toggleChecklistItem,
} from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";
import { addEmojiToNote, removeEmojiFromNote } from "../controllers/noteController.js";

const router = express.Router();

// Get all notes for logged-in user (optional folderId filter via ?folderId=)
router.get("/", protect, getNotes);

// Search notes by keyword (title only)
router.get("/search", protect, searchNotes);

// Create a new note
router.post("/", protect, createNote);

// Update a note
router.put("/:id", protect, updateNote);

// Move a note to a folder
router.patch("/:id/move", protect, moveNote);

// Move a note into the locked folder
router.post("/:id/lock", protect, lockNote);

// Toggle favorite status
router.post("/:id/favorite", protect, toggleFavorite);

// Checklist operations
router.post("/:id/checklist/convert", protect, convertToChecklist);
router.post("/:id/checklist/revert", protect, convertToRegularNote);
router.put("/:id/checklist/items", protect, updateChecklistItems);
router.patch("/:id/checklist/toggle", protect, toggleChecklistItem);

// Emoji metadata operations
router.post("/:id/emojis", protect, addEmojiToNote);
router.delete("/:id/emojis/:emoji", protect, removeEmojiFromNote);


// Delete a note
router.delete("/:id", protect, deleteNote);

// 🔍 SEARCH ROUTE
router.get("/search", protect, searchNotes);

export default router;
