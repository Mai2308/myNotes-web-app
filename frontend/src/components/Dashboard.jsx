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
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { theme } = useTheme();

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
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
  };

  const handleMoveNote = async (noteId, targetFolderId) => {
    try {
      await moveNote(noteId, targetFolderId, token);
      const data = await getNotes(token);
      setNotes(data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to move note.");
    }
  };

  const handleToggleFavorite = async (noteId) => {
    try {
      // Find the note being toggled to determine if it's a copy or original
      const clickedNote = notes.find(n => n._id === noteId);
      const isClickingOnCopy = clickedNote?.sourceNoteId;
      const originalNoteId = isClickingOnCopy ? clickedNote.sourceNoteId : noteId;
      const isFavorite = clickedNote?.isFavorite;
      
      const response = await toggleFavorite(noteId, token);
      
      // Update notes list based on the response
      setNotes(prevNotes => {
        let updatedNotes = prevNotes;

        if (!isFavorite) {
          // Favoriting: Update the original note's isFavorite status
          updatedNotes = prevNotes.map(note => {
            if (note._id === originalNoteId) {
              return { ...note, isFavorite: true };
            }
            return note;
          });

          // Add the favorite copy if it was created and doesn't exist
          if (response.favoriteCopy) {
            const copyExists = updatedNotes.some(note => note._id === response.favoriteCopy._id);
            if (!copyExists) {
              updatedNotes = [...updatedNotes, response.favoriteCopy];
            }
          }
        } else {
          // Unfavoriting: Remove the copy from the list and update original's status
          updatedNotes = prevNotes
            .filter(note => {
              // Remove the favorite copy (the one in Favorites folder with sourceNoteId)
              if (note.sourceNoteId === originalNoteId) {
                return false;
              }
              // Remove the clicked copy itself if it's a copy
              if (isClickingOnCopy && note._id === noteId) {
                return false;
              }
              return true;
            })
            .map(note => {
              // Update the original note's isFavorite status
              if (note._id === originalNoteId) {
                return { ...note, isFavorite: false };
              }
              return note;
            });
        }

        return updatedNotes;
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to toggle favorite.");
    }
  };

  // ⭐⭐ البحث في عنوان ومحتوى النوت + الفلترة حسب الفولدر
  const filteredNotes = notes
    .filter((n) =>
      selectedFolderId === null ? !n.folderId : n.folderId === selectedFolderId
    )
    .filter((n) => {
      const q = searchQuery.toLowerCase();

      const titleMatch = n.title?.toLowerCase().includes(q);

      // إزالة HTML من الـ content
      const contentText = n.content
        ?.replace(/<[^>]+>/g, "")
        .toLowerCase();

      const contentMatch = contentText.includes(q);

      return titleMatch || contentMatch;
    });

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>

        {/* Sidebar */}
        <div>
          <FolderManager
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            draggedNote={draggedNote}
            onNoteDrop={handleMoveNote}
          />
        </div>

        {/* Notes Area */}
        <div>

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

          {/* 🔍 Search Box */}
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

          {/* Notes Grid */}
          <div className="notes-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
            gap: "16px"
          }}>

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