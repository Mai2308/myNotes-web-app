import express from "express";
import mongoose from "mongoose";
import Folder from "../models/folderModel.js";
import Note from "../models/noteModel.js";
import protect from "../middleware/auth.js";

const router = express.Router();
const { Types: { ObjectId } } = mongoose;

/**
 * Helper: ensure parent exists and is owned by user
 */
async function validateParent(parentId, userId) {
  if (!parentId) return null;
  if (!ObjectId.isValid(parentId)) throw { status: 400, message: "Invalid parentId" };
  const parent = await Folder.findById(parentId);
  if (!parent) throw { status: 404, message: "Parent folder not found" };
  if (parent.user.toString() !== userId) throw { status: 403, message: "Parent folder not owned by user" };
  return parent;
}

/**
 * Helper: detect cycle - returns true if candidateParent is a descendant of folderId
 */
async function wouldCreateCycle(folderId, candidateParentId) {
  let curId = candidateParentId;
  while (curId) {
    if (!ObjectId.isValid(curId)) break;
    if (curId.toString() === folderId.toString()) return true;
    const cur = await Folder.findById(curId).select("parentId");
    if (!cur) break;
    curId = cur.parentId;
  }
  return false;
}

/**
 * GET /api/folders
 * Lists folders for the authenticated user
 */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await Folder.find({ user: userId }).sort({ name: 1 }).lean();
    res.json(folders);
  } catch (err) {
    console.error("GET /api/folders error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

/**
 * GET /api/folders/:id
 * Get a single folder (optionally include notes with ?includeNotes=true)
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid folder id" });

    const folder = await Folder.findOne({ _id: id, user: userId }).lean();
    if (!folder) return res.status(404).json({ message: "Folder not found." });

    if (req.query.includeNotes === "true") {
      const notes = await Note.find({ folderId: folder._id, user: userId }).lean();
      return res.json({ folder, notes });
    }

    res.json(folder);
  } catch (err) {
    console.error("GET /api/folders/:id error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
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

    // validate parent ownership/existence
    let parent = null;
    if (parentId) parent = await validateParent(parentId, userId);

    const folder = new Folder({ user: userId, name: name.trim(), parentId: parent ? parent._id : null });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    console.error("POST /api/folders error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
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
    const { id } = req.params;

    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid folder id" });

    const folder = await Folder.findOne({ _id: id, user: userId });
    if (!folder) return res.status(404).json({ message: "Folder not found." });

    if (typeof name === "string") folder.name = name.trim() || folder.name;

    if (typeof parentId !== "undefined") {
      // allow explicit null to move to root
      if (parentId === null || parentId === "") {
        folder.parentId = null;
      } else {
        if (!ObjectId.isValid(parentId)) return res.status(400).json({ message: "Invalid parentId" });
        if (parentId.toString() === id.toString()) return res.status(400).json({ message: "Cannot set parent to self" });

        // verify parent exists and is owned
        const parent = await Folder.findById(parentId);
        if (!parent || parent.user.toString() !== userId) return res.status(403).json({ message: "Parent folder not found or not owned" });

        // check for cycles
        const createsCycle = await wouldCreateCycle(id, parentId);
        if (createsCycle) return res.status(400).json({ message: "Setting this parent would create a cycle" });

        folder.parentId = parent._id;
      }
    }

    await folder.save();
    res.json(folder);
  } catch (err) {
    console.error("PATCH /api/folders/:id error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

/**
 * DELETE /api/folders/:id
 * Behavior:
 *  - reparent child folders to this folder's parent (keeps tree intact)
 *  - move notes in this folder to root (folderId = null)
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid folder id" });

    const folder = await Folder.findOne({ _id: id, user: userId });
    if (!folder) return res.status(404).json({ message: "Folder not found." });

    // Reparent child folders to this folder's parent
    await Folder.updateMany({ parentId: folder._id, user: userId }, { $set: { parentId: folder.parentId || null } });

    // Move notes to root (set folderId to null)
    await Note.updateMany({ folderId: folder._id, user: userId }, { $set: { folderId: null } });

    await folder.deleteOne();
    res.json({ message: "Folder deleted" });
  } catch (err) {
    console.error("DELETE /api/folders/:id error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

export default router;