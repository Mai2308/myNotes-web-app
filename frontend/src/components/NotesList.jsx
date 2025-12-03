import React from "react";

const NotesList = ({ notes, searchQuery }) => {
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredNotes.length === 0) {
    return <p>No notes found.</p>;
  }

  return (
    <div>
      {filteredNotes.map(note => (
        <div
          key={note.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px"
          }}
        >
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
};

export default NotesList;

