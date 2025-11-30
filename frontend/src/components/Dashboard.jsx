import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotes, deleteNote, moveNote, toggleFavorite, lockNote, unlockNote, removeLock } from "../api/notesApi";
import { useTheme } from "../context/ThemeContext";
import FolderManager from "./FolderManager";
import LockNoteModal from "./LockNoteModal";
import UnlockNoteModal from "./UnlockNoteModal";
import { Lock, Unlock, LockOpen } from "lucide-react";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [draggedNote, setDraggedNote] = useState(null);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [unlockedNotes, setUnlockedNotes] = useState({}); // Store temporarily unlocked notes
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

  const handleLockNote = (note) => {
    setSelectedNote(note);
    setLockModalOpen(true);
  };

  const handleUnlockNote = (note) => {
    setSelectedNote(note);
    setUnlockModalOpen(true);
  };

  const handleLock = async (lockType, password) => {
    if (!selectedNote) {
      alert("No note selected");
      return;
    }
    try {
      console.log("Locking note:", selectedNote._id, "Type:", lockType);
      await lockNote(selectedNote._id, lockType, password, token);
      const data = await getNotes(token);
      setNotes(data || []);
      alert("Note locked successfully!");
    } catch (err) {
      console.error("Lock error:", err);
      alert(err.message || "Failed to lock note");
      throw err;
    }
  };

  const handleUnlock = async (password, biometricVerified) => {
    if (!selectedNote) return;
    try {
      const result = await unlockNote(selectedNote._id, password, biometricVerified, token);
      if (result.unlocked) {
        // Store the unlocked note temporarily
        setUnlockedNotes(prev => ({
          ...prev,
          [selectedNote._id]: result.note
        }));
        alert("Note unlocked! You can now view the content.");
        // Refresh to show updated state
        const data = await getNotes(token);
        setNotes(data || []);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleRemoveLock = async (noteId, password) => {
    try {
      if (!window.confirm("Are you sure you want to remove the lock from this note?")) return;
      const note = notes.find(n => n._id === noteId);
      if (!note) return;

      if (note.lockType === "password" && !password) {
        password = prompt("Enter the password to remove the lock:");
        if (!password) return;
      }

      await removeLock(noteId, password, note.lockType === "biometric", token);
      const data = await getNotes(token);
      setNotes(data || []);
      // Remove from unlocked cache
      setUnlockedNotes(prev => {
        const updated = { ...prev };
        delete updated[noteId];
        return updated;
      });
      alert("Lock removed successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to remove lock.");
    }
  };

  const handleDelete = async (id) => {
    const note = notes.find(n => n._id === id);
    if (note?.isLocked) {
      alert("Cannot delete a locked note. Please unlock or remove the lock first.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(id, token);
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete note.");
    }
  };

  const handleEditNote = (note) => {
    if (note.isLocked) {
      alert("This note is locked. Please unlock it first to edit.");
      return;
    }
    navigate(`/edit/${note._id}`);
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
        {filteredNotes.map((note) => {
          const unlockedContent = unlockedNotes[note._id];
          const displayNote = unlockedContent || note;

          return (
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
              border: note.isLocked ? "2px solid #ff9800" : undefined,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
              <h3 className="h2" style={{ margin: 0, flex: 1 }}>{note.title || "Untitled"}</h3>
              {note.isLocked && (
                <Lock size={18} color="#ff9800" title="Locked note" />
              )}
            </div>

            {note.isLocked && !unlockedContent ? (
              <div style={{ 
                padding: "20px 10px", 
                textAlign: "center",
                color: "var(--muted)",
                background: "rgba(255, 152, 0, 0.05)",
                borderRadius: "8px",
                marginTop: "8px"
              }}>
                <Lock size={32} color="#ff9800" style={{ margin: "0 auto 8px" }} />
                <p style={{ margin: "8px 0 0", fontSize: "14px" }}>
                  🔒 This note is locked
                </p>
              </div>
            ) : note.isChecklist ? (
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span>📋</span>
                  <span style={{ fontWeight: "600" }}>Checklist</span>
                </div>
                <div style={{ fontSize: "13px" }}>
                  {displayNote.checklistItems?.filter(item => item.completed).length || 0} / {displayNote.checklistItems?.length || 0} completed
                </div>
              </div>
            ) : (
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--muted)",
                  overflow: "hidden",
                  maxHeight: "80px",
                  textOverflow: "ellipsis",
                }}
                dangerouslySetInnerHTML={{ __html: displayNote.content || "" }}
              ></p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: 12, flexWrap: "wrap" }}>
              {note.isLocked ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlockNote(note);
                    }}
                    className="btn"
                    style={{ background: "#4CAF50", padding: "6px 12px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                    title="Unlock note"
                  >
                    <Unlock size={14} />
                    Unlock
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLock(note._id, null);
                    }}
                    className="btn"
                    style={{ background: "#ff5722", padding: "6px 12px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                    title="Remove lock"
                  >
                    <LockOpen size={14} />
                    Remove Lock
                  </button>
                </>
              ) : (
                <>
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
                      handleLockNote(note);
                    }}
                    className="btn"
                    style={{ background: "#ff9800", padding: "6px 12px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                    title="Lock note"
                  >
                    <Lock size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNote(note);
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
                </>
              )}
            </div>
          </div>
        )})}
      </div>
        </div>
      </div>

      {/* Lock and Unlock Modals */}
      <LockNoteModal
        isOpen={lockModalOpen}
        onClose={() => setLockModalOpen(false)}
        onLock={handleLock}
        noteName={selectedNote?.title}
      />
      <UnlockNoteModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onUnlock={handleUnlock}
        noteName={selectedNote?.title}
        lockType={selectedNote?.lockType}
      />
    </div>
  );
}
