import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Signup from "./components/Signup";
import Login from "./components/Login";
import FolderSidebar from "./components/FolderSidebar";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import "./styles.css";

/**
 * DashboardWithFolders:
 * - Shows FolderSidebar, NoteEditor and NotesList in a two-column layout.
 * - Manages selectedFolderId and triggers notes refresh when a note is saved.
 */
function DashboardWithFolders() {
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [notesChanged, setNotesChanged] = useState(false);

  const handleNoteSaved = () => {
    setNotesChanged((prev) => !prev);
  };

  return (
    <div className="dashboard-layout" style={{ display: "flex", flexDirection: "row", minHeight: "100vh" }}>
      <div style={{ width: "250px", background: "#f3f4f6", padding: "20px 10px", borderRight: "1px solid #e5e7eb" }}>
        <FolderSidebar selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />
      </div>
      <div style={{ flex: 1, padding: "24px" }}>
        <NoteEditor initialFolderId={selectedFolderId} onSaved={handleNoteSaved} />
        <NotesList selectedFolderId={selectedFolderId} notesChanged={notesChanged} />
      </div>
    </div>
  );
}

/**
 * App:
 * - Adds a root redirect (/) → /login so opening the base URL shows the login page.
 * - Renders Header above routes so navigation links are visible on all pages.
 */
function App() {
  return (
    <div className="app-container">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardWithFolders />} />
      </Routes>
    </div>
  );
}

export default App;