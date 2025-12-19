import express from "express";
import {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
  getDueFlashcards
} from "../controllers/flashcardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all flashcards for user
router.get("/", protect, getFlashcards);

// Get flashcards due for review
router.get("/due", protect, getDueFlashcards);

// Create a flashcard
router.post("/", protect, createFlashcard);

// Update a flashcard
router.put("/:id", protect, updateFlashcard);

// Delete a flashcard
router.delete("/:id", protect, deleteFlashcard);

// Review a flashcard (mark correct/incorrect)
router.post("/:id/review", protect, reviewFlashcard);

export default router;
