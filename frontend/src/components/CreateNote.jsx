import React, { useRef, useState } from "react";
import NoteEditor from "./NoteEditor";
import "../styles.css";

export default function CreateNote({ navigateTo = "/notes" }) {
  const editorRef = useRef();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // expose getHtml from the editor by using a ref pattern:
  // (If your NoteEditor doesn't forward a ref, adapt to read innerHTML directly.)
  const handleSave = async () => {
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) return setError("Not authenticated");

    // read editor HTML
    const content = document.querySelector(".rich-editor")?.innerHTML ?? "";

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
        throw new Error(body.message || `Server ${res.status}`);
      }
      // success - navigate or clear
      setTitle("");
      document.querySelector(".rich-editor").innerHTML = "";
      window.location.href = navigateTo;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title (optional)"
          maxLength={255}
          style={{ width: "100%", padding: "8px", fontSize: 16 }}
        />
      </div>

      <NoteEditor />

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save note"}
        </button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
    </div>
  );
}