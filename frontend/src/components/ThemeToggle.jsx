import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle(){
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="toolbar-btn"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
}