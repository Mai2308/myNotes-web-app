import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./auth/AuthProvider";
import { ViewProvider } from "./context/ViewContext";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ThemeProvider>
    <AuthProvider>
      <ViewProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </ViewProvider>
    </AuthProvider>
  </ThemeProvider>
);
