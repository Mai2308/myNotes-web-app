import express from "express";
import { getNotes, createNote, updateNote, deleteNote, searchNotes, moveNote, toggleFavorite } from "../controllers/noteController.js";
import protect from "../middleware/auth.js";
import multer from 'multer';
const upload = multer({ dest: './uploads/' });

const router = express.Router();

// Get all notes for logged-in user (optional folderId filter via ?folderId=)
router.get("/", protect, getNotes);

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
router.post('/upload-voice', upload.single('audio'), (req, res) => {
  res.json({ file: req.file });
});

export default router;
