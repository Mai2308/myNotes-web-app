import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="searchbar-container">
      <Search className="searchbar-icon" />
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="searchbar-input"
      />
    </div>
  );
};

export default SearchBar;
