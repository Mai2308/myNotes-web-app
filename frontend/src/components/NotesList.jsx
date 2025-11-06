import React, { useEffect, useState } from "react";

export default function NotesList({ selectedFolderId }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const url = selectedFolderId
      ? `/api/notes?folder_id=${selectedFolderId}`
      : "/api/notes";
    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then(setNotes);
  }, [selectedFolderId]);

  return (
    <div>
      <h2>{selectedFolderId ? "Notes in folder" : "All Notes"}</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <b>{note.title}</b>: {note.content}
          </li>
        ))}
      </ul>
    </div>
  );
}