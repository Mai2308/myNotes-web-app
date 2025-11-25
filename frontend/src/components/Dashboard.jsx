import React from "react";
import NoteEditor from "./NoteEditor";
import { useAuth } from "../auth/AuthProvider";

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.name || user?.username || "User";

  return (
    <div className="card">
      <h2>Welcome, {name}!</h2>
      
      <NoteEditor username={name} />
    </div>
  );
}



