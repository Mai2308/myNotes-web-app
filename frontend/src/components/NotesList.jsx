import React, { useState, useEffect } from "react";
import "../styles.css";

export default function NotesList({ selectedFolderId, onNoteChange }) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "", folderId: null });
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchNotes();
    fetchFolders();
  }, [selectedFolderId]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = `${API_URL}/notes`;
      
      if (selectedFolderId) {
        url += `?folderId=${selectedFolderId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        console.error("Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const fetchFolders = async () => {
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
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage("⚠️ Title is required");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          folderId: formData.folderId || null,
        }),
      });

      if (response.ok) {
        setMessage("✅ Note created!");
        setFormData({ title: "", content: "", folderId: null });
        setIsCreating(false);
        fetchNotes();
        if (onNoteChange) onNoteChange();
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("❌ Failed to create note");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      setMessage("❌ Error creating note");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage("⚠️ Title is required");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/notes/${editingNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          folderId: formData.folderId || null,
        }),
      });

      if (response.ok) {
        setMessage("✅ Note updated!");
        setEditingNote(null);
        setFormData({ title: "", content: "", folderId: null });
        fetchNotes();
        if (onNoteChange) onNoteChange();
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("❌ Failed to update note");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error updating note:", error);
      setMessage("❌ Error updating note");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("🗑️ Note deleted!");
        fetchNotes();
        if (onNoteChange) onNoteChange();
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("❌ Failed to delete note");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setMessage("❌ Error deleting note");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const startEditing = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || "",
      content: note.content || "",
      folderId: note.folderId || null,
    });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setFormData({ title: "", content: "", folderId: null });
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingNote(null);
    setFormData({
      title: "",
      content: "",
      folderId: selectedFolderId && selectedFolderId !== "unassigned" ? selectedFolderId : null,
    });
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setFormData({ title: "", content: "", folderId: null });
  };

  return (
    <div className="notes-list">
      <div className="notes-header">
        <h2>
          {selectedFolderId === null
            ? "📝 All Notes"
            : selectedFolderId === "unassigned"
            ? "📄 Unassigned Notes"
            : `📁 ${notes[0]?.folderName || "Notes"}`}
        </h2>
        {!isCreating && !editingNote && (
          <button className="btn btn-primary" onClick={startCreating}>
            + New Note
          </button>
        )}
      </div>

      {message && <p className="note-message">{message}</p>}

      {(isCreating || editingNote) && (
        <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote} className="note-form">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Note title"
            className="note-input"
            autoFocus
          />
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Note content"
            className="note-textarea"
            rows="6"
          />
          <select
            value={formData.folderId || ""}
            onChange={(e) => setFormData({ ...formData, folderId: e.target.value || null })}
            className="note-select"
          >
            <option value="">No Folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <div className="note-form-buttons">
            <button type="submit" className="btn btn-primary">
              {editingNote ? "Update" : "Create"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={editingNote ? cancelEditing : cancelCreating}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="no-notes">No notes found. Create your first note!</p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-card-header">
                <h3>{note.title || "Untitled"}</h3>
                <div className="note-card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => startEditing(note)}
                    title="Edit note"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDeleteNote(note.id)}
                    title="Delete note"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="note-content">{note.content || "No content"}</p>
              <div className="note-footer">
                {note.folderName && (
                  <span className="note-folder">📁 {note.folderName}</span>
                )}
                <span className="note-date">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
