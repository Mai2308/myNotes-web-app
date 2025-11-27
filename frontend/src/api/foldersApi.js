const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Returns authorization headers if token is provided or stored in localStorage
function authHeaders(token) {
  const t = token ?? localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Get all folders for the current user
export const getFolders = async (token) => {
  const res = await fetch(`${BASE}/api/folders`, {
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error("Failed to fetch folders");
  return await res.json();
};

// Get a specific folder by ID (optionally with notes)
export const getFolder = async (id, includeNotes = false, token) => {
  const url = includeNotes
    ? `${BASE}/api/folders/${id}?includeNotes=true`
    : `${BASE}/api/folders/${id}`;
  const res = await fetch(url, {
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error("Failed to fetch folder");
  return await res.json();
};

// Create a new folder
export const createFolder = async (folderData, token) => {
  // folderData = { name: string, parentId?: string | null }
  const res = await fetch(`${BASE}/api/folders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(folderData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create folder");
  }
  return await res.json();
};

// Update a folder (rename or move)
export const updateFolder = async (id, updates, token) => {
  // updates = { name?: string, parentId?: string | null }
  const res = await fetch(`${BASE}/api/folders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update folder");
  }
  return await res.json();
};

// Delete a folder
export const deleteFolder = async (id, token) => {
  const res = await fetch(`${BASE}/api/folders/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete folder");
  }
  return await res.json();
};
