import React, { useState } from "react";
import FolderSidebar from "./FolderSidebar";
import NotesList from "./NotesList";

export default function Dashboard() {
  const username = localStorage.getItem("username");
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {username}!</h2>
      </div>
      <div className="dashboard-content">
        <FolderSidebar
          onFolderSelect={setSelectedFolderId}
          selectedFolderId={selectedFolderId}
        />
        <NotesList
          selectedFolderId={selectedFolderId}
          onNoteChange={() => {}}
        />
      </div>
    </div>
  );
}



