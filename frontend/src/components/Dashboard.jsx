import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNotes, getNotesByFolder, deleteNote, moveNote, toggleFavorite, lockNote } from "../api/notesApi";
import { useTheme } from "../context/ThemeContext";
import { getFolder, getLockedFolder, setLockedFolderPassword, verifyLockedFolderPassword } from "../api/foldersApi";
import FolderManager from "./FolderManager";
import SearchBar from "./SearchBar";


export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [draggedNote, setDraggedNote] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folderPasswords, setFolderPasswords] = useState({}); // folderId -> password entered this session
  const [lockedFolderId, setLockedFolderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState(null); // { top, left } for fixed positioning
  const menuButtonRefs = useRef({});

  const navigate = useNavigate();
  const { theme } = useTheme();

  const token = localStorage.getItem("token");

  // Ensure locked folder metadata is known on mount
  useEffect(() => {
    const loadLocked = async () => {
      try {
        const data = await getLockedFolder(token);
        if (data?.folder?._id) setLockedFolderId(data.folder._id);
      } catch (err) {
        console.error("Failed to preload locked folder", err);
      }
    };
    loadLocked();
  }, [token]);

  // When selected folder changes or on mount, fetch appropriate notes
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");

      try {
        // Root view: load all visible notes
        if (selectedFolderId === null) {
          const data = await getNotes(token);
          setNotes(data || []);
          return;
        }

        const folder = folders.find((f) => f._id === selectedFolderId);
        if (!folder) return;

        const isLockedFolder = folder.isDefault && folder.name === "Locked Notes";

        // Locked folder flow
        if (isLockedFolder) {
          // Always fetch fresh locked folder state from backend
          let currentLocked = { id: selectedFolderId, hasPassword: false };
          try {
            const data = await getLockedFolder(token);
            if (data?.folder?._id) {
              currentLocked = { id: data.folder._id, hasPassword: Boolean(data.hasPassword) };
              setLockedFolderId(data.folder._id);
            }
          } catch (err) {
            console.error("Failed to refresh locked folder", err);
            setError("Failed to load locked folder");
            setSelectedFolderId(null);
            return;
          }

          const lockedId = currentLocked.id;
          
          // Always prompt for password (don't use cache)
          // This ensures password is requested every time
          let password = null;

          if (!currentLocked.hasPassword) {
            const pwd = window.prompt("Set a password for Locked Notes (min 4 characters):");
            if (!pwd || pwd.length < 4) {
              setSelectedFolderId(null);
              setError("Locked Notes requires a password (min 4 chars).");
              return;
            }
            await setLockedFolderPassword(pwd, token);
            password = pwd;
          } else {
            // Password exists, always prompt to enter it
            const pwd = window.prompt("Enter password for Locked Notes:");
            if (!pwd) {
              setSelectedFolderId(null);
              return;
            }
            try {
              await verifyLockedFolderPassword(pwd, token);
              password = pwd;
            } catch (err) {
              setError("Invalid password");
              setSelectedFolderId(null);
              return;
            }
          }

          // Don't cache the password - always require re-entry
          const { notes: folderNotes } = await getFolder(lockedId, { includeNotes: true, password }, token);
          setNotes(folderNotes || []);
          return;
        }

        // Generic protected folder flow
        if (folder.isProtected) {
          let password = folderPasswords[folder._id];
          if (!password) {
            const pwd = window.prompt(`This folder ("${folder.name}") is protected. Enter password:`);
            if (!pwd) {
              setSelectedFolderId(null);
              return;
            }
            password = pwd;
          }
          const { notes: folderNotes } = await getFolder(folder._id, { includeNotes: true, password }, token);
          setFolderPasswords((prev) => ({ ...prev, [folder._id]: password }));
          setNotes(folderNotes || []);
          return;
        }

        // Unprotected folder
        const folderNotes = await getNotesByFolder(selectedFolderId, token);
        setNotes(folderNotes || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load notes");
        setSelectedFolderId(null);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolderId, token, folders]);

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
      // If moving a note out of locked folder, force re-prompt by clearing cache
      if (lockedFolderId && targetFolderId !== lockedFolderId && selectedFolderId === lockedFolderId) {
        setFolderPasswords({});
        setSelectedFolderId(null);
      } else {
        const data = await getNotes(token);
        setNotes(data || []);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to move note.");
    }
  };

  const handleLockNote = async (noteId) => {
    try {
      const result = await lockNote(noteId, token);
      if (result?.lockedFolderId) {
        setLockedFolderId(result.lockedFolderId);
        // Clear password cache for locked folder
        setFolderPasswords({});
      }
      // Remove from current view (will appear when user opens locked folder)
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      // Force password re-prompt by resetting to root
      setSelectedFolderId(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to lock note.");
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

  const closeMenu = () => {
    setOpenMenuId(null);
    setMenuPos(null);
  };

  const handleDelete = async (id) => {
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
    navigate(`/edit/${note._id}`, { state: { note } });
  };

  // Filter notes based on selected folder + search term
  let filteredNotes = selectedFolderId === null
    ? notes.filter((n) => !n.folderId) // Show only root notes when "All Notes (Root)" is selected
    : notes.filter((n) => n.folderId === selectedFolderId);

  if (searchTerm && searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filteredNotes = filteredNotes.filter((n) => {
      const title = String(n.title || "").toLowerCase();
      const content = String(n.content || n.context || "").toLowerCase();
      return title.includes(q) || content.includes(q);
    });
  }

  return (
    <div className="container" style={{ paddingTop: "40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>

        {/* Sidebar */}
        <div>
          <FolderManager
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onFoldersChange={setFolders}
            draggedNote={draggedNote}
            onNoteDrop={handleMoveNote}
          />
        </div>

        {/* Notes Area */}
        <div>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: 0 }}>
              {selectedFolderId === null ? "All Notes (Root)" : "Notes in Folder"}
            </h2>
            {/* Search bar */}
            <div style={{ width: 320 }}>
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={theme === "light" ? "btn-create-light" : "btn-create-dark"}
                onClick={() => navigate("/create", { state: { folderId: selectedFolderId } })}
              >
                + Create Note
              </button>
            </div>
          </div>

      {loading && <p>Loading notes...</p>}
      {error && <div className="alert">{error}</div>}

      {!loading && filteredNotes.length === 0 && (
        <p style={{ color: "var(--muted)" }}>No notes in this folder. Click "Create Note" to add one.</p>
      )}

      <div className="notes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "16px" }}>
        {filteredNotes.map((note) => {
          const displayNote = note;

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
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
              <h3 className="h2" style={{ margin: 0, flex: 1 }}>{note.title || "Untitled"}</h3>
              
              {/* Three-dot menu */}
              <div style={{ position: "relative" }}>
                <button
                  ref={(el) => {
                    if (el) menuButtonRefs.current[note._id] = el;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (openMenuId === note._id) {
                      setOpenMenuId(null);
                      setMenuPos(null);
                    } else {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMenuPos({
                        top: rect.bottom + window.scrollY + 4,
                        left: rect.right + window.scrollX - 140,
                      });
                      setOpenMenuId(note._id);
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "0 4px",
                  }}
                  title="More options"
                >
                  ⋯
                </button>
              </div>
            </div>

            {note.isChecklist ? (
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
          </div>
        )})}
      </div>

      {/* Fixed menu overlay - rendered outside the grid */}
      {openMenuId && menuPos && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            closeMenu();
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          {/* Menu container */}
          {filteredNotes.find(n => n._id === openMenuId) && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: `${menuPos.top}px`,
                left: `${menuPos.left}px`,
                background: theme === "light" ? "#fff" : "#2a2a2a",
                border: `1px solid ${theme === "light" ? "#ddd" : "#555"}`,
                borderRadius: "4px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                zIndex: 10000,
                minWidth: "140px",
              }}
            >
              {(() => {
                const note = filteredNotes.find(n => n._id === openMenuId);
                if (!note) return null;
                return (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditNote(note);
                        closeMenu();
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        borderBottom: `1px solid ${theme === "light" ? "#eee" : "#444"}`,
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(note._id);
                        closeMenu();
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        borderBottom: `1px solid ${theme === "light" ? "#eee" : "#444"}`,
                      }}
                    >
                      {note.isFavorite ? "★ Unfavorite" : "☆ Favorite"}
                    </button>
                    {!(lockedFolderId && note.folderId === lockedFolderId) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLockNote(note._id);
                          closeMenu();
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "14px",
                          borderBottom: `1px solid ${theme === "light" ? "#eee" : "#444"}`,
                        }}
                      >
                        🔒 Lock
                      </button>
                    )}
                    {lockedFolderId && note.folderId === lockedFolderId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveNote(note._id, null);
                          closeMenu();
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "14px",
                          borderBottom: `1px solid ${theme === "light" ? "#eee" : "#444"}`,
                        }}
                      >
                        🔓 Unlock
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note._id);
                        closeMenu();
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "crimson",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

        </div>
      </div>
    </div>
  );
}