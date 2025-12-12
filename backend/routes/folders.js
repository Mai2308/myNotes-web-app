import express from "express";
import mongoose from "mongoose";
import Folder from "../models/folderModel.js";
import bcrypt from "bcryptjs";
import Note from "../models/noteModel.js";
import { protect } from "../middleware/authMiddleware.js";
import { ensureLockedFolder, isLockedFolder } from "../utils/lockedFolder.js";

const router = express.Router();
const { Types: { ObjectId } } = mongoose;
const SALT_ROUNDS = 10;

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

async function ensureFavoritesFolder(userId) {
  let favorites = await Folder.findOne({ user: userId, isDefault: true, name: "Favorites" });
  if (!favorites) {
    favorites = new Folder({ user: userId, name: "Favorites", parentId: null, isDefault: true });
    await favorites.save();
  }
  return favorites;
}

async function ensureDefaultFolders(userId) {
  const lockedFolder = await ensureLockedFolder(userId);
  const favoritesFolder = await ensureFavoritesFolder(userId);
  return { lockedFolder, favoritesFolder };
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
    await ensureDefaultFolders(userId);
    // Exclude passwordHash from response
    const folders = await Folder.find({ user: userId }).sort({ name: 1 }).select("-passwordHash").lean();
    res.json(folders);
  } catch (err) {
    console.error("GET /api/folders error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

/**
 * GET /api/folders/locked
 * Returns the locked folder metadata (creates it if missing)
 */
router.get("/locked", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const folder = await ensureLockedFolder(userId);
    const { passwordHash, ...safe } = folder.toObject();
    res.json({ folder: safe, hasPassword: Boolean(folder.passwordHash) });
  } catch (err) {
    console.error("GET /api/folders/locked error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

/**
 * POST /api/folders/locked/password
 * Sets the locked folder password (only if not set yet)
 */
router.post("/locked/password", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body || {};
    if (!password || typeof password !== "string" || password.length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters" });
    }

    const folder = await ensureLockedFolder(userId);
    if (folder.passwordHash) {
      return res.status(409).json({ message: "Locked folder password already set" });
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    folder.passwordHash = await bcrypt.hash(password, salt);
    folder.isProtected = true;
    await folder.save();
    const { passwordHash, ...safe } = folder.toObject();
    res.json({ message: "Locked folder password set", folder: safe });
  } catch (err) {
    console.error("POST /api/folders/locked/password error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

/**
 * POST /api/folders/locked/verify
 * Verifies the locked folder password
 */
router.post("/locked/verify", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body || {};
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password is required" });
    }

    const folder = await ensureLockedFolder(userId);
    if (!folder.passwordHash) {
      return res.status(400).json({ message: "Locked folder password not set yet" });
    }

    const ok = await bcrypt.compare(String(password), folder.passwordHash || "");
    if (!ok) return res.status(403).json({ message: "Invalid folder password" });

    const { passwordHash, ...safe } = folder.toObject();
    res.json({ message: "Password verified", folder: safe });
  } catch (err) {
    console.error("POST /api/folders/locked/verify error", err);
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
      // If folder is protected, require password via header or query
      if (folder.isProtected) {
        const supplied = req.headers["x-folder-password"] || req.query.password;
        if (!supplied) return res.status(403).json({ message: "Folder password required" });
        const ok = await bcrypt.compare(String(supplied), folder.passwordHash || "");
        if (!ok) return res.status(403).json({ message: "Invalid folder password" });
      }

      const notes = await Note.find({ folderId: folder._id, user: userId }).lean();
      const { passwordHash, ...folderSafe } = folder;
      return res.json({ folder: folderSafe, notes });
    }

    const { passwordHash, ...folderSafe } = folder;
    res.json(folderSafe);
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
    const { passwordHash, ...folderSafe } = folder.toObject();
    res.json(folderSafe);
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
    if (folder.isDefault) return res.status(400).json({ message: "Cannot delete a default folder" });

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

/**
 * POST /api/folders/:id/protect
 * Body: { password }
 * Sets or updates a folder password and marks it protected
 */
router.post("/:id/protect", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { password } = req.body || {};
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid folder id" });
    if (!password || typeof password !== "string" || password.length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters" });
    }
    const folder = await Folder.findOne({ _id: id, user: userId });
    if (!folder) return res.status(404).json({ message: "Folder not found." });
    if (isLockedFolder(folder) && folder.passwordHash) {
      return res.status(409).json({ message: "Locked folder password already set" });
    }
    const salt = await bcrypt.genSalt(10);
    folder.passwordHash = await bcrypt.hash(password, salt);
    folder.isProtected = true;
    await folder.save();
    const { passwordHash, ...folderSafe } = folder.toObject();
    res.json({ message: "Folder protected", folder: folderSafe });
  } catch (err) {
    console.error("POST /api/folders/:id/protect error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

/**
 * DELETE /api/folders/:id/protect
 * Removes protection from folder
 */
router.delete("/:id/protect", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid folder id" });
    const folder = await Folder.findOne({ _id: id, user: userId });
    if (!folder) return res.status(404).json({ message: "Folder not found." });
    if (isLockedFolder(folder)) {
      return res.status(400).json({ message: "Locked folder password cannot be removed" });
    }
    folder.isProtected = false;
    folder.passwordHash = null;
    await folder.save();
    const { passwordHash, ...folderSafe } = folder.toObject();
    res.json({ message: "Folder protection removed", folder: folderSafe });
  } catch (err) {
    console.error("DELETE /api/folders/:id/protect error", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});

export default router;