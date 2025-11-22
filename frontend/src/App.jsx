import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import EditNote from "./components/EditNote";
import CreateNote from "./components/CreateNote";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem("token"); // get token
      const res = await fetch("http://localhost:5000/api/notes", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // include token
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch notes: ${res.status}`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("fetchNotes error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = useCallback(
    async (note) => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/notes", {
          method: note.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(note),
        });
        if (!res.ok) throw new Error("save failed");
        await fetchNotes();
      } catch (err) {
        console.error(err);
      }
    },
    [fetchNotes]
  );

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Home notes={notes} onSave={handleSave} />} />
      <Route path="/create" element={<CreateNote onSave={handleSave} />} />
      <Route path="/edit/:id" element={<EditNote notes={notes} onSave={handleSave} />} />
    </Routes>
  );
}
