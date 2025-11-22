import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem("token"); // ensure login stored token
    if (!token) return setError("Not authenticated");

    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server returned ${res.status}`);
      }

      // created — clear form or redirect
      setTitle("");
      setContent("");
      navigate("/notes"); // adjust route as needed
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} />
      </div>
      <div>
        <label>Content</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
      </div>
      <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Note"}</button>
    </form>
  );
}