import React, { useState, useEffect, useCallback } from "react";
import {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getLockedFolder,
  setLockedFolderPassword,
  verifyLockedFolderPassword,
} from "../api/foldersApi";
import FolderTree from "./FolderTree";
import { useTheme } from "../context/ThemeContext";

export default function FolderManager({
  selectedFolderId,
  onSelectFolder,
  onFoldersChange,
  draggedNote,
  onNoteDrop,
}) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParentId, setNewFolderParentId] = useState(null);
  const [lockedFolder, setLockedFolder] = useState(null);
  const [lockedFolderPassword, setLockedFolderPasswordState] = useState(null);

  const { theme } = useTheme();
  const token = localStorage.getItem("token");

  const loadFolders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const locked = await getLockedFolder(token);
      setLockedFolder(locked);

      const data = await getFolders(token);
      setFolders(Array.isArray(data) ? data : []);
      if (onFoldersChange) onFoldersChange(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load folders.");
    } finally {
      setLoading(false);
    }
  }, [token, onFoldersChange]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const handleCreateFolder = async (parentId = null) => {
    setShowCreateForm(true);
    setNewFolderParentId(parentId);
    setNewFolderName("");
  };

  const confirmCreateFolder = async () => {
    if (!newFolderName.trim()) {
      window.alert("Folder name is required");
      return;
    }
    try {
      await createFolder(
        { name: newFolderName.trim(), parentId: newFolderParentId },
        token
      );
      setShowCreateForm(false);
      setNewFolderName("");
      setNewFolderParentId(null);
      await loadFolders();
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to create folder");
    }
  };

  const cancelCreateFolder = () => {
    setShowCreateForm(false);
    setNewFolderName("");
    setNewFolderParentId(null);
  };

  const handleRenameFolder = async (folderId, newName) => {
    try {
      await updateFolder(folderId, { name: newName }, token);
      await loadFolders();
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolder(folderId, token);
      if (selectedFolderId === folderId) onSelectFolder(null);
      await loadFolders();
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to delete folder");
    }
  };

  const handleSelectFolder = async (folderOrId) => {
    // Accept either a folder object or an _id string (or null for root)
    if (!folderOrId) {
      onSelectFolder(null);
      return;
    }

    let folder = null;
    if (typeof folderOrId === "string") {
      folder = folders.find((f) => String(f._id) === String(folderOrId));
      if (!folder) {
        // If we don't have the folder locally, just forward the id
        onSelectFolder(folderOrId);
        return;
      }
    } else {
      folder = folderOrId;
    }

    const isLockedFolder = lockedFolder?._id === folder._id;

    if (isLockedFolder) {
      // If we already have a cached password in this session, skip prompts
      if (!lockedFolderPassword) {
        try {
          const hasPassword = Boolean(lockedFolder?.hasPassword || lockedFolder?.passwordSet);
          if (!hasPassword) {
            // No password set yet: ask the user to set one
            const newPwd = window.prompt("No password set. Please set a password for the locked folder:");
            if (!newPwd) return;
            await setLockedFolderPassword(newPwd, token);
            setLockedFolderPasswordState(newPwd);
          } else {
            // Password exists: prompt and allow retries on incorrect attempts
            let attempts = 0;
            let pwd = window.prompt("Enter password to access locked notes:");
            if (!pwd) return;
            while (true) {
              try {
                await verifyLockedFolderPassword(pwd, token);
                setLockedFolderPasswordState(pwd);
                break;
              } catch (verifyErr) {
                attempts += 1;
                window.alert("Incorrect password. Please try again.");
                if (attempts >= 5) {
                  window.alert("Too many failed attempts. Access cancelled.");
                  return;
                }
                pwd = window.prompt("Enter password to access locked notes:");
                if (!pwd) return;
              }
            }
          }
        } catch (err) {
          window.alert(err.message || "Failed to open locked folder");
          return;
        }
      }
    }

    // Finally select the folder id
    onSelectFolder(folder._id);
  };


  return (
    <div
      className="folder-manager"
      style={{
        padding: "16px",
        backgroundColor: theme === "light" ? "#f9f9f9" : "#1a1a1a",
        borderRadius: "8px",
        minHeight: "300px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px" }}>📂 Folders</h3>
        <button
          onClick={() => handleCreateFolder(null)}
          className="btn"
          style={{
            padding: "6px 12px",
            fontSize: "13px",
            backgroundColor: theme === "light" ? "#2196F3" : "#1976D2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          + New Folder
        </button>
      </div>

      {loading && (
        <p style={{ fontSize: "14px", color: "var(--muted)" }}>
          Loading folders...
        </p>
      )}
      {error && (
        <div className="alert" style={{ padding: "8px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div
          style={{
            padding: "12px",
            backgroundColor: theme === "light" ? "#fff" : "#2a2a2a",
            border: `1px solid ${theme === "light" ? "#ddd" : "#444"}`,
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            New Folder Name:
          </label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmCreateFolder();
              if (e.key === "Escape") cancelCreateFolder();
            }}
            placeholder="Enter folder name..."
            autoFocus
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              border: `1px solid ${theme === "light" ? "#ccc" : "#555"}`,
              borderRadius: "4px",
              marginBottom: "8px",
              backgroundColor: theme === "light" ? "#fff" : "#1a1a1a",
              color: "var(--text-color)",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={confirmCreateFolder}
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Create
            </button>
            <button
              onClick={cancelCreateFolder}
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                backgroundColor: "#666",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!loading && folders.length === 0 && !showCreateForm && (
        <p style={{ fontSize: "14px", color: "var(--muted)" }}>
          No folders yet. Click "New Folder" to create one.
        </p>
      )}

      {!loading && folders.length > 0 && (
        <FolderTree
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={handleSelectFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onCreateSubfolder={handleCreateFolder}
          draggedNote={draggedNote}
          onNoteDrop={onNoteDrop}
          lockedFolderId={lockedFolder?._id}
        />
      )}
    </div>
  );
}
