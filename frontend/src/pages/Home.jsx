import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import NotesList from '../components/NotesList';
import { getNotes } from '../services/notesService';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getNotes();
      setNotes(data);
    };
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.context.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>My Notes</h1>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <NotesList notes={filteredNotes} />
    </div>
  );
};

export default Home;
