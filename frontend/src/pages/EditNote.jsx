import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NoteEditor from "../components/NoteEditor";
import { removeEmojiFromNote } from "../api/notesApi";
import ChecklistEditor from "../components/ChecklistEditor";
import "../styles.css";
import { 
  updateNote, 
  getNotes, 
  convertToChecklist, 
  convertToRegularNote,
  updateChecklistItems 
} from "../api/notesApi";
import { getFolders } from "../api/foldersApi";
import { ListTodo, FileText } from "lucide-react";

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
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [converting, setConverting] = useState(false);
  const [emojis, setEmojis] = useState([]);
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
        setIsChecklist(note.isChecklist || false);
        setChecklistItems(note.checklistItems || []);
        setEmojis(note.emojis || []);

        // Load folders
        const foldersData = await getFolders(token);
        setFolders(foldersData);
        
        // Set editor content after a small delay to ensure ref is ready
        setTimeout(() => {
          if (editorRef.current && note.content && !note.isChecklist) {
            editorRef.current.setContent(note.content);
          }
        }, 100);
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
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (isChecklist) {
        // Update checklist items first
        await updateChecklistItems(id, checklistItems, token);
        
        // Then update title and folder
        await updateNote(
          id,
          {
            title: title.trim() || "Untitled Checklist",
            folderId: folderId || null,
          },
          token
        );
      } else {
        const content = editorRef.current?.getContent() ?? "";
        
        if (!title.trim() && !content.trim()) {
          setError("Title or note content required.");
          setSaving(false);
          return;
        }

        await updateNote(
          id,
          {
            title: title.trim(),
            content,
            folderId: folderId || null,
          },
          token
        );
      }

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

  const handleConvertToChecklist = async () => {
    setConverting(true);
    setError("");
    
    try {
      const result = await convertToChecklist(id, token);
      setIsChecklist(true);
      setChecklistItems(result.note.checklistItems || []);
      setSuccess("Converted to checklist mode!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to convert to checklist");
    } finally {
      setConverting(false);
    }
  };

  const handleConvertToNote = async () => {
    setConverting(true);
    setError("");
    
    try {
      const result = await convertToRegularNote(id, token);
      setIsChecklist(false);
      setChecklistItems([]);
      
      // Reload content in editor
      setTimeout(() => {
        if (editorRef.current && result.note.content) {
          editorRef.current.setContent(result.note.content);
        }
      }, 100);
      
      setSuccess("Converted to regular note!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to convert to regular note");
    } finally {
      setConverting(false);
    }
  };

  const handleChecklistChange = (items) => {
    setChecklistItems(items);
  };

  const handleRemoveEmoji = async (emoji) => {
    try {
      const token = localStorage.getItem("token");
      const res = await removeEmojiFromNote(id, emoji, token);
      setEmojis(res.note?.emojis || emojis.filter(e => e !== emoji));
    } catch (err) {
      console.error("Failed to remove emoji", err);
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

        {/* Mode Toggle Button */}
        <div style={{ marginBottom: "16px" }}>
          <button
            className="btn mode-toggle-btn"
            onClick={isChecklist ? handleConvertToNote : handleConvertToChecklist}
            disabled={converting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: isChecklist ? "#6366f1" : "#10b981",
            }}
          >
            {isChecklist ? (
              <>
                <FileText size={18} />
                {converting ? "Converting..." : "Convert to Regular Note"}
              </>
            ) : (
              <>
                <ListTodo size={18} />
                {converting ? "Converting..." : "Convert to Checklist"}
              </>
            )}
          </button>
        </div>

        {/* Render either NoteEditor or ChecklistEditor based on mode */}
        {isChecklist ? (
          <ChecklistEditor 
            items={checklistItems} 
            onChange={handleChecklistChange}
          />
        ) : (
          <NoteEditor ref={editorRef} noteId={id} />
        )}

        {error && <div className="alert">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* Selected emojis for this note */}
        {!isChecklist && (
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 14, fontWeight: "bold", marginBottom: 6, display: "block" }}>Emojis:</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(emojis || []).length === 0 ? (
                <span style={{ opacity: 0.7 }}>No emojis yet. Use the picker to add.</span>
              ) : (
                emojis.map((e, idx) => (
                  <button
                    key={`${e}-${idx}`}
                    onClick={() => handleRemoveEmoji(e)}
                    title={`Remove ${e}`}
                    style={{
                      fontSize: 18,
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "#374151",
                      border: "1px solid var(--border-color)",
                      cursor: "pointer"
                    }}
                  >
                    {e} ✕
                  </button>
                ))
              )}
            </div>
          </div>
        )}

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
