import React, { useEffect, useState } from "react";

export default function FolderSidebar({ onSelectFolder, selectedFolderId }) {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");

  // Fetch folders from the backend API
  useEffect(() => {
    fetch("/api/folders", { credentials: "include" })
      .then((res) => res.json())
      .then(setFolders);
  }, []);

  // Create a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newFolderName }),
    });
    setNewFolderName(""); // Clear input
    // Refresh folders
    fetch("/api/folders", { credentials: "include" })
      .then((res) => res.json())
      .then(setFolders);
  };

  // Select folder
  const handleSelect = (id) => onSelectFolder(id);

  return (
    <div>
      <h2>Folders</h2>
      <ul>
        <li style={{ fontWeight: !selectedFolderId ? "bold" : "normal", cursor: "pointer" }}
            onClick={() => handleSelect(null)}>All Notes</li>
        {folders.map((folder) => (
          <li
            key={folder.id}
            style={{ fontWeight: selectedFolderId === folder.id ? "bold" : "normal", cursor: "pointer" }}
            onClick={() => handleSelect(folder.id)}
          >
            {folder.name}
          </li>
        ))}
      </ul>
      <input
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="New folder name"
      />
      <button onClick={handleCreateFolder}>Create Folder</button>
    </div>
  );
}