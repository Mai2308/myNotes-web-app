import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

// Use forwardRef to allow parent component to access editor methods
const NoteEditor = forwardRef((props, ref) => {
  const editorRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [savedMessage, setSavedMessage] = useState("");
  const username = "";
  const saveKey = "autoSavedNote";

  const { theme } = useTheme();

  // expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.innerHTML || "",
    clearContent: () => {
      if (editorRef.current) editorRef.current.innerHTML = "";
      setHistory([]);
      setRedoStack([]);
    },
  }));

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (!el.dataset.bg) el.style.backgroundColor = "";
    el.style.color = "";
  }, [theme]);

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
    if (!editorRef.current) return;
    pushHistory(editorRef.current.innerHTML);
  };

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      pushHistory(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    setRedoStack((r) => [last, ...r]);
    setHistory((h) => h.slice(0, -1));
    if (editorRef.current) editorRef.current.innerHTML = prev;
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[0];
    setRedoStack((r) => r.slice(1));
    setHistory((h) => [...h, next]);
    if (editorRef.current) editorRef.current.innerHTML = next;
  };

  // Highlight function (currently unused, can be wired to UI later)
  // const setHighlight = (color) => {
  //   try {
  //     document.execCommand("hiliteColor", false, color);
  //   } catch {
  //     document.execCommand("backColor", false, color);
  //   }
  //   if (editorRef.current) pushHistory(editorRef.current.innerHTML);
  // };

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
    const html = editorRef.current?.innerHTML ?? "";
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
      <div className="toolbar" style={{ marginBottom: 10 }}>
        <div className="toolbar-left" style={{ display: "flex", gap: 5 }}>
          <button className="toolbar-btn" onClick={() => exec("bold")}><b>B</b></button>
          <button className="toolbar-btn" onClick={() => exec("italic")}><i>I</i></button>
          <button className="toolbar-btn" onClick={() => exec("underline")}><u>U</u></button>

          <select className="toolbar-select" onChange={(e) => exec("fontName", e.target.value)} defaultValue="Arial">
            <option>Arial</option>
            <option>Georgia</option>
            <option>Verdana</option>
            <option>Tahoma</option>
            <option>Times New Roman</option>
            <option>Courier New</option>
          </select>

          <input className="toolbar-color" type="color" onChange={(e) => setNoteBackground(e.target.value)} />
          <button className="toolbar-btn" onClick={clearBackground}>Clear BG</button>
        </div>

        <div className="toolbar-right" style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
          <ThemeToggle />
          <button className="toolbar-btn" onClick={undo} title="Undo">↩</button>
          <button className="toolbar-btn" onClick={redo} title="Redo">↪</button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="rich-editor"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning={true}
      />

      {savedMessage && <p>{savedMessage}</p>}

      <div style={{ marginTop: 10, display: "flex", gap: 5 }}>
        <button onClick={handleSaveDraft}>💾 Save Draft</button>
        <button onClick={handleLoadDraft}>📂 Load Draft</button>
        <button onClick={handleDelete}>🗑️ Delete</button>
      </div>
    </div>
  );
});

export default NoteEditor;
