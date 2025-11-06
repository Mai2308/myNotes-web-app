import React, { useState, useEffect } from "react";
import "../styles.css";

export default function NoteEditor({ username, onSaved, initialFolderId }) {
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState(initialFolderId || "");
  const [savedMessage, setSavedMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Fetch available folders from backend
  useEffect(() => {
    fetch("/api/folders", { credentials: "include" })
      .then((res) => res.json())
      .then(setFolders)
      .catch(() => setFolders([]));
  }, []);

  // تحميل الملاحظة التلقائية عند الفتح
  useEffect(() => {
    const savedNote = localStorage.getItem("autoSavedNote");
    if (savedNote) setNote(savedNote);
  }, []);

  // الحفظ التلقائي أثناء الكتابة
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("autoSavedNote", note);
      setSavedMessage("💾 Auto-saved!");
      setTimeout(() => setSavedMessage(""), 1500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [note]);

  // تحديث النص وتسجيله في history
  const handleChange = (e) => {
    setHistory([...history, note]);
    setNote(e.target.value);
    setRedoStack([]);
  };

  // تحديث العنوان
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // 🔙 التراجع
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack([note, ...redoStack]);
    setNote(previous);
    setHistory(history.slice(0, -1));
  };

  // 🔁 الإعادة
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory([...history, note]);
    setNote(next);
    setRedoStack(redoStack.slice(1));
  };

  // 🟡 حفظ كمسودة باسم المستخدم
  const handleSaveDraft = () => {
    if (!username) {
      setSavedMessage("⚠️ No user logged in!");
      setTimeout(() => setSavedMessage(""), 1500);
      return;
    }

    const draftKey = `draftNote_${username}`;
    localStorage.setItem(draftKey, note);
    setSavedMessage(`📝 Draft saved for ${username}!`);
    setTimeout(() => setSavedMessage(""), 1500);
  };

  // 🟢 تحميل المسودة الخاصة بالمستخدم
  const handleLoadDraft = () => {
    if (!username) {
      setSavedMessage("⚠️ No user logged in!");
      setTimeout(() => setSavedMessage(""), 1500);
      return;
    }

    const draftKey = `draftNote_${username}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      setNote(draft);
      setSavedMessage(`📂 Draft loaded for ${username}!`);
    } else {
      setSavedMessage(`⚠️ No draft found for ${username}.`);
    }
    setTimeout(() => setSavedMessage(""), 1500);
  };

  // 📝 حفظ الملاحظة في قاعدة البيانات (مع المجلد)
  const handleSaveNote = async () => {
    if (!title.trim()) {
      setSavedMessage("⚠️ Title required!");
      setTimeout(() => setSavedMessage(""), 1500);
      return;
    }
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          content: note,
          folder_id: folderId || null,
        }),
      });
      setNote("");
      setTitle("");
      setFolderId("");
      setSavedMessage("✅ Note saved!");
      setTimeout(() => setSavedMessage(""), 1500);
      if (onSaved) onSaved();
    } catch (err) {
      setSavedMessage("❌ Error saving note!");
      setTimeout(() => setSavedMessage(""), 1500);
    }
  };

  return (
    <div>
      <label style={{ fontWeight: "bold", color: "#1e3a8a" }}>
        ✍️ Write your note:
      </label>

      {/* Folder selection */}
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <label style={{ fontWeight: "bold", color: "#1e3a8a" }}>📁 Select folder:</label>
        <select
          value={folderId}
          onChange={e => setFolderId(e.target.value)}
          style={{ marginLeft: "8px", padding: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="">No Folder</option>
          {folders.map(folder => (
            <option key={folder.id} value={folder.id}>{folder.name}</option>
          ))}
        </select>
      </div>

      {/* Title input */}
      <input
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title"
        style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #a5b4fc", fontSize: "16px" }}
      />

      <textarea
        value={note}
        onChange={handleChange}
        rows="6"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "8px",
          border: "2px solid #c7d2fe",
          borderRadius: "10px",
          fontSize: "15px",
        }}
        placeholder="Start typing your note here..."
      />

      {/* أزرار التحكم */}
      <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button className="btn" onClick={handleUndo}>↩️ Undo</button>
        <button className="btn" onClick={handleRedo}>↪️ Redo</button>
        <button className="btn" onClick={handleSaveDraft}>💾 Save as Draft</button>
        <button className="btn" onClick={handleLoadDraft}>📂 Load Draft</button>
        <button className="btn" style={{ background: "#7e22ce", color: "white" }} onClick={handleSaveNote}>✅ Save Note</button>
      </div>

      {savedMessage && (
        <p style={{ color: "green", marginTop: "8px", fontWeight: "bold" }}>
          {savedMessage}
        </p>
      )}

      <p style={{ color: "#555", marginTop: "10px", fontSize: "14px" }}>
        Saved data example:{" "}
        <strong>
          {note ? note.substring(0, 30) + (note.length > 30 ? "..." : "") : "No auto-saved note"}
        </strong>
      </p>
    </div>
  );
}