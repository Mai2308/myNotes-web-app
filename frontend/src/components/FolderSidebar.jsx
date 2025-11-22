import React, { useState, useEffect, useCallback } from "react";
import "../styles.css";

const API_URL = "http://localhost:5000/api";

export default function FolderSidebar({ onFolderSelect, selectedFolderId }) {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchFolders = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/folders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      } else {
        console.error("Failed to fetch folders");
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setMessage("⚠️ Folder name cannot be empty");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (response.ok) {
        setMessage("✅ Folder created!");
        setNewFolderName("");
        setIsCreating(false);
        fetchFolders();
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("❌ Failed to create folder");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      setMessage("❌ Error creating folder");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleUpdateFolder = async (folderId) => {
    if (!editingFolderName.trim()) {
      setMessage("⚠️ Folder name cannot be empty");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingFolderName }),
      });

      if (response.ok) {
        setMessage("✅ Folder updated!");
        setEditingFolderId(null);
        setEditingFolderName("");
        fetchFolders();
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("❌ Failed to update folder");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error updating folder:", error);
      setMessage("❌ Error updating folder");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm("Are you sure you want to delete this folder? Notes in this folder will not be deleted.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/folders/${folderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("🗑️ Folder deleted!");
        fetchFolders();
        if (selectedFolderId === folderId) {
          onFolderSelect(null);
        }
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("❌ Failed to delete folder");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      setMessage("❌ Error deleting folder");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const startEditing = (folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const cancelEditing = () => {
    setEditingFolderId(null);
    setEditingFolderName("");
  };

  return (
    <div className="folder-sidebar">
      <div className="folder-header">
        <h3>📁 Folders</h3>
        {!isCreating && (
          <button
            className="btn-add-folder"
            onClick={() => setIsCreating(true)}
            title="Create new folder"
          >
            +
          </button>
        )}
      </div>

      {message && (
        <p className="folder-message">{message}</p>
      )}

      {isCreating && (
        <form onSubmit={handleCreateFolder} className="folder-form">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="folder-input"
            autoFocus
          />
          <div className="folder-form-buttons">
            <button type="submit" className="btn-save">✓</button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setIsCreating(false);
                setNewFolderName("");
              }}
            >
              ✕
            </button>
          </div>
        </form>
      )}

      <div className="folder-list">
        <div
          className={`folder-item ${selectedFolderId === null ? "active" : ""}`}
          onClick={() => onFolderSelect(null)}
        >
          <span>📝 All Notes</span>
        </div>

        <div
          className={`folder-item ${selectedFolderId === "unassigned" ? "active" : ""}`}
          onClick={() => onFolderSelect("unassigned")}
        >
          <span>📄 Unassigned</span>
        </div>

        {folders.map((folder) => (
          <div key={folder.id} className="folder-item-wrapper">
            {editingFolderId === folder.id ? (
              <div className="folder-form">
                <input
                  type="text"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  className="folder-input"
                  autoFocus
                />
                <div className="folder-form-buttons">
                  <button
                    className="btn-save"
                    onClick={() => handleUpdateFolder(folder.id)}
                  >
                    ✓
                  </button>
                  <button className="btn-cancel" onClick={cancelEditing}>
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`folder-item ${selectedFolderId === folder.id ? "active" : ""}`}
                onClick={() => onFolderSelect(folder.id)}
              >
                <span>📁 {folder.name}</span>
                <div className="folder-actions">
                  <button
                    className="btn-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(folder);
                    }}
                    title="Edit folder"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    title="Delete folder"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}