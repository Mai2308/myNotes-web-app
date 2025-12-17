import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import CreateNote from "./pages/CreateNote";
import EditNote from "./pages/EditNote";
import NotesList from "./components/NotesList";
import Header from "./components/Header";
import NotificationCenter from "./components/NotificationCenter";
import { useAuth } from "./auth/AuthProvider";
import NotesPage from "./pages/NotesPage";

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      {user && <NotificationCenter />}

      <Routes>
        {/* Home page only when user visits "/" */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/create"
          element={
            <RequireAuth>
              <CreateNote />
            </RequireAuth>
          }
        />

        <Route
          path="/notespage"
          element={
            <RequireAuth>
              <NotesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <RequireAuth>
              <EditNote />
            </RequireAuth>
          }
        />

        <Route
          path="/notes"
          element={
            <RequireAuth>
              <NotesList />
            </RequireAuth>
          }
        />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 20 }}>404 — Not Found</div>} />
      </Routes>
    </>
  );
}











