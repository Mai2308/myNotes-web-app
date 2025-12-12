const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const getEmojiCatalog = async () => {
  const res = await fetch(`${BASE}/api/emojis`);
  if (!res.ok) throw new Error("Failed to load emoji catalog");
  return await res.json();
};

export const searchEmojis = async (q) => {
  const res = await fetch(`${BASE}/api/emojis/search?q=${encodeURIComponent(q || "")}`);
  if (!res.ok) throw new Error("Failed to search emojis");
  return await res.json();
};
