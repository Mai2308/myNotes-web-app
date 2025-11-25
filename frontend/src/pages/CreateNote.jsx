import React, { useState, useRef } from "react";
import NoteEditor from "../components/NoteEditor";
import "../styles.css";
import { createNote as apiCreateNote } from "../api/notesApi";

export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const editorRef = useRef(null);

  const handleSave = async () => {
    const content = editorRef.current?.getContent() ?? "";

    if (!title.trim() && !content.trim()) {
      setError("Title or note content required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await apiCreateNote({ title: title.trim(), content }, token);

      if (res?.message && res.message.toLowerCase().includes("error")) {
        throw new Error(res.message);
      }

      setSuccess("Note saved successfully!");
      setTitle("");
      editorRef.current?.clearContent();
    } catch (err) {
      setError(err.message || "Failed to save note");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  return (
    <div className="auth-page center" style={{ padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 800 }}>
        <input
          className="note-title"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <NoteEditor ref={editorRef} />

        {error && <div className="alert">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* Full-width Save Button */}
        <button
          className="btn"
          onClick={handleSave}
          disabled={loading}
          style={{ width: "100%", marginTop: 12 }}
        >
          {loading ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
