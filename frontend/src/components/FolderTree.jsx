import React, { useState, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

/**
 * FolderTree - Display folders in a hierarchical tree structure
 * Props:
 *  - folders: array of folder objects with _id, name, parentId
 *  - selectedFolderId: currently selected folder ID (or null for root)
 *  - onSelectFolder: callback when a folder is selected
 *  - onRenameFolder: callback to rename a folder
 *  - onDeleteFolder: callback to delete a folder
 *  - onCreateSubfolder: callback to create a subfolder
 *  - draggedNote: the note being dragged (if any)
 *  - onNoteDrop: callback when a note is dropped on a folder
 */
export default function FolderTree({
  folders = [],
  selectedFolderId,
  onSelectFolder,
  onRenameFolder,
  onDeleteFolder,
  onCreateSubfolder,
  draggedNote,
  onNoteDrop,
}) {
  const { theme } = useTheme();
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [dragOverFolderId, setDragOverFolderId] = useState(null);

  // Build a tree structure from flat folder list
  const folderTree = useMemo(() => {
    const buildTree = (parentId) => {
      return folders
        .filter((f) => f.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder) => ({
          ...folder,
          children: buildTree(folder._id),
        }));
    };
    return buildTree(null);
  }, [folders]);

  const toggleExpand = (folderId) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const startRename = (folder) => {
    setEditingFolderId(folder._id);
    setEditingName(folder.name);
  };

  const cancelRename = () => {
    setEditingFolderId(null);
    setEditingName("");
  };

  const confirmRename = (folderId) => {
    if (editingName.trim() && editingName !== folders.find((f) => f._id === folderId)?.name) {
      onRenameFolder(folderId, editingName.trim());
    }
    cancelRename();
  };

  const handleDragOver = (e, folderId) => {
    if (!draggedNote) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  };

  const handleDrop = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
    
    if (draggedNote && onNoteDrop) {
      onNoteDrop(draggedNote._id, folderId);
    }
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id);
    const isSelected = selectedFolderId === folder._id;
    const hasChildren = folder.children && folder.children.length > 0;
    const isEditing = editingFolderId === folder._id;

    return (
      <div key={folder._id} style={{ marginLeft: level * 20 }}>
        <div
          className={`folder-item ${isSelected ? "selected" : ""}`}
          onDragOver={(e) => handleDragOver(e, folder._id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder._id)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 8px",
            cursor: "pointer",
            backgroundColor: dragOverFolderId === folder._id
              ? theme === "light"
                ? "#c8e6c9"
                : "#2e7d32"
              : isSelected
              ? theme === "light"
                ? "#e3f2fd"
                : "#1e3a5f"
              : "transparent",
            borderRadius: "4px",
            marginBottom: "2px",
            border: dragOverFolderId === folder._id ? "2px dashed #4CAF50" : "2px solid transparent",
            transition: "all 0.2s ease",
          }}
        >
          {hasChildren && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder._id);
              }}
              style={{ marginRight: "6px", userSelect: "none", fontSize: "12px" }}
            >
              {isExpanded ? "▼" : "▶"}
            </span>
          )}
          {!hasChildren && <span style={{ width: "18px", display: "inline-block" }}></span>}

          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => confirmRename(folder._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename(folder._id);
                if (e.key === "Escape") cancelRename();
              }}
              autoFocus
              style={{
                flex: 1,
                padding: "2px 6px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "3px",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              onClick={() => onSelectFolder(folder._id)}
              style={{ flex: 1, fontSize: "14px" }}
              title={folder.name}
            >
              📁 {folder.name}
            </span>
          )}

          {!isEditing && (
            <div className="folder-actions" style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startRename(folder);
                }}
                style={{
                  padding: "2px 6px",
                  fontSize: "11px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: theme === "light" ? "#555" : "#aaa",
                }}
                title="Rename"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateSubfolder(folder._id);
                }}
                style={{
                  padding: "2px 6px",
                  fontSize: "11px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: theme === "light" ? "#555" : "#aaa",
                }}
                title="Add subfolder"
              >
                ➕
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete folder "${folder.name}"?`)) {
                    onDeleteFolder(folder._id);
                  }
                }}
                style={{
                  padding: "2px 6px",
                  fontSize: "11px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "crimson",
                }}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {isExpanded &&
          hasChildren &&
          folder.children.map((child) => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="folder-tree">
      <div
        className={`folder-item ${selectedFolderId === null ? "selected" : ""}`}
        onDragOver={(e) => handleDragOver(e, null)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, null)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 8px",
          cursor: "pointer",
          backgroundColor: dragOverFolderId === null
            ? theme === "light"
              ? "#c8e6c9"
              : "#2e7d32"
            : selectedFolderId === null
            ? theme === "light"
              ? "#e3f2fd"
              : "#1e3a5f"
            : "transparent",
          borderRadius: "4px",
          marginBottom: "6px",
          fontWeight: "bold",
          border: dragOverFolderId === null ? "2px dashed #4CAF50" : "2px solid transparent",
          transition: "all 0.2s ease",
        }}
        onClick={() => onSelectFolder(null)}
      >
        📂 All Notes (Root)
      </div>
      {folderTree.map((folder) => renderFolder(folder, 0))}
    </div>
  );
}
