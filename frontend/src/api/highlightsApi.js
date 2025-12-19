const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Get all highlights for a note
export const getHighlights = async (noteId, token) => {
  const res = await fetch(`${BASE}/api/notes/${noteId}/highlights`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Get highlights failed (${res.status}): ${errData.message || res.statusText}`);
  }
  return await res.json();
};

// Add a highlight to a note
export const addHighlight = async (noteId, highlightData, token) => {
  const res = await fetch(`${BASE}/api/notes/${noteId}/highlights`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(highlightData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Add highlight failed (${res.status}): ${errData.message || res.statusText}`);
  }
  return await res.json();
};

// Update a highlight (change color or comment)
export const updateHighlight = async (noteId, highlightId, updates, token) => {
  const res = await fetch(`${BASE}/api/notes/${noteId}/highlights/${highlightId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Update highlight failed (${res.status}): ${errData.message || res.statusText}`);
  }
  return await res.json();
};

// Delete a highlight
export const deleteHighlight = async (noteId, highlightId, token) => {
  const res = await fetch(`${BASE}/api/notes/${noteId}/highlights/${highlightId}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Delete highlight failed (${res.status}): ${errData.message || res.statusText}`);
  }
  return await res.json();
};

// Clear all highlights from a note
export const clearAllHighlights = async (noteId, token) => {
  const res = await fetch(`${BASE}/api/notes/${noteId}/highlights`, {
    method: "DELETE",
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Clear highlights failed (${res.status}): ${errData.message || res.statusText}`);
  }
  return await res.json();
};
