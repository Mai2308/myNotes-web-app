export const searchNotes = async (keyword) => {
  const res = await fetch(`http://localhost:5000/api/notes/search?q=${keyword}`);
  const data = await res.json();
  return data;
};
