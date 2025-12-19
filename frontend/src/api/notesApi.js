const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Build API URL - handle both full URLs and relative paths
function getApiUrl(endpoint) {
  if (BASE.startsWith("http")) {
    return `${BASE}/api${endpoint}`;
  }
  return `/api${endpoint}`;
}

// Returns authorization headers if token is provided or stored in localStorage
function authHeaders(token) {
  const t = token ?? localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Get all notes (with optional sort, folderId, and search query)
export const getNotes = async (token, sortOrOptions = {}) => {
  let sort, folderId, q;
  if (typeof sortOrOptions === "string") {
    sort = sortOrOptions;
  } else if (sortOrOptions && typeof sortOrOptions === "object") {
    ({ sort, folderId, q } = sortOrOptions);
  }

  const params = new URLSearchParams();
  if (sort) params.append("sort", sort);
  if (folderId !== undefined && folderId !== null) params.append("folderId", folderId);
  if (q) params.append("q", q);

  const url = `${BASE}/api/notes${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers: { ...authHeaders(token) } });
  return await res.json();
};

// Get notes filtered by folderId, with optional folder password
export const getNotesByFolder = async (folderId, token, options = {}) => {
  const q = typeof folderId === "string" ? encodeURIComponent(folderId) : "null";
  const headers = { ...authHeaders(token) };
  if (options.password) headers["x-folder-password"] = options.password;
  const res = await fetch(`${BASE}/api/notes?folderId=${q}`, { headers });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch notes by folder");
  }
  return await res.json();
};

// Create a new note
export const createNote = async (note, token) => {
  const res = await fetch(`${BASE}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(note),
  });
  return await res.json();
};

// Update an existing note
export const updateNote = async (id, data, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return await res.json();
};

// Delete a note
export const deleteNote = async (id, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  return await res.json();
};

// Move note to folder
export const moveNote = async (id, folderId, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/move`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ folderId }),
  });
  return await res.json();
};

// Toggle favorite
export const toggleFavorite = async (id, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/favorite`, {
    method: "PUT",
    headers: { ...authHeaders(token) },
  });
  return await res.json();
};

// ---------------- Emoji Features ----------------

// Add emoji to note
export const addEmojiToNote = async (id, emoji, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/emojis`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ emoji }),
  });
  if (!res.ok) throw new Error("Failed to add emoji");
  return await res.json();
};

// Remove emoji from note
export const removeEmojiFromNote = async (id, emoji, token) => {
  const enc = encodeURIComponent(emoji);
  const res = await fetch(`${BASE}/api/notes/${id}/emojis/${enc}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error("Failed to remove emoji");
  return await res.json();
};

// ---------------- Checklist Features ----------------

// Convert note to checklist
export const convertToChecklist = async (id, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/checklist/convert`, {
    method: "POST",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error("Failed to convert to checklist");
  return await res.json();
};

// Convert checklist back to regular note
export const convertToRegularNote = async (id, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/checklist/revert`, {
    method: "POST",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error("Failed to convert to regular note");
  return await res.json();
};

// Update checklist items
export const updateChecklistItems = async (id, checklistItems, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/checklist/items`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ checklistItems }),
  });
  if (!res.ok) throw new Error("Failed to update checklist items");
  return await res.json();
};

// Toggle completion status of a checklist item
export const toggleChecklistItem = async (id, itemIndex, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/checklist/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ itemIndex }),
  });
  if (!res.ok) throw new Error("Failed to toggle checklist item");
  return await res.json();
};

// ---------------- Lock Note Feature ----------------

// Lock note (move note into locked folder)
export const lockNote = async (id, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/lock`, {
    method: "POST",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error("Failed to lock note");
  return await res.json();
};

