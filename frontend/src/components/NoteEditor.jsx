import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

import {
  Bold,
  Italic,
  Underline,
  Undo,
  Redo,
  Palette,
  Trash2,
  Save,
  Upload,
} from "lucide-react";

const NoteEditor = forwardRef((props, ref) => {
  const { onSave } = props || {};

  const editorRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [savedMessage, setSavedMessage] = useState("");
  const saveKey = "autoSavedNote";

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.innerHTML || "",
    setContent: (html) => {
      if (editorRef.current) {
        editorRef.current.innerHTML = html || "";
        setHistory([html || ""]);
        setRedoStack([]);
      }
    },
    clearContent: () => {
      if (editorRef.current) editorRef.current.innerHTML = "";
      setHistory([]);
      setRedoStack([]);
    },
  }));

  useEffect(() => {
    const html = editorRef.current?.innerHTML ?? "";
    if (html) setHistory([html]);
  }, []);

  const pushHistory = (snapshot) => {
    setHistory((h) => [...h, snapshot].slice(-50));
    setRedoStack([]);
  };

  const handleInput = () => {
    const html = editorRef.current?.innerHTML ?? "";
    pushHistory(html);
  };

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);

    const html = editorRef.current?.innerHTML ?? "";
    pushHistory(html);
    editorRef.current?.focus();
  };

  const undo = () => {
    if (history.length <= 1) return;

    const last = history[history.length - 1];
    const prev = history[history.length - 2];

    setRedoStack((r) => [last, ...r]);
    setHistory((h) => h.slice(0, -1));

    if (editorRef.current) {
      editorRef.current.innerHTML = prev.replace(/<!--bg:.*?-->/, "");
      const bgMatch = prev.match(/<!--bg:(.*?)-->/);
      if (bgMatch && bgMatch[1]) {
        editorRef.current.style.setProperty("background-color", bgMatch[1], "important");
      } else {
        editorRef.current.style.removeProperty("background-color");
      }
    }
  };

  const redo = () => {
    if (!redoStack.length) return;

    const next = redoStack[0];
    setRedoStack((r) => r.slice(1));
    setHistory((h) => [...h, next]);

    if (editorRef.current) {
      editorRef.current.innerHTML = next.replace(/<!--bg:.*?-->/, "");
      const bgMatch = next.match(/<!--bg:(.*?)-->/);
      if (bgMatch && bgMatch[1]) {
        editorRef.current.style.setProperty("background-color", bgMatch[1], "important");
      } else {
        editorRef.current.style.removeProperty("background-color");
      }
    }
  };

  const setNoteBackground = (color) => {
    const el = editorRef.current;
    if (!el) return;

    if (color) {
      // ensure we override any stylesheet !important rules
      el.style.setProperty("background-color", color, "important");
    } else {
      el.style.removeProperty("background-color");
    }

    const snapshot =
      el.innerHTML + `<!--bg:${color || ""}-->`;

    pushHistory(snapshot);
    el.focus();
  };

  const handleSaveDraft = () => {
    const html = editorRef.current?.innerHTML ?? "";
    localStorage.setItem(saveKey, html);

    setSavedMessage(`📝 Draft saved!`);
    setTimeout(() => setSavedMessage(""), 1200);
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem(saveKey);

    if (draft) {
      editorRef.current.innerHTML = draft;
      pushHistory(draft);
      setSavedMessage("📂 Draft loaded!");
    } else {
      setSavedMessage("⚠️ No draft found.");
    }

    setTimeout(() => setSavedMessage(""), 1200);
  };

  const handleDelete = () => {
    if (!window.confirm("Delete the current note?")) return;

    editorRef.current.innerHTML = "";
    editorRef.current.style.removeProperty("background-color");
    localStorage.removeItem(saveKey);
    setHistory([]);
    setRedoStack([]);
  };

  return (
    <div className="note-editor-container">

      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={() => exec("bold")}><Bold size={16} /></button>
        <button onClick={() => exec("italic")}><Italic size={16} /></button>
        <button onClick={() => exec("underline")}><Underline size={16} /></button>

        <div className="divider"></div>

        <label className="color-picker">
          <Palette size={16} />
          <input type="color" onChange={(e) => setNoteBackground(e.target.value)} />
        </label>

        <div className="divider"></div>

        <button onClick={undo}><Undo size={16} /></button>
        <button onClick={redo}><Redo size={16} /></button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="rich-editor"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
      />

      {savedMessage && <p className="saved-msg">{savedMessage}</p>}

      <div className="save-controls">
        <button onClick={handleSaveDraft}><Save size={16} /> Save Draft</button>
        <button onClick={handleLoadDraft}><Upload size={16} /> Load Draft</button>
        <button onClick={handleDelete} className="danger"><Trash2 size={16} /> Delete</button>

        {onSave && (
          <button
            className="btn-primary"
            onClick={() => onSave(editorRef.current?.innerHTML || "")}
          >
            <Save size={16} /> Save
          </button>
        )}
      </div>
    </div>
  );
});

export default NoteEditor;

