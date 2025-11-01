import React, { useState } from "react";

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (newNote.trim() === "") return;
    setNotes([...notes, newNote]);
    setNewNote("");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>My Notes</h2>
      <input
        type="text"
        value={newNote}
        placeholder="Write a new note..."
        onChange={(e) => setNewNote(e.target.value)}
        style={{ padding: "8px", width: "70%" }}
      />
      <button onClick={addNote} style={{ padding: "8px", marginLeft: "10px" }}>
        Add
      </button>
      <ul style={{ marginTop: "20px" }}>
        {notes.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
    </div>
  );
};

export default NotesList;

