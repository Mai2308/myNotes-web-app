import React, { useState, useEffect, useRef } from "react";
import "../styles.css";

export default function NoteEditor({ username }) {
  const editorRef = useRef(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const saveKey = username ? `draftNote_${username}` : "draftNote_anonymous";

  // load auto-saved or user draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("autoSavedNote");
    const draft = localStorage.getItem(saveKey);
    const html = draft || saved || "";
    if (editorRef.current) editorRef.current.innerHTML = html;
    // initialize history
    setHistory(html ? [html] : []);
  }, [saveKey]);

  // auto-save while typing (throttled)
  useEffect(() => {
    const handler = setInterval(() => {
      const html = editorRef.current?.innerHTML ?? "";
      if (html) localStorage.setItem("autoSavedNote", html);
    }, 2000); // every 2s
    return () => clearInterval(handler);
  }, []);

  const pushHistory = (snapshot) => {
    setHistory((h) => {
      const next = [...h, snapshot].slice(-50); // keep last 50
      return next;
    });
    setRedoStack([]);
  };

  // handle input in contentEditable
  const handleInput = () => {
    const html = editorRef.current.innerHTML;
    pushHistory(html);
  };

  // formatting wrapper using execCommand (works cross-browser)
  const format = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    // after formatting, push snapshot
    const html = editorRef.current.innerHTML;
    pushHistory(html);
    editorRef.current.focus();
  };

  const handleFontChange = (e) => {
    format("fontName", e.target.value);
  };

  const handleColor = (color) => {
    // use hiliteColor where available, fall back to backColor
    try {
      document.execCommand("hiliteColor", false, color);
    } catch {
      document.execCommand("backColor", false, color);
    }
    const html = editorRef.current.innerHTML;
    pushHistory(html);
    editorRef.current.focus();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    setRedoStack((r) => [last, ...r]);
    setHistory((h) => h.slice(0, -1));
    if (editorRef.current) editorRef.current.innerHTML = prev;
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((r) => r.slice(1));
    setHistory((h) => [...h, next]);
    if (editorRef.current) editorRef.current.innerHTML = next;
  };

  const handleSaveDraft = () => {
    const html = editorRef.current.innerHTML;
    localStorage.setItem(saveKey, html);
    setSavedMessage(`📝 Draft saved for ${username || "guest"}!`);
    setTimeout(() => setSavedMessage(""), 1500);
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem(saveKey);
    if (draft) {
      if (editorRef.current) editorRef.current.innerHTML = draft;
      pushHistory(draft);
      setSavedMessage(`📂 Draft loaded for ${username || "guest"}!`);
    } else {
      setSavedMessage(`⚠️ No draft found for ${username || "guest"}.`);
    }
    setTimeout(() => setSavedMessage(""), 1500);
  };

  const handleDelete = () => {
    if (!confirm("Delete current note? This will clear the editor.")) return;
    if (editorRef.current) editorRef.current.innerHTML = "";
    localStorage.removeItem(saveKey);
    localStorage.removeItem("autoSavedNote");
    setHistory([]);
    setRedoStack([]);
    setSavedMessage("🗑️ Note cleared.");
    setTimeout(() => setSavedMessage(""), 1200);
  };

  // Export plain HTML or text (example helper)
  const getHtml = () => editorRef.current?.innerHTML ?? "";

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-left">
          <button onClick={() => handleDelete()} title="Delete note">🗑️</button>
          <button onClick={handleUndo} title="Undo">↩️</button>
          <button onClick={handleRedo} title="Redo">↪️</button>
        </div>

        <div className="toolbar-center">
          <select defaultValue="Arial" onChange={handleFontChange} title="Font">
            <option>Arial</option>
            <option>Georgia</option>
            <option>Verdana</option>
            <option>Tahoma</option>
            <option>Times New Roman</option>
            <option>Courier New</option>
          </select>

          <button onClick={() => format("bold")} title="Bold"><b>B</b></button>
          <button onClick={() => format("italic")} title="Italic"><i>I</i></button>
          <button onClick={() => format("underline")} title="Underline"><u>U</u></button>

          <label className="color-picker" title="Highlight">
            🎨
            <input type="color" onChange={(e) => handleColor(e.target.value)} />
          </label>
        </div>

        <div className="toolbar-right">
          <button onClick={handleSaveDraft} title="Save draft">💾 Save</button>
          <button onClick={handleLoadDraft} title="Load draft">📂 Load</button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="rich-editor"
        contentEditable
        onInput={handleInput}
        placeholder="Start typing your note..."
        suppressContentEditableWarning={true}
        style={{
          minHeight: "140px",
          padding: "12px",
          marginTop: "8px",
          border: "2px solid #c7d2fe",
          borderRadius: "10px",
          fontSize: "15px",
          background: "#fff"
        }}
      />

      {savedMessage && (
        <p style={{ color: "green", marginTop: "8px", fontWeight: "bold" }}>
          {savedMessage}
        </p>
      )}

      <p style={{ color: "#555", marginTop: "10px", fontSize: "14px" }}>
        Saved snippet:{" "}
        <strong>
          {(() => {
            const txt = (editorRef.current?.textContent || "").trim();
            return txt ? (txt.substring(0, 30) + (txt.length > 30 ? "..." : "")) : "No auto-saved note";
          })()}
        </strong>
      </p>
    </div>
  );
}

