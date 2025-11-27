const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Returns authorization headers if token is provided or stored in localStorage
function authHeaders(token) {
  const t = token ?? localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Search notes by keyword
export const searchNotes = async (keyword, token) => {
  const res = await fetch(`${BASE}/api/notes/search?q=${encodeURIComponent(keyword)}`, {
    headers: { ...authHeaders(token) },
  });
  return await res.json();
};

// Get all notes
export const getNotes = async (token) => {
  const res = await fetch(`${BASE}/api/notes`, { headers: { ...authHeaders(token) } });
  return await res.json();
};

// Create a new note
export const createNote = async (note, token) => {
  // note = { title: string, content: string, tags: [], folderId?: string | null }
  const res = await fetch(`${BASE}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(note),
  });
  return await res.json();
};

// Update an existing note by ID
export const updateNote = async (id, note, token) => {
  // note can include folderId to move note between folders
  const res = await fetch(`${BASE}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(note),
  });
  return await res.json();
};

// Move a note to a different folder (using dedicated endpoint)
export const moveNote = async (id, folderId, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/move`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ folderId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to move note");
  }
  return await res.json();
};

// Delete a note by ID
export const deleteNote = async (id, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  return await res.json();
};

// Toggle favorite status of a note
export const toggleFavorite = async (id, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/favorite`, {
    method: "POST",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to toggle favorite");
  }
  return await res.json();
};
