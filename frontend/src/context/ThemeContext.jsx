import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getInitial = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    // fallback to system preference
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // remove any leftover theme classes first
    html.classList.remove("theme-dark", "theme-light");
    body.classList.remove("dark", "light");

    // apply consistent classes + data attribute
    if (theme === "dark") {
      html.classList.add("theme-dark");
      body.classList.add("dark");
      html.setAttribute("data-theme", "dark");
    } else {
      html.classList.add("theme-light");
      body.classList.add("light");
      html.setAttribute("data-theme", "light");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeProvider;
