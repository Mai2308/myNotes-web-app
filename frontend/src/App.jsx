import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import FolderSidebar from "./components/FolderSidebar";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import "./styles.css";

/**
 * This updated App.jsx:
 * - Displays the FolderSidebar, NotesList, and NoteEditor on the dashboard page,
 *   allowing folder selection and note creation grouped by folder.
 * - Keeps the existing routes for Signup and Login.
 */

function DashboardWithFolders() {
  // The Dashboard page now includes folder management and notes grouping by folders
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [notesChanged, setNotesChanged] = useState(false);

  // Handler to refresh the notes list after creating or updating a note
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

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* Dashboard now uses the new feature layout */}
        <Route path="/dashboard" element={<DashboardWithFolders />} />
      </Routes>
    </div>
  );
}

export default App;
