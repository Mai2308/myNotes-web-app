import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotesList from "../components/NotesList";

export default function AllNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("/api/notes", {
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

      const result = await res.json();
      
      // Update the notes list with the new favourite status
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { ...note, isFavourite: result.isFavourite } : note
        )
      );
    } catch (err) {
      console.error("Error toggling favourite:", err);
      alert("Failed to update favourite status");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading notes...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>All Notes</h1>
      <NotesList notes={notes} onToggleFavourite={handleToggleFavourite} />
      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/favourites")}>View Favourites</button>
        <button onClick={() => navigate("/create")} style={{ marginLeft: 10 }}>Create New Note</button>
      </div>
    </div>
  );
}