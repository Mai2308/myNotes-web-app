const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Build API URL - handle both full URLs and relative paths
function getApiUrl(endpoint) {
  if (BASE.startsWith("http")) {
    return `${BASE}/api${endpoint}`;
  }
  return `/api${endpoint}`;
}

export const getEmojiCatalog = async () => {
  const res = await fetch(getApiUrl("/emojis"));
  if (!res.ok) throw new Error("Failed to load emoji catalog");
  return await res.json();
};

export const searchEmojis = async (q) => {
  const res = await fetch(getApiUrl(`/emojis/search?q=${encodeURIComponent(q || "")}`));
  if (!res.ok) throw new Error("Failed to search emojis");
  return await res.json();
};
