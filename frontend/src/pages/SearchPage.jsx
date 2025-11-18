import { useState } from "react";
import SearchBar from "../components/SearchBar";
import NotesList from "../components/NotesList";
import { searchNotes } from "../api/notesApi";

const SearchPage = () => {
  const [notes, setNotes] = useState([]);

  const handleSearch = async (keyword) => {
    if (keyword.trim() === "") {
      setNotes([]);
      return;
    }

    const result = await searchNotes(keyword);
    setNotes(result);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <SearchBar onSearch={handleSearch} />
      <NotesList notes={notes} />
    </div>
  );
};

export default SearchPage;
