import express from "express";
import { getNotes, createNote, updateNote, deleteNote, searchNotes, reorderNotes } from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all notes for logged-in user
router.get("/", protect, getNotes);

// Search notes by keyword (title only)
router.get("/search", protect, searchNotes);

// Create a new note
router.post("/", protect, createNote);

// Update a note
router.put("/:id", protect, updateNote);

// Delete a note
router.delete("/:id", protect, deleteNote);

router.post("/reorder", protect, reorderNotes);

export default router;
