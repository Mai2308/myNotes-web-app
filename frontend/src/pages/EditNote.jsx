import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NoteEditor from "../components/NoteEditor";
import "../styles.css";
import { updateNote, getNotes } from "../api/notesApi";
import { getFolders } from "../api/foldersApi";

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const editorRef = useRef(null);

  const token = localStorage.getItem("token");

  // Load note and folders
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load all notes and find the one we need
        const notes = await getNotes(token);
        const note = notes.find((n) => n._id === id);
        
        if (!note) {
          setError("Note not found");
          setLoading(false);
          return;
        }

        setTitle(note.title || "");
        setFolderId(note.folderId || null);
        
        // Set editor content
        if (editorRef.current && note.content) {
          editorRef.current.clearContent();
          setTimeout(() => {
            if (editorRef.current) {
              const editorElement = editorRef.current;
              const contentMethod = editorElement.setContent || editorElement.clearContent;
              // Directly access the editor div
              const editorDiv = document.querySelector('.rich-editor');
              if (editorDiv) {
                editorDiv.innerHTML = note.content;
              }
            }
          }, 100);
        }

        // Load folders
        const foldersData = await getFolders(token);
        setFolders(foldersData);
      } catch (err) {
        console.error("Failed to load note", err);
        setError("Failed to load note");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, token]);

  const handleUpdate = async () => {
    const content = editorRef.current?.getContent() ?? "";

    if (!title.trim() && !content.trim()) {
      setError("Title or note content required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateNote(
        id,
        {
          title: title.trim(),
          content,
          folderId: folderId || null,
        },
        token
      );

      setSuccess("Note updated successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to update note");
    } finally {
      setSaving(false);
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
          ...buildTree(folder._id, depth + 1),
        ]);
    };
    return buildTree(null);
  };

  const folderOptions = buildFolderOptions();

  if (loading) {
    return (
      <div className="auth-page center" style={{ padding: 20 }}>
        <p>Loading note...</p>
      </div>
    );
  }

  return (
    <div className="auth-page center" style={{ padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 800 }}>
        <h2>Edit Note</h2>
        
        <input
          className="note-title"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Folder Selection Dropdown */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
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

        <div style={{ display: "flex", gap: "12px", marginTop: 12 }}>
          <button
            className="btn"
            onClick={handleUpdate}
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? "Updating..." : "Update Note"}
          </button>
          <button
            className="btn"
            onClick={() => navigate("/dashboard")}
            style={{
              flex: "0 0 auto",
              backgroundColor: "#666",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
