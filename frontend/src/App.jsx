import { Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import NotebookPage from "./Pages/NotebookPage";

export default function App() {
  return (
    <>
      <header className="app-header">
        <h1>Notes Web App</h1>
      </header>

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/notebook" element={<NotebookPage />} />
      </Routes>
    </>
  );
}











