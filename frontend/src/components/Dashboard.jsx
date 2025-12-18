import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotes,
  deleteNote,
  moveNote,
  toggleFavorite,
} from "../api/notesApi";
import {
  
  getLockedFolder,
 
  verifyLockedFolderPassword,
} from "../api/foldersApi";
import { getUpcomingReminders, getOverdueNotes } from "../api/remindersApi";
import FolderManager from "./FolderManager";
import { useTheme } from "../context/ThemeContext";
import { useView } from "../context/ViewContext";
import SortMenu from "./viewOptions/SortMenu";
import ViewLayoutSelector from "./viewOptions/ViewLayoutSelector";
import { Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { sort, viewType } = useView();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // strip HTML to plain text for previews
  const stripHtml = (html = "") =>
    String(html)
      .replace(/<br\s*\/?>(\s*)/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

  const renderPreview = (note) => {
    if (!note) return "";
    if (note.isChecklist && Array.isArray(note.checklistItems) && note.checklistItems.length > 0) {
      return note.checklistItems
        .slice(0, 3)
        .map((it) => (it.completed ? "✓ " : "") + (it.text || ""))
        .join(" • ");
    }
    const text = stripHtml(note.content || "");
    if (!text) return "";
    const max = 140;
    return text.length > max ? text.slice(0, max).trim() + "…" : text;
  };

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [draggedNote, setDraggedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favPending, setFavPending] = useState(new Set());

  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderError, setReminderError] = useState("");

  const [lockedFolderId, setLockedFolderId] = useState(null);
  const [lockedFolderPassword, setLockedFolderPasswordState] = useState(null);

  const token = localStorage.getItem("token");
  const requestIdRef = useRef(0);
  const debounceRef = useRef(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const menuButtonRefs = useRef({});
  const menuRef = useRef(null);

  const getNextDueDate = useCallback((note) => {
    if (!note) return null;
    const dates = [];
    if (note.reminderDate) {
      const d = new Date(note.reminderDate);
      if (!isNaN(d)) dates.push(d);
    }
    if (note.deadline) {
      const d = new Date(note.deadline);
      if (!isNaN(d)) dates.push(d);
    }
    if (!dates.length) return null;
    return new Date(Math.min(...dates.map((d) => d.getTime())));
  }, []);

  const formatDueDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDueLabel = useCallback((note) => {
    if (!note) return "";
    const reminderAt = note.reminderDate ? new Date(note.reminderDate) : null;
    const deadlineAt = note.deadline ? new Date(note.deadline) : null;
    if (deadlineAt && !isNaN(deadlineAt)) {
      if (!reminderAt || deadlineAt <= reminderAt) return "Deadline";
    }
    return note.reminderDate ? "Reminder" : "";
  }, []);

  // Load locked folder info on mount
  useEffect(() => {
    if (!token) return;
    getLockedFolder(token)
      .then((folder) => {
        setLockedFolderId(folder._id);
      })
      .catch((err) => console.error("Failed to get locked folder:", err));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setReminderLoading(true);
    setReminderError("");

    Promise.all([getUpcomingReminders(token), getOverdueNotes(token)])
      .then(([upcomingRes, overdueRes]) => {
        setUpcomingReminders(upcomingRes?.reminders || []);
        setOverdueItems(overdueRes?.overdueNotes || []);
      })
      .catch((err) => {
        console.error("Failed to load reminders/deadlines", err);
        setReminderError("Could not load reminders and deadlines");
      })
      .finally(() => setReminderLoading(false));
  }, [token]);

  const applySort = useCallback(
    (list = [], sortMode) => {
      if (!sortMode) return [...list];
      const copy = [...list];
      const getTime = (n) =>
        new Date(n?.createdAt || n?.updatedAt || 0).getTime();

      switch (sortMode) {
        case "newest":
          return copy.sort((a, b) => getTime(b) - getTime(a));
        case "oldest":
          return copy.sort((a, b) => getTime(a) - getTime(b));
        case "title_asc":
          return copy.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        case "title_desc":
          return copy.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        case "favorite":
          return copy.sort((a, b) => {
            const favDiff =
              (b.isFavorite === true ? 1 : 0) - (a.isFavorite === true ? 1 : 0);
            return favDiff !== 0 ? favDiff : getTime(b) - getTime(a);
          });
        default:
          return copy;
      }
    },
    []
  );

  // Fetch notes
  useEffect(() => {
    if (!token) return;

    setNotes((prev) => applySort(prev, sort));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const myReq = ++requestIdRef.current;
      setLoading(true);
      setError("");

      getNotes(token, { sort, folderId: selectedFolderId, q: searchQuery })
        .then((data) => {
          if (myReq !== requestIdRef.current) return; // stale
          setNotes(applySort(data || [], sort));
        })
        .catch((err) => {
          console.error("fetchNotes error:", err);
          if (myReq === requestIdRef.current) setError("Failed to load notes.");
        })
        .finally(() => {
          if (myReq === requestIdRef.current) setLoading(false);
        });
    }, 120);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [token, sort, selectedFolderId, searchQuery, applySort]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this note?")) return;
      try {
        await deleteNote(id, token);
        setNotes((prev) => prev.filter((n) => n._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete note.");
      }
    },
    [token]
  );

  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    if (e && e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => setDraggedNote(null);
  
const handleMoveNote = useCallback(
  async (noteId, targetFolderId) => {
    try {
      await moveNote(noteId, targetFolderId, token);
      setNotes((prev) =>
        prev.map((n) =>
          n._id === noteId ? { ...n, folderId: targetFolderId } : n
        )
      );

      const data = await getNotes(token, {
        sort,
        folderId: selectedFolderId,
        q: searchQuery,
      });
      setNotes(applySort(data || [], sort));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to move note.");
    }
  },
  [token, sort, selectedFolderId, searchQuery, applySort]
);


  const handleToggleFavorite = useCallback(
    async (noteId) => {
      if (favPending.has(noteId)) return;
      setFavPending((s) => new Set(s).add(noteId));

      try {
        setNotes((prev) =>
          prev.map((n) =>
            n._id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
          )
        );

        await toggleFavorite(noteId, token);
      } catch (err) {
        console.error("toggleFavorite failed:", err);
        setNotes((prev) =>
          prev.map((n) =>
            n._id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
          )
        );
        alert(err.message || "Failed to toggle favorite.");
      } finally {
        setFavPending((s) => {
          const next = new Set(s);
          next.delete(noteId);
          return next;
        });
      }
    },
    [favPending, token]
  );

  const filteredNotes = notes
    .filter((n) =>
      selectedFolderId === null ? !n.folderId : String(n.folderId) === String(selectedFolderId)
    )
    .filter((n) => {
      const q = (searchQuery || "").toLowerCase();
      if (!q) return true;
      const titleMatch = (n.title || "").toLowerCase().includes(q);
      const contentText = (n.content || "").replace(/<[^>]+>/g, "").toLowerCase();
      const contentMatch = contentText.includes(q);
      return titleMatch || contentMatch;
    });

  const closeMenu = () => {
    setOpenMenuId(null);
    setMenuPos(null);
  };

  // attach outside-click close behavior
  useOutsideMenuClose(openMenuId, menuRef, menuButtonRefs, closeMenu);

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        <FolderManager
          selectedFolderId={selectedFolderId}
          onSelectFolder={(folderId) => {
            // FolderManager handles locked-folder prompts; just set selection here
            setSelectedFolderId(folderId);
          }}
          draggedNote={draggedNote}
          onNoteDrop={handleMoveNote}
        />

        <div>
          <div className="card" style={{ marginBottom: 16, padding: 8, border: "1px solid var(--border-color)", boxShadow: "var(--shadow)", maxHeight: 220, overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h4 style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>Reminders & Deadlines</h4>
              {reminderLoading && <span style={{ fontSize: 9, color: "var(--muted)" }}>Loading…</span>}
            </div>
            {reminderError && <div className="alert" style={{ marginBottom: 4, fontSize: 11, padding: 4 }}>{reminderError}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <strong style={{ fontSize: 11 }}>Upcoming</strong>
                  <span style={{ fontSize: 9, color: "var(--muted)" }}>{upcomingReminders.length}</span>
                </div>
                {upcomingReminders.length === 0 ? (
                  <p style={{ color: "var(--muted)", margin: 0, fontSize: 10 }}>No upcoming.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {upcomingReminders.slice(0, 2).map((item) => {
                      const due = getNextDueDate(item);
                      return (
                        <button
                          key={item._id}
                          onClick={() => navigate(`/edit/${item._id}`)}
                          style={{
                            textAlign: "left",
                            padding: "4px 6px",
                            borderRadius: 4,
                            border: "1px solid var(--border-color)",
                            background: "linear-gradient(135deg, rgba(122,252,255,0.08), rgba(122,252,255,0.04))",
                            color: "inherit",
                            cursor: "pointer",
                            fontSize: 10,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                            <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{item.title || "Untitled"}</span>
                            <span style={{ fontSize: 8, color: "var(--muted)", whiteSpace: "nowrap" }}>{getDueLabel(item)}</span>
                          </div>
                          <div style={{ fontSize: 8, marginTop: 1, display: "flex", alignItems: "center", gap: 2, color: "var(--muted)" }}>
                            <Clock size={8} /> {formatDueDate(due)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <strong style={{ fontSize: 11, color: "#dc2626" }}>Overdue</strong>
                  <span style={{ fontSize: 9, color: "var(--muted)" }}>{overdueItems.length}</span>
                </div>
                {overdueItems.length === 0 ? (
                  <p style={{ color: "var(--muted)", margin: 0, fontSize: 10 }}>No overdue.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {overdueItems.slice(0, 2).map((item) => {
                      const due = getNextDueDate(item);
                      return (
                        <button
                          key={item._id}
                          onClick={() => navigate(`/edit/${item._id}`)}
                          style={{
                            textAlign: "left",
                            padding: "4px 6px",
                            borderRadius: 4,
                            border: "1px solid rgba(220,38,38,0.3)",
                            background: "linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.06))",
                            color: "inherit",
                            cursor: "pointer",
                            fontSize: 10,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                            <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{item.title || "Untitled"}</span>\n                            <span style={{ fontSize: 8, color: "#dc2626" }}>{getDueLabel(item)}</span>
                          </div>
                          <div style={{ fontSize: 8, marginTop: 1, display: "flex", alignItems: "center", gap: 2, color: "var(--muted)" }}>
                            <AlertCircle size={8} /> {formatDueDate(due)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <SortMenu />
            <ViewLayoutSelector />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <h2 style={{ margin: 0 }}>
              {selectedFolderId === null ? "All Notes (Root)" : "Notes in Folder"}
            </h2>
            <button
              className={theme === "light" ? "btn-create-light" : "btn-create-dark"}
              onClick={() =>
                navigate("/create", { state: { folderId: selectedFolderId } })
              }
            >
              + Create Note
            </button>
          </div>

          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "60%",
              padding: 10,
              margin: "0 auto 20px auto",
              display: "block",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          {loading && <p>Loading notes...</p>}
          {error && <div className="alert">{error}</div>}
          {!loading && filteredNotes.length === 0 && (
            <p style={{ color: "var(--muted)" }}>No notes found.</p>
          )}

          <div
            className={viewType === "grid" ? "notes-grid" : "notes-list"}
            style={{
              display: "grid",
              gridTemplateColumns:
                viewType === "grid" ? "repeat(auto-fill, minmax(200px, 1fr))" : "1fr",
              gap: 12,
              maxWidth: "1200px",
            }}
          >
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={`card ${note.isOverdue ? "overdue-note" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, note)}
                onDragEnd={handleDragEnd}
                style={{
                  padding: 12,
                  cursor: "grab",
                  opacity: draggedNote?._id === note._id ? 0.5 : 1,
                  minHeight: "200px",
                  position: "relative",
                  borderLeft: note.isOverdue ? "4px solid #dc2626" : undefined,
                  background: note.isOverdue ? "linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)" : undefined,
                }}
              >
                <h3 style={{ fontSize: "16px", margin: "0 0 8px 0" }}>
                  {note.title || "Untitled"}
                </h3>
                <div className="note-preview" style={{ marginTop: 6 }}>
                  {renderPreview(note)}
                </div>

                {/* Reminder and Overdue Indicators */}
                <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                  {note.deadline && (
                    <div
                      title={`Deadline: ${new Date(note.deadline).toLocaleString()}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: "rgba(122, 252, 255, 0.1)",
                        color: "var(--accent)",
                      }}
                    >
                      <Clock size={12} />
                      Deadline
                    </div>
                  )}
                  {note.reminderDate && (
                    <div
                      title={`Reminder: ${new Date(note.reminderDate).toLocaleString()}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: "rgba(255, 126, 185, 0.1)",
                        color: "#ff7eb9",
                      }}
                    >
                      <Clock size={12} />
                      Reminder
                    </div>
                  )}
                  {note.isOverdue && (
                    <div
                      title="This note is overdue"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: "rgba(220, 38, 38, 0.1)",
                        color: "#dc2626",
                      }}
                    >
                      <AlertCircle size={12} />
                      Overdue
                    </div>
                  )}
                </div>

                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <button
                    ref={(el) => {
                      if (el) menuButtonRefs.current[note._id] = el;
                    }}
                    onClick={() => {
                      const btn = menuButtonRefs.current[note._id];
                      if (!btn) return;
                      const rect = btn.getBoundingClientRect();
                      const pos = { top: rect.bottom + 2, left: rect.right };
                      // toggle on repeated clicks
                      if (openMenuId === note._id) {
                        closeMenu();
                      } else {
                        setMenuPos(pos);
                        setOpenMenuId(note._id);
                      }
                    }}
                  >
                    ⋮
                  </button>

                  {openMenuId === note._id && menuPos && (
                    <div
                      ref={menuRef}
                      style={{
                        position: "fixed",
                        top: `${menuPos.top}px`,
                        left: `${menuPos.left}px`,
                        transform: "translateX(-100%)",
                        background: theme === "light" ? "#fff" : "#2a2a2a",
                        border: `1px solid ${theme === "light" ? "#ddd" : "#555"}`,
                        borderRadius: 4,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                        zIndex: 1000,
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 140,
                        maxWidth: 320,
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => {
                          navigate(`/edit/${note._id}`);
                          closeMenu();
                        }}
                        style={{
                          padding: 8,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          handleToggleFavorite(note._id);
                          closeMenu();
                        }}
                        style={{
                          padding: 8,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        {note.isFavorite ? "★ Unfavorite" : "☆ Favorite"}
                      </button>
                      <button
                        onClick={() => {
                          handleMoveNote(note._id, lockedFolderId);
                          closeMenu();
                        }}
                        style={{
                          padding: 8,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        🔒 Lock
                      </button>
                      {String(note.folderId) === String(lockedFolderId) && (
                        <button
                          onClick={async () => {
                            // Require password if not cached for this session
                            try {
                              if (!lockedFolderPassword) {
                                const pwd = prompt("Enter password for locked folder:");
                                if (!pwd) return;
                                await verifyLockedFolderPassword(pwd, token);
                                setLockedFolderPasswordState(pwd);
                              }

                              await handleMoveNote(note._id, null);
                              // Return UI to root folder after unlocking
                              setSelectedFolderId(null);
                              closeMenu();
                            } catch (err) {
                              console.error(err);
                              alert(err.message || "Failed to unlock note");
                            }
                          }}
                          style={{
                            padding: 8,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          🔓 Unlock
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleDelete(note._id);
                          closeMenu();
                        }}
                        style={{
                          padding: 8,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "crimson",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Close menu when clicking outside
// Add global listener to close menu when clicking outside the menu or its toggle button
// Uses capturing mousedown to ensure it runs before other handlers
// (Note: React strict mode may mount/unmount twice in dev)
function useOutsideMenuClose(openMenuId, menuRef, menuButtonRefs, closeFn) {
  useEffect(() => {
    const handler = (e) => {
      if (!openMenuId) return;
      const menuEl = menuRef.current;
      const btn = menuButtonRefs.current?.[openMenuId];
      if (menuEl && menuEl.contains(e.target)) return;
      if (btn && btn.contains(e.target)) return;
      closeFn();
    };
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [openMenuId, menuRef, menuButtonRefs, closeFn]);
}





