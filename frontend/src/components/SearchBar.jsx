import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [keyword, setKeyword] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    onSearch(value); // dynamic search
  };

  return (
    <input
      type="text"
      placeholder="Search notes..."
      value={keyword}
      onChange={handleChange}
      style={{
        padding: "10px",
        width: "100%",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "16px"
      }}
    />
  );
};

export default SearchBar;
