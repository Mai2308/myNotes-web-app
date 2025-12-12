import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getNotes, deleteNote, moveNote, toggleFavorite } from "../api/notesApi";
import { useTheme } from "../context/ThemeContext";
import FolderManager from "./FolderManager";
import { useView } from "../context/ViewContext";
import SortMenu from "./viewOptions/SortMenu";
import ViewLayoutSelector from "./viewOptions/ViewLayoutSelector";

export default function Dashboard() {
  const { sort, setSort, viewType } = useView();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [draggedNote, setDraggedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favPending, setFavPending] = useState(new Set());

  const token = localStorage.getItem("token");
  const requestIdRef = useRef(0);
  const debounceRef = useRef(null);

  const applySort = useCallback((list = [], sortMode) => {
    if (!sortMode) return [...list];
    const copy = [...list];
    const getTime = (n) => new Date(n?.createdAt || n?.updatedAt || 0).getTime();

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
          const favDiff = (b.isFavorite === true ? 1 : 0) - (a.isFavorite === true ? 1 : 0);
          return favDiff !== 0 ? favDiff : getTime(b) - getTime(a);
        });
      default:
        return copy;
    }
  }, []);

  // Fetch notes with debounce + stale-response guard
  useEffect(() => {
    if (!token) return;

    // apply local sort immediately to avoid flicker
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
    }, 120); // small debounce to avoid many requests

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
        // update locally if possible
        setNotes((prev) =>
          prev.map((n) => (n._id === noteId ? { ...n, folderId: targetFolderId } : n))
        );
        // refresh to ensure server state and sort
        const data = await getNotes(token, { sort, folderId: selectedFolderId, q: searchQuery });
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
      // منع النقر المتكرر
      if (favPending.has(noteId)) return;
      setFavPending((s) => new Set(s).add(noteId));

      try {
        // تحديث محلي فوري (optimistic) - بدون re-fetch
        setNotes((prev) =>
          prev.map((n) =>
            n._id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
          )
        );

        // إرسال للسيرفر بدون انتظار re-fetch
        await toggleFavorite(noteId, token);
        console.log("toggleFavorite success for:", noteId);
        
        // لا نعمل re-fetch — خليه يبقى محلي
      } catch (err) {
        console.error("toggleFavorite failed:", err);
        // على الفشل فقط: ارجع للحالة السابقة
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
    [favPending]
  );

  const filteredNotes = notes
    .filter((n) => (selectedFolderId === null ? !n.folderId : String(n.folderId) === String(selectedFolderId)))
    .filter((n) => {
      const q = (searchQuery || "").toLowerCase();
      if (!q) return true;
      const titleMatch = (n.title || "").toLowerCase().includes(q);
      const contentText = (n.content || "").replace(/<[^>]+>/g, "").toLowerCase();
      const contentMatch = contentText.includes(q);
      return titleMatch || contentMatch;
    });

  return (
    <div className="container" style={{ paddingTop: 40}}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        <FolderManager
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          draggedNote={draggedNote}
          onNoteDrop={handleMoveNote}
        />

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <SortMenu />
            <ViewLayoutSelector />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>{selectedFolderId === null ? "All Notes (Root)" : "Notes in Folder"}</h2>
            <button
              className={theme === "light" ? "btn-create-light" : "btn-create-dark"}
              onClick={() => navigate("/create", { state: { folderId: selectedFolderId } })}
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
          {!loading && filteredNotes.length === 0 && <p style={{ color: "var(--muted)" }}>No notes found.</p>}

          <div
            className={viewType === "grid" ? "notes-grid" : "notes-list"}
            style={{
              display: "grid",
              gridTemplateColumns: viewType === "grid" ? "repeat(auto-fill, minmax(200px, 1fr))" : "1fr",
              gap: 12,
              maxWidth: "1200px",
            }}
          >
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className="card"
                draggable
                onDragStart={(e) => handleDragStart(e, note)}
                onDragEnd={handleDragEnd}
                style={{ padding: 12, cursor: "grab", opacity: draggedNote?._id === note._id ? 0.5 : 1 ,minHeight: "200px", }}
                
              >
                <h3 style={{ fontSize: "16px", margin: "0 0 8px 0" }}>{note.title || "Untitled"}</h3>

                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    overflow: "hidden",
                    maxHeight: 60,
                    margin: "8px 0",
                  }}
                  dangerouslySetInnerHTML={{ __html: note.content || "" }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 10 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(note._id);
                    }}
                    disabled={favPending.has(note._id)}
                    className="btn"
                    style={{
                      background: note.isFavorite ? "#FFD700" : "#888",
                      padding: "4px 8px",
                      fontSize: 11,
                      opacity: favPending.has(note._id) ? 0.6 : 1,
                      cursor: favPending.has(note._id) ? "wait" : "pointer",
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
                    style={{ background: "crimson" , padding: "4px 8px", fontSize: 11 }}
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

