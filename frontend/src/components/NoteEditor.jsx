import React, { useState, useEffect } from "react";
import "../styles.css";

export default function NoteEditor({ username }) {
  const [note, setNote] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

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

  return (
    <div>
      <label style={{ fontWeight: "bold", color: "#1e3a8a" }}>
        ✍️ Write your note:
      </label>

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

      {/* 🔘 الأزرار */}
      <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button className="btn" onClick={handleUndo}>↩️ Undo</button>
        <button className="btn" onClick={handleRedo}>↪️ Redo</button>
        <button className="btn" onClick={handleSaveDraft}>💾 Save as Draft</button>
        <button className="btn" onClick={handleLoadDraft}>📂 Load Draft</button>
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

