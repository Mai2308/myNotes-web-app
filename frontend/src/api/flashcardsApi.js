const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Get all flashcards
export const getFlashcards = async (noteId, token) => {
  const url = noteId 
    ? `${BASE}/api/flashcards?noteId=${noteId}`
    : `${BASE}/api/flashcards`;
  
  const res = await fetch(url, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to fetch flashcards");
  return await res.json();
};

// Get flashcards due for review
export const getDueFlashcards = async (token) => {
  const res = await fetch(`${BASE}/api/flashcards/due`, {
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to fetch due flashcards");
  return await res.json();
};

// Create a flashcard
export const createFlashcard = async (flashcardData, token) => {
  const res = await fetch(`${BASE}/api/flashcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(flashcardData)
  });
  if (!res.ok) throw new Error("Failed to create flashcard");
  return await res.json();
};

// Update a flashcard
export const updateFlashcard = async (id, updates, token) => {
  const res = await fetch(`${BASE}/api/flashcards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error("Failed to update flashcard");
  return await res.json();
};

// Delete a flashcard
export const deleteFlashcard = async (id, token) => {
  const res = await fetch(`${BASE}/api/flashcards/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error("Failed to delete flashcard");
  return await res.json();
};

// Review a flashcard
export const reviewFlashcard = async (id, correct, token) => {
  const res = await fetch(`${BASE}/api/flashcards/${id}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ correct })
  });
  if (!res.ok) throw new Error("Failed to review flashcard");
  return await res.json();
};
