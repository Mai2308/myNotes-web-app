import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotes, deleteNote, moveNote, toggleFavorite } from "../api/notesApi";
import { useTheme } from "../context/ThemeContext";
import FolderManager from "./FolderManager";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [draggedNote, setDraggedNote] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme(); // light or dark

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      setError("");
      try {
        const data = await getNotes(token);
        setNotes(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(id, token);
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete note.");
    }
  };

  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target);
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
  };

  const handleMoveNote = async (noteId, targetFolderId) => {
    try {
      await moveNote(noteId, targetFolderId, token);
      // Refresh notes to show updated folder assignment
      const data = await getNotes(token);
      setNotes(data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to move note.");
    }
  };

  const handleToggleFavorite = async (noteId, isFavorite) => {
    try {
      await toggleFavorite(noteId, token);
      // Refresh notes to update favorite status
      const data = await getNotes(token);
      setNotes(data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to toggle favorite.");
    }
  };

  // Filter notes based on selected folder
  const filteredNotes = selectedFolderId === null
    ? notes.filter((n) => !n.folderId) // Show only root notes when "All Notes (Root)" is selected
    : notes.filter((n) => n.folderId === selectedFolderId);

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
        {/* Left sidebar - Folder Manager */}
        <div>
          <FolderManager
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onFoldersChange={() => {}}
            draggedNote={draggedNote}
            onNoteDrop={handleMoveNote}
          />
        </div>

        {/* Right content - Notes */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>
              {selectedFolderId === null ? "All Notes (Root)" : "Notes in Folder"}
            </h2>
            <button
              className={theme === "light" ? "btn-create-light" : "btn-create-dark"}
              onClick={() => navigate("/create", { state: { folderId: selectedFolderId } })}
            >
              + Create Note
            </button>
          </div>

      {loading && <p>Loading notes...</p>}
      {error && <div className="alert">{error}</div>}

      {!loading && filteredNotes.length === 0 && (
        <p style={{ color: "var(--muted)" }}>No notes in this folder. Click "Create Note" to add one.</p>
      )}

      <div className="notes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "16px" }}>
        {filteredNotes.map((note) => (
          <div
            key={note._id}
            className="card"
            draggable="true"
            onDragStart={(e) => handleDragStart(e, note)}
            onDragEnd={handleDragEnd}
            style={{
              padding: "16px",
              cursor: "grab",
              transition: "transform 0.15s ease",
              opacity: draggedNote?._id === note._id ? 0.5 : 1,
            }}
          >
            <h3 className="h2">{note.title || "Untitled"}</h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--muted)",
                overflow: "hidden",
                maxHeight: "80px",
                textOverflow: "ellipsis",
              }}
              dangerouslySetInnerHTML={{ __html: note.content || "" }}
            ></p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: 12 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(note._id, note.isFavorite);
                }}
                className="btn"
                style={{ 
                  background: note.isFavorite ? "#FFD700" : "#888", 
                  padding: "6px 12px", 
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {note.isFavorite ? "★" : "☆"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit/${note._id}`);
                }}
                className="btn"
                style={{ background: "#2196F3", padding: "6px 12px", fontSize: "13px" }}
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note._id);
                }}
                className="btn"
                style={{ background: "crimson", padding: "6px 12px", fontSize: "13px" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
}
