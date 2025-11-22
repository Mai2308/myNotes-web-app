import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CreateNote from "./components/CreateNote";
import NotesList from "./components/NotesList";
import EditNote from "./components/EditNote";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<NotesList />} />
        <Route path="/create" element={<CreateNote />} />
        <Route path="/edit/:id" element={<EditNote />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;