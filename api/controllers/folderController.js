import Folder from '../models/folderModel.js';
import Note from '../models/noteModel.js';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const createFolder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, parentId } = req.body;

    // Validate parentId if provided
    let parent = null;
    if (parentId) {
      if (!ObjectId.isValid(parentId)) return res.status(400).json({ message: 'Invalid parentId' });
      parent = await Folder.findById(parentId);
      if (!parent || parent.user.toString() !== userId) return res.status(403).json({ message: 'parentId not found or not owned' });
    }

    const folder = new Folder({ user: userId, name, parentId: parent ? parent._id : null });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    next(err);
  }
};

export const listFolders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Ensure Locked Notes default folder exists
    let lockedFolder = await Folder.findOne({ user: userId, isDefault: true, name: "Locked Notes" });
    if (!lockedFolder) {
      lockedFolder = new Folder({ user: userId, name: "Locked Notes", parentId: null, isDefault: true });
      await lockedFolder.save();
    }

    // Ensure Favorites default folder exists
    let favoritesFolder = await Folder.findOne({ user: userId, isDefault: true, name: "Favorites" });
    if (!favoritesFolder) {
      favoritesFolder = new Folder({ user: userId, name: "Favorites", parentId: null, isDefault: true });
      await favoritesFolder.save();
    }

    // Return all folders
    const folders = await Folder.find({ user: userId }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    next(err);
  }
};

export const getFolder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const folder = await Folder.findById(id);
    if (!folder || folder.user.toString() !== userId) return res.status(404).json({ message: 'Folder not found' });
    // Optionally populate child folders or notes
    const notes = await Note.find({ folder: folder._id, user: userId });
    res.json({ folder, notes });
  } catch (err) {
    next(err);
  }
};

export const updateFolder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, parentId } = req.body;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const folder = await Folder.findById(id);
    if (!folder || folder.user.toString() !== userId) return res.status(404).json({ message: 'Folder not found' });

    // Validate parent change and prevent cycles
    if (parentId) {
      if (!ObjectId.isValid(parentId)) return res.status(400).json({ message: 'Invalid parentId' });
      if (parentId === id) return res.status(400).json({ message: 'Cannot set parent to self' });

      let parent = await Folder.findById(parentId);
      if (!parent || parent.user.toString() !== userId) return res.status(403).json({ message: 'parentId not found or not owned' });

      // Check for cycles: walk up parents
      let cur = parent;
      while (cur) {
        if (cur._id.toString() === id) return res.status(400).json({ message: 'Cycle detected' });
        if (!cur.parentId) break;
        cur = await Folder.findById(cur.parentId);
      }

      folder.parentId = parent._id;
    } else if (parentId === null) {
      folder.parentId = null;
    }

    if (name) folder.name = name;
    await folder.save();
    res.json(folder);
  } catch (err) {
    next(err);
  }
};

export const deleteFolder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const folder = await Folder.findById(id);
    if (!folder || folder.user.toString() !== userId) return res.status(404).json({ message: 'Folder not found' });

    // Policy: set folder of contained notes to null (safer than deleting notes)
    await Note.updateMany({ folder: folder._id, user: userId }, { $set: { folder: null } });

    // Optionally: delete child folders recursively, or reparent them to folder.parentId.
    // For now, remove the folder only:
    await folder.remove();

    res.json({ message: 'Folder deleted' });
  } catch (err) {
    next(err);
  }
};