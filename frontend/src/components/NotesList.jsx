import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("/api/notes", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data = await response.json();
        setNotes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [navigate]);

  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId));
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading notes...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;

  if (notes.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        <h2>My Notes</h2>
        <p>No notes found. <button onClick={() => navigate("/create")}>Create your first note!</button></p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>My Notes</h2>
      <button onClick={() => navigate("/create")} style={{ marginBottom: 20 }}>Create New Note</button>
      <div>
        {notes.map(note => (
          <div key={note.id} style={{
            border: "1px solid #ddd",
            padding: "15px",
            margin: "10px 0",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9"
          }}>
            <h3>{note.title || "Untitled"}</h3>
            <div dangerouslySetInnerHTML={{ __html: note.content }} />
            <small style={{ color: "#666" }}>
              Created: {new Date(note.createdAt).toLocaleString()}
            </small>
            <div style={{ marginTop: 10 }}>
              <button onClick={() => handleDelete(note.id)} style={{ marginLeft: 10, color: "red" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
