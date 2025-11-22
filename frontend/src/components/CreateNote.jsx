import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NoteEditor from "./NoteEditor";

export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // We'll use a ref to get content from NoteEditor
  const editorRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token"); // check authentication
    if (!token) return setError("Not authenticated");

    const content = editorRef.current?.getContent?.() || ""; // get content from NoteEditor

    if (!title.trim() && !content.trim()) {
      return setError("Title or content must not be empty");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server returned ${res.status}`);
      }

      // Successfully created
      setTitle("");
      if (editorRef.current?.clearContent) editorRef.current.clearContent();
      navigate("/notes");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create a New Note</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/notes")}>All Notes</button>
        <button onClick={() => navigate("/favourites")} style={{ marginLeft: 10 }}>⭐ Favourites</button>
      </div>

      {/* NoteEditor with ref so we can get content */}
      <NoteEditor ref={editorRef} />

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        {error && (
          <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
        )}

        <div style={{ marginBottom: 10 }}>
          <label>Title</label>
          <br />
          <input
            className="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            maxLength={255}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Note"}
        </button>
      </form>
    </div>
  );
}
