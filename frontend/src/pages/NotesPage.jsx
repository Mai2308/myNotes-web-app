import React, { useState } from "react";
import NotesList from "../components/NotesList";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const notes = [
    { id: 1, title: "First Note", content: "Hello world" },
    { id: 2, title: "Shopping", content: "Buy milk" },
    { id: 3, title: "Study", content: "React is cool" }
  ];

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>My Notes</h2>

      
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px"
      }}>
        <input
          type="text"
          placeholder="Search by title or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "60%",            
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <NotesList notes={notes} searchQuery={searchQuery} />
    </div>
  );
}

