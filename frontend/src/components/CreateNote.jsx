
import React, { useState } from "react";
import NoteEditor from "./NoteEditor";
import "../styles.css";


export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleSave = async () => {
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return setError("Not authenticated");

    const content = document.querySelector(".rich-editor")?.innerHTML ?? "";

    setLoading(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server ${res.status}`);
      }


      setTitle("");
      const editor = document.querySelector(".rich-editor");
      if (editor) editor.innerHTML = "";
      window.location.href = "/notes";

     
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div style={{ maxWidth: 900, margin: "18px auto", padding: 12 }}>
      <input
        className="note-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        maxLength={255}
        style={{ marginBottom: 12 }}
      />

      <NoteEditor />

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={loading} className="btn">
          {loading ? "Saving..." : "Save"}
        </button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>

    </div>
  );
}
