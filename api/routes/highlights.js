import express from "express";
import {
  addHighlight,
  getHighlights,
  updateHighlight,
  deleteHighlight,
  clearHighlights
} from "../controllers/highlightController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Get all highlights for a note
router.get("/:id/highlights", protect, getHighlights);

// Add a highlight to a note
router.post("/:id/highlights", protect, addHighlight);

// Update a highlight
router.put("/:noteId/highlights/:highlightId", protect, updateHighlight);

// Delete a highlight
router.delete("/:noteId/highlights/:highlightId", protect, deleteHighlight);

// Clear all highlights from a note
router.delete("/:id/highlights", protect, clearHighlights);

export default router;
