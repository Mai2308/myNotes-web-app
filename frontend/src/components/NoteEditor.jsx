import React, { useState, useEffect, useRef } from "react";

export default function NoteEditor() {
    const editorRef = useRef(null);
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [savedMessage, setSavedMessage] = useState("");
    const username = "";
    const saveKey = "autoSavedNote";

    useEffect(() => {
      const html = editorRef.current?.innerHTML ?? "";
      if (html) setHistory([html]);
    }, []);

    const pushHistory = (snapshot) => {
      setHistory((h) => {
        const next = [...h, snapshot].slice(-50);
        setRedoStack([]);
        return next;
      });
    };

    const handleInput = () => {
      pushHistory(editorRef.current.innerHTML);
    };

    const exec = (cmd, val = null) => {
      document.execCommand(cmd, false, val);
      pushHistory(editorRef.current.innerHTML);
      editorRef.current.focus();
    };

    const undo = () => {
      if (history.length <= 1) return;
      const last = history[history.length - 1];
      const prev = history[history.length - 2];
      setRedoStack((r) => [last, ...r]);
      setHistory((h) => h.slice(0, -1));
      editorRef.current.innerHTML = prev;
    };

    const redo = () => {
      if (!redoStack.length) return;
      const next = redoStack[0];
      setRedoStack((r) => r.slice(1));
      setHistory((h) => [...h, next]);
      editorRef.current.innerHTML = next;
    };

    const setHighlight = (color) => {
      try { document.execCommand("hiliteColor", false, color); }
      catch { document.execCommand("backColor", false, color); }
      pushHistory(editorRef.current.innerHTML);
    };

    const setNoteBackground = (color) => {
      const el = editorRef.current;
      if (!el) return;
      el.style.backgroundColor = color || "";
      if (color) el.dataset.bg = color;
      else delete el.dataset.bg;
      pushHistory(el.innerHTML);
      el.focus();
    };

    const clearBackground = () => setNoteBackground("");

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
      if (!window.confirm("Delete current note? This will clear the editor.")) return;
      if (editorRef.current) editorRef.current.innerHTML = "";
      localStorage.removeItem(saveKey);
      localStorage.removeItem("autoSavedNote");
      setHistory([]);
      setRedoStack([]);
      setSavedMessage("🗑️ Note cleared.");
      setTimeout(() => setSavedMessage(""), 1200);
    };

    return (
      <div>
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <button onClick={() => exec("bold")}><b>B</b></button>
            <button onClick={() => exec("italic")}><i>I</i></button>
            <button onClick={() => exec("underline")}><u>U</u></button>

            <select onChange={(e) => exec("fontName", e.target.value)} defaultValue="Arial">
              <option>Arial</option>
              <option>Georgia</option>
              <option>Verdana</option>
              <option>Tahoma</option>
              <option>Times New Roman</option>
              <option>Courier New</option>
            </select>

            <input type="color" onChange={(e) => setNoteBackground(e.target.value)} />
            <button onClick={clearBackground}>Clear BG</button>
          </div>

          <div className="toolbar-right">
            <button onClick={undo}>↩</button>
            <button onClick={redo}>↪</button>
          </div>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          className="rich-editor"
          contentEditable
          onInput={handleInput}
          suppressContentEditableWarning={true}
          style={{ minHeight: "140px", padding: "50px", background: "#fff" }}
        />
        

        



        {savedMessage && <p>{savedMessage}</p>}

        <button onClick={handleSaveDraft} title="Save draft">💾 Save</button>
        <button onClick={handleLoadDraft} title="Load draft">📂 Load</button>
        
      </div>
    );
}
