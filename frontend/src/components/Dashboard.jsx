import React from "react";
import NoteEditor from "./NoteEditor";

export default function Dashboard() {
  const username = localStorage.getItem("username");

  return (
    <div className="card">
      <h2>Welcome, {username}!</h2>
      <p>This is your dashboard.</p>
      <NoteEditor username={username} />
    </div>
  );
}



