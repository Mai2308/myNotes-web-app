import express from "express";
import {
  getFolders,
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderNotesCount
} from "../controllers/folderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all folders for logged-in user
router.get("/", protect, getFolders);

// Get a single folder by ID
router.get("/:id", protect, getFolder);

// Create a new folder
router.post("/", protect, createFolder);

// Update a folder
router.put("/:id", protect, updateFolder);

// Delete a folder
router.delete("/:id", protect, deleteFolder);

// Get notes count for a folder
router.get("/:id/notes-count", protect, getFolderNotesCount);

export default router;