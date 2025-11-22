import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotesList from "../components/NotesList";

export default function FavouriteNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavouriteNotes();
  }, []);

  const fetchFavouriteNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("/api/notes/favourites", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavourite = async (noteId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/notes/${noteId}/favourite`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to toggle: ${res.status}`);
      }

      // Refresh the list to remove unfavourited notes
      await fetchFavouriteNotes();
    } catch (err) {
      console.error("Error toggling favourite:", err);
      alert("Failed to update favourite status");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading favourite notes...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>⭐ Favourite Notes</h1>
      <p>Your favourite notes are always accessible here by default.</p>
      {notes.length === 0 ? (
        <p>No favourite notes yet. Mark notes as favourite to see them here!</p>
      ) : (
        <NotesList notes={notes} onToggleFavourite={handleToggleFavourite} />
      )}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/notes")}>View All Notes</button>
        <button onClick={() => navigate("/create")} style={{ marginLeft: 10 }}>Create New Note</button>
      </div>
    </div>
  );
}
