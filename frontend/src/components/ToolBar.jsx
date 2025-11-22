import React, { useRef, useState, useEffect } from "react";

export default function NoteEditor() {
  const editorRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    // init history with current content
    const html = editorRef.current?.innerHTML ?? "";
    if (html) setHistory([html]);
  }, []);

  const pushHistory = (snap) => {
    setHistory((h) => {
      const next = [...h, snap].slice(-50);
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
    // hiliteColor works in many browsers
    try { document.execCommand("hiliteColor", false, color); }
    catch { document.execCommand("backColor", false, color); }
    pushHistory(editorRef.current.innerHTML);
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-left">
          <button onClick={() => exec("bold")} title="Bold"><b>B</b></button>
          <button onClick={() => exec("italic")} title="Italic"><i>I</i></button>
          <button onClick={() => exec("underline")} title="Underline"><u>U</u></button>
          <select onChange={(e) => exec("fontName", e.target.value)} defaultValue="Arial" title="Font">
            <option>Arial</option><option>Georgia</option><option>Verdana</option><option>Tahoma</option><option>Times New Roman</option>
          </select>
          <input type="color" onChange={(e) => setHighlight(e.target.value)} title="Highlight" />
        </div>

        <div className="toolbar-right">
          <button onClick={undo} title="Undo">↩</button>
          <button onClick={redo} title="Redo">↪</button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="rich-editor"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        placeholder="Write your note here..."
        style={{ minHeight: 160, padding: 12, borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}
      />
    </div>
  );
}