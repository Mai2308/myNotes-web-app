import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import NotesList from "../components/NotesList";
import ViewOptionsBar from "../components/ViewOptionsBar";
import { searchNotes } from "../api/notesApi";

const SearchPage = () => {
  const [notes, setNotes] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  const [sortOption, setSortOption] = useState("date_desc");
  const [layout, setLayout] = useState("list");

  // Debounce
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedKeyword(keyword), 500);
    return () => clearTimeout(handler);
  }, [keyword]);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      if (debouncedKeyword.trim() === "") {
        setNotes([]);
        return;
      }
      const result = await searchNotes(debouncedKeyword, sortOption);
      setNotes(result);
    };
    fetchNotes();
  }, [debouncedKeyword]);

  // Sort notes
  const sortedNotes = [...notes].sort((a, b) => {
    switch (sortOption) {
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      case "date_asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "date_desc":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <SearchBar keyword={keyword} setKeyword={setKeyword} />
      <ViewOptionsBar
        sortOption={sortOption}
        setSortOption={setSortOption}
        layout={layout}
        setLayout={setLayout}
      />
      <NotesList notes={sortedNotes} layout={layout} />
    </div>
  );
};

export default SearchPage;

