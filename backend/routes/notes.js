import express from "express";
import { getNotes, createNote, updateNote, deleteNote, searchNotes, moveNote, toggleFavorite } from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

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

// Toggle favorite status
router.post("/:id/favorite", protect, toggleFavorite);

// Delete a note
router.delete("/:id", protect, deleteNote);

export default router;
