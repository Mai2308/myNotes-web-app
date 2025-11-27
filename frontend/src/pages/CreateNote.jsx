import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NoteEditor from "../components/NoteEditor";
import "../styles.css";
import { createNote as apiCreateNote } from "../api/notesApi";
import { getFolders } from "../api/foldersApi";

export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const editorRef = useRef(null);
  const location = useLocation();

  // Get folderId from navigation state if passed from Dashboard
  useEffect(() => {
    if (location.state?.folderId) {
      setFolderId(location.state.folderId);
    }
  }, [location.state]);

  // Load folders for dropdown
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getFolders(token);
        setFolders(data);
      } catch (err) {
        console.error("Failed to load folders", err);
      }
    };
    loadFolders();
  }, []);

  const handleSave = async () => {
    const content = editorRef.current?.getContent() ?? "";

    if (!title.trim() && !content.trim()) {
      setError("Title or note content required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await apiCreateNote({ 
        title: title.trim(), 
        content,
        folderId: folderId || null 
      }, token);

      if (res?.message && res.message.toLowerCase().includes("error")) {
        throw new Error(res.message);
      }

      setSuccess("Note saved successfully!");
      setTitle("");
      setFolderId(null);
      editorRef.current?.clearContent();
    } catch (err) {
      setError(err.message || "Failed to save note");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  // Build folder options with hierarchy
  const buildFolderOptions = () => {
    const buildTree = (parentId, depth = 0) => {
      return folders
        .filter((f) => f.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .flatMap((folder) => [
          { ...folder, depth },
          ...buildTree(folder._id, depth + 1)
        ]);
    };
    return buildTree(null);
  };

  const folderOptions = buildFolderOptions();

  return (
    <div className="auth-page center" style={{ padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 800 }}>
        <input
          className="note-title"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Folder Selection Dropdown */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>
            Save to Folder:
          </label>
          <select
            value={folderId || ""}
            onChange={(e) => setFolderId(e.target.value || null)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              backgroundColor: "var(--background)",
              color: "var(--text-color)",
            }}
          >
            <option value="">Root (No Folder)</option>
            {folderOptions.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {"—".repeat(folder.depth)} {folder.name}
              </option>
            ))}
          </select>
        </div>

        <NoteEditor ref={editorRef} />

        {error && <div className="alert">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* Full-width Save Button */}
        <button
          className="btn"
          onClick={handleSave}
          disabled={loading}
          style={{ width: "100%", marginTop: 12 }}
        >
          {loading ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
