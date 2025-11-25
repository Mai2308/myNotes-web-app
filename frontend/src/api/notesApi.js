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
  // note = { title: string, content: string, tags: [] }
  const res = await fetch(`${BASE}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(note),
  });
  return await res.json();
};

// Update an existing note by ID
export const updateNote = async (id, note, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(note),
  });
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
