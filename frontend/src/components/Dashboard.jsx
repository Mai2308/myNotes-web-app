import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotes, deleteNote, moveNote, toggleFavorite } from "../api/notesApi";
import { useTheme } from "../context/ThemeContext";
import FolderManager from "./FolderManager";
import { useView } from "../context/ViewContext";
import SortMenu from "../components/viewOptions/SortMenu";
import ViewLayoutSelector from "../components/viewOptions/ViewLayoutSelector";

export default function Dashboard() {
  const { sort, setSort , viewType} = useView();   // ⬅ تم تصحيح layout → viewType
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [draggedNote, setDraggedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { theme } = useTheme();

  const token = localStorage.getItem("token");

  /** Load notes whenever sort OR token changes */
  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      setError("");
      try {
        const data = await getNotes(token, sort); // ⬅ sort مع الـ API
        setNotes(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [sort]);

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
  };

  const handleDragEnd = () => setDraggedNote(null);

  const handleMoveNote = async (noteId, targetFolderId) => {
    try {
      await moveNote(noteId, targetFolderId, token);
      const data = await getNotes(token, sort);
      setNotes(data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to move note.");
    }
  };

  const handleToggleFavorite = async (noteId) => {
    try {
      await toggleFavorite(noteId, token);
      const data = await getNotes(token, sort);
      setNotes(data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to toggle favorite.");
    }
  };

  
  const filteredNotes = notes
    .filter((n) =>
      selectedFolderId === null ? !n.folderId : n.folderId === selectedFolderId
    )
    .filter((n) => {
      const q = searchQuery.toLowerCase();
      const titleMatch = n.title?.toLowerCase().includes(q);
      const contentText = n.content?.replace(/<[^>]+>/g, "").toLowerCase();
      const contentMatch = contentText.includes(q);
      return titleMatch || contentMatch;
    });

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>

        {/* Sidebar */}
        <FolderManager
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          draggedNote={draggedNote}
          onNoteDrop={handleMoveNote}
        />

        {/* Notes Area */}
        <div>

          {/* Sorting + Layout */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <SortMenu />
            <ViewLayoutSelector />
          </div>

          {/* Header */}
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

          {/* Search */}
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "60%",
              padding: "10px",
              margin: "0 auto 20px auto",
              display: "block",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          {loading && <p>Loading notes...</p>}
          {error && <div className="alert">{error}</div>}

          {!loading && filteredNotes.length === 0 && (
            <p style={{ color: "var(--muted)" }}>No notes found.</p>
          )}

          {/* Notes */}
          <div
            className={viewType === "grid" ? "notes-grid" : "notes-list"} // ⬅ استخدام viewType
            style={{
              display: "grid",
              gridTemplateColumns:
                viewType === "grid"
                  ? "repeat(auto-fill, minmax(250px, 1fr))"
                  : "1fr",
              gap: "16px",
            }}
          >
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
                  opacity: draggedNote?._id === note._id ? 0.5 : 1,
                }}
              >
                <h3>{note.title || "Untitled"}</h3>

                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--muted)",
                    overflow: "hidden",
                    maxHeight: "80px",
                  }}
                  dangerouslySetInnerHTML={{ __html: note.content || "" }}
                ></p>

                <div style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: 12
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(note._id);
                    }}
                    className="btn"
                    style={{
                      background: note.isFavorite ? "#FFD700" : "#888",
                      padding: "6px 12px",
                      fontSize: "13px",
                    }}
                  >
                    {note.isFavorite ? "★" : "☆"}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${note._id}`);
                    }}
                    className="btn"
                    style={{ background: "#2196F3" }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note._id);
                    }}
                    className="btn"
                    style={{ background: "crimson" }}
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


