import { FolderModel } from "../models/folderModel.js";

// Get all folders for the logged-in user
export const getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await FolderModel.getFoldersByUserId(userId);
    res.json(folders);
  } catch (error) {
    console.error("❌ Error getting folders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single folder by ID
export const getFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.params.id;
    
    const folder = await FolderModel.getFolderById(folderId, userId);
    
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    
    res.json(folder);
  } catch (error) {
    console.error("❌ Error getting folder:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new folder
export const createFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await FolderModel.createFolder(name.trim(), userId);
    res.status(201).json({ message: "✅ Folder created successfully!", folder });
  } catch (error) {
    console.error("❌ Error creating folder:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a folder
export const updateFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.params.id;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await FolderModel.updateFolder(folderId, name.trim(), userId);
    
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.json({ message: "✅ Folder updated successfully!", folder });
  } catch (error) {
    console.error("❌ Error updating folder:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a folder
export const deleteFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.params.id;

    const rowsAffected = await FolderModel.deleteFolder(folderId, userId);
    
    if (rowsAffected === 0) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.json({ message: "🗑️ Folder deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting folder:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get notes count for a folder
export const getFolderNotesCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.params.id;

    const count = await FolderModel.getNotesCountByFolder(folderId, userId);
    res.json({ count });
  } catch (error) {
    console.error("❌ Error getting folder notes count:", error);
    res.status(500).json({ message: "Server error" });
  }
};
