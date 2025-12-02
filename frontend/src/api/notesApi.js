const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function authHeaders(token) {
  const t = token ?? localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Get all notes  ← إضافة sort فقط
export const getNotes = async (token, sort) => {
  const res = await fetch(`${BASE}/api/notes?sort=${sort}`, {
    headers: { ...authHeaders(token) },
  });
  return await res.json();
};

// Create new note
export const createNote = async (note, token) => {
  const res = await fetch(`${BASE}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(note),
  });
  return await res.json();
};

// Move note to folder  (PUT ✔ مثل backend)
export const moveNote = async (id, folderId, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/move`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ folderId }),
  });

  return await res.json();
};

// Update note
export async function updateNote(id, data, token) {
  const res = await fetch(`${BASE}/api/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update note");
  }

  return await res.json();
}



// Delete note
export const deleteNote = async (id, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  return await res.json();
};

// Toggle favorite (PUT ✔ مثل backend)
export const toggleFavorite = async (id, token) => {
  const res = await fetch(`${BASE}/api/notes/${id}/favorite`, {
    method: "PUT",
    headers: { ...authHeaders(token) },
  });
  return await res.json();
};


