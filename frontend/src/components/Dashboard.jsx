import React from "react";
import NoteEditor from "./NoteEditor";
import FolderSidebar from "./FolderSidebar";
import NotesList from "./NotesList";
import { useAuth } from "../auth/AuthProvider";

export default function Dashboard() {
  const { user } = useAuth();

  // Prefer user.username, then user.name, then fall back to auth_user in localStorage, then Guest
  const stored = JSON.parse(localStorage.getItem("auth_user") || "null");
  const username =
    user?.username ||
    user?.name ||
    stored?.username ||
    stored?.name ||
    "Guest";

  const [selectedFolderId, setSelectedFolderId] = React.useState(null);

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
        <div style={{ flex: 1 }}>
          <NotesList
            selectedFolderId={selectedFolderId}
            onNoteChange={() => {}}
          />
          <NoteEditor username={username} />
        </div>
      </div>
    </div>
  );
}