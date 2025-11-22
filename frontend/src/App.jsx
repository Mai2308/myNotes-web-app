import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CreateNote from "./components/CreateNote";
import NotesList from "./components/NotesList";
import Login from "./components/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/create" replace />} />
      <Route path="/create" element={<CreateNote />} />
      <Route path="/notes" element={<NotesList />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<div style={{ padding: 20 }}>404 — Not Found</div>} />
    </Routes>
  );
}







