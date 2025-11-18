import React from "react";

const ViewOptionsBar = ({ sortOption, setSortOption, layout, setLayout }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
      
      {/* Sort Dropdown */}
      <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
        <option value="date_desc">Date: Newest → Oldest</option>
        <option value="date_asc">Date: Oldest → Newest</option>
        <option value="title_asc">Title: A → Z</option>
        <option value="title_desc">Title: Z → A</option>
      </select>

      {/* Layout Toggle */}
      <div>
        <button
          onClick={() => setLayout("list")}
          style={{ marginRight: "10px", fontWeight: layout === "list" ? "bold" : "normal" }}
        >
          List
        </button>
        <button
          onClick={() => setLayout("grid")}
          style={{ fontWeight: layout === "grid" ? "bold" : "normal" }}
        >
          Grid
        </button>
      </div>
    </div>
  );
};

export default ViewOptionsBar;
