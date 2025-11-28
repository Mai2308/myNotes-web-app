import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import NotesList from "../components/NotesList";
import { getNotes } from "../services/api";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNotes(search);
      setNotes(data);
    };

    fetchData();
  }, [search]); // dynamic search

  return (
    <div>
      <SearchBar search={search} setSearch={setSearch} />
      <NotesList notes={notes} />
    </div>
  );
}
