// ...existing code...
import React from "react";
import { useView } from "../../context/ViewContext";
import { useTheme } from "../../context/ThemeContext";

export default function ViewLayoutSelector() {
  const { viewType, setViewType } = useView();
  const { theme } = useTheme();

  return (
    <div className="view-toggle" role="tablist" aria-label="View layout">
      <button
        onClick={() => setViewType("grid")}
        className={`view-btn ${viewType === "grid" ? "selected" : ""} ${theme === "light" ? "theme-light" : "theme-dark"}`}
        aria-pressed={viewType === "grid"}
        title="Grid"
      >
        Grid
      </button>

      <button
        onClick={() => setViewType("list")}
        className={`view-btn ${viewType === "list" ? "selected" : ""} ${theme === "light" ? "theme-light" : "theme-dark"}`}
        aria-pressed={viewType === "list"}
        title="List"
      >
        List
      </button>
    </div>
  );
}
// ...existing code...