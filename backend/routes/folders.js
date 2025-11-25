import express from "express";
import Folder from "../models/folderModel.js";
import Note from "../models/noteModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/folders
 * Lists folders for the authenticated user
 */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await Folder.find({ user }).sort({ name: 1 }).lean();
    res.json(folders);
  } catch (err) {
    console.error("GET /api/folders error", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/folders
 * Create a new folder
 * Body: { name, parentId? }
 */
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, parentId = null } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Folder name is required." });

    const folder = new Folder({ user: userId, name: name.trim(), parentId });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    console.error("POST /api/folders error", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PATCH /api/folders/:id
 * Rename or move a folder (change parentId)
 */
router.patch("/:id", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, parentId } = req.body;
    const folder = await Folder.findOne({ _id: req.params.id, user: userId });
    if (!folder) return res.status(404).json({ message: "Folder not found." });

    if (typeof name === "string") folder.name = name.trim() || folder.name;
    if (typeof parentId !== "undefined") folder.parentId = parentId || null;

    await folder.save();
    res.json(folder);
  } catch (err) {
    console.error("PATCH /api/folders/:id error", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/folders/:id
 * Default behavior: move notes to root (folderId = null) before deleting folder.
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const folder = await Folder.findOne({ _id: req.params.id, user: userId });
    if (!folder) return res.status(404).json({ message: "Folder not found." });

    // Move notes to root
    await Note.updateMany({ folderId: folder._id, user: userId }, { $set: { folderId: null } });

    await folder.deleteOne();
    res.json({ message: "Folder deleted" });
  } catch (err) {
    console.error("DELETE /api/folders/:id error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;