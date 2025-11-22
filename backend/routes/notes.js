import express from "express";
import { getNotes, createNote, updateNote, deleteNote, searchNotes, getFavouriteNotes, toggleFavourite } from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all notes for logged-in user
router.get("/", protect, getNotes);

// Get all favourite notes for logged-in user
router.get("/favourites", protect, getFavouriteNotes);

// Search notes by keyword (title only)
router.get("/search", protect, searchNotes);

// Create a new note
router.post("/", protect, createNote);

// Update a note
router.put("/:id", protect, updateNote);

// Toggle favourite status
router.patch("/:id/favourite", protect, toggleFavourite);

// Delete a note
router.delete("/:id", protect, deleteNote);

export default router;
