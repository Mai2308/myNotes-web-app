import express from "express";
import { getNotes, createNote, updateNote, deleteNote, searchNotes, moveNote, toggleFavorite } from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all notes for logged-in user (optional folderId filter via ?folderId=)
router.get("/", protect, getNotes);

// Create a new note
router.post("/", protect, createNote);

// Update a note
router.put("/:id", protect, updateNote);

// Move a note to a folder
router.put("/:id/move", protect, moveNote);

// Toggle favorite status
router.put("/:id/favorite", protect, toggleFavorite);

// Delete a note
router.delete("/:id", protect, deleteNote);

// 🔍 SEARCH ROUTE
router.get("/search", protect, searchNotes);

export default router;
