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
  Clock,
  MessageSquare,
} from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import ReminderModal from "./ReminderModal";
import { addEmojiToNote } from "../api/notesApi";
import * as highlightsApi from "../api/highlightsApi";
import * as flashcardsApi from "../api/flashcardsApi";
import HighlightToolbar from "./HighlightToolbar";
import FlashcardCreator from "./FlashcardCreator";

const NoteEditor = forwardRef((props, ref) => {
  const { onSave, noteId, onReminderChange } = props || {};

  const editorRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [savedMessage, setSavedMessage] = useState("");
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminder, setReminder] = useState(null);
  const saveKey = "autoSavedNote";

  // Highlight state
  const [highlights, setHighlights] = useState([]);
  const [showHighlightToolbar, setShowHighlightToolbar] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [comment, setComment] = useState("");
  const [showHighlightsPanel, setShowHighlightsPanel] = useState(false);

  // Flashcard state
  const [showFlashcardCreator, setShowFlashcardCreator] = useState(false);

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
    getReminder: () => reminder,
    setReminder: (remindData) => setReminder(remindData),
  }));

  useEffect(() => {
    const html = editorRef.current?.innerHTML ?? "";
    if (html) setHistory([html]);
  }, []);

  // Load highlights when noteId changes
  const loadHighlights = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await highlightsApi.getHighlights(noteId, token);
      setHighlights(data);
    } catch (err) {
      console.warn("Failed to load highlights:", err);
      // Non-blocking error - don't show alert
    }
  };

  useEffect(() => {
    if (noteId) {
      loadHighlights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

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

  const insertEmojiAtCaret = async (emoji) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      editorRef.current?.focus();
    }
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    const el = editorRef.current;
    if (!el) return;
    el.focus();

    try {
      if (range) {
        range.deleteContents();
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);
        // Move caret after inserted emoji
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        document.execCommand("insertText", false, emoji);
      }
    } catch (e) {
      document.execCommand("insertText", false, emoji);
    }

    const html = el.innerHTML ?? "";
    pushHistory(html);

    // Sync emoji metadata if we have a noteId
    try {
      if (noteId) {
        const token = localStorage.getItem("token");
        await addEmojiToNote(noteId, emoji, token);
      }
    } catch (err) {
      // non-blocking
      console.warn("Failed to sync emoji", err);
    }
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

  // Highlight handlers
  const handleApplyHighlight = async () => {
    try {
      console.log("📍 handleApplyHighlight called", { noteId, selectedText });
      if (!noteId) {
        console.warn("⚠️ Cannot highlight: Note hasn't been saved yet");
        alert("Please save the note first before highlighting text!");
        return;
      }
      
      if (!selectedText) {
        console.warn("⚠️ Missing selectedText");
        return;
      }

      const token = localStorage.getItem("token");

      // Get start and end offsets from the entire content
      const editorContent = editorRef.current.innerText;
      const offset = editorContent.indexOf(selectedText);

      // Validate offset calculation
      if (offset < 0) {
        console.error("❌ Text not found in editor content");
        return;
      }

      const highlightData = {
        startOffset: offset,
        endOffset: offset + selectedText.length,
        color: selectedColor,
        selectedText: selectedText,
        comment: comment
      };

      console.log("📤 Sending highlight data:", highlightData);
      await highlightsApi.addHighlight(noteId, highlightData, token);
      console.log("✅ Highlight added successfully");
      
      await loadHighlights();

      setShowHighlightToolbar(false);
      setSelectedColor("yellow");
      setComment("");
      window.getSelection().removeAllRanges();
    } catch (err) {
      console.error("❌ Failed to apply highlight:", err);
      alert(`Error: ${err.message}`);
    }
  };

  // TODO: Wire up these handlers to HighlightsPanel component
  // const handleDeleteHighlight = async (highlightId) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     await highlightsApi.deleteHighlight(noteId, highlightId, token);
  //     await loadHighlights();
  //   } catch (err) {
  //     console.error("Failed to delete highlight:", err);
  //   }
  // };

  // const handleUpdateHighlight = async (highlightId, updates) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     await highlightsApi.updateHighlight(noteId, highlightId, updates, token);
  //     await loadHighlights();
  //   } catch (err) {
  //     console.error("Failed to update highlight:", err);
  //   }
  // };

  // const handleScrollToHighlight = (offset) => {
  //   // Simple scroll to position
  //   if (editorRef.current) {
  //     const text = editorRef.current.innerText;
  //     if (offset < text.length) {
  //       editorRef.current.focus();
  //       // Approximate scroll position
  //       const lines = text.substring(0, offset).split('\n').length;
  //       editorRef.current.parentElement.scrollTop = lines * 24;
  //     }
  //   }
  // };

  // Flashcard handlers
  const handleCreateFlashcardClick = () => {
    setShowHighlightToolbar(false);
    setShowFlashcardCreator(true);
  };

  const handleCreateFlashcard = async (flashcardData) => {
    try {
      const token = localStorage.getItem("token");
      await flashcardsApi.createFlashcard(flashcardData, token);
      setShowFlashcardCreator(false);
      setSelectedText("");
      alert("Flashcard created successfully!");
    } catch (err) {
      console.error("Failed to create flashcard:", err);
      alert(`Error creating flashcard: ${err.message}`);
    }
  };

  return (
    <div className="note-editor-container">

      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={() => exec("bold")}><Bold size={16} /></button>
        <button onClick={() => exec("italic")}><Italic size={16} /></button>
        <button onClick={() => exec("underline")}><Underline size={16} /></button>

        <div className="divider"></div>

        {/* Emoji picker */}
        <EmojiPicker compact onPick={insertEmojiAtCaret} />

        <label className="color-picker">
          <Palette size={16} />
          <input type="color" onChange={(e) => setNoteBackground(e.target.value)} />
        </label>

        {/* Highlights panel toggle */}
        <button 
          onClick={() => setShowHighlightsPanel(!showHighlightsPanel)}
          title={`Highlights (${highlights.length})`}
          style={{ position: "relative" }}
        >
          <MessageSquare size={16} />
          {highlights.length > 0 && (
            <span style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              backgroundColor: "#FF6B6B",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold"
            }}>
              {highlights.length}
            </span>
          )}
        </button>

        <div className="divider"></div>

        {/* Reminder button */}
        <button 
          onClick={() => setShowReminderModal(true)}
          title={reminder ? `Reminder: ${new Date(reminder.reminderDate).toLocaleString()}` : "Set a reminder"}
          className={reminder ? "reminder-active" : ""}
        >
          <Clock size={16} />
          {reminder && <span style={{ fontSize: '10px', marginLeft: '4px' }}>✓</span>}
        </button>

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

      {showReminderModal && (
        <ReminderModal
          initialReminder={reminder}
          onSave={(reminderData) => {
            // Handle both setting and removing reminders
            setReminder(reminderData);
            if (onReminderChange) onReminderChange(reminderData);
            // Show confirmation message
            setSavedMessage(`Reminder set for ${new Date(reminderData.reminderDate).toLocaleString()}`);
            setTimeout(() => setSavedMessage(""), 3000);
          }}
          onClose={() => setShowReminderModal(false)}
        />
      )}

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

      {/* Highlight toolbar (floating) */}
      {showHighlightToolbar && (
        <div style={{ position: "fixed", top: `${toolbarPos.top}px`, left: `${toolbarPos.left}px`, zIndex: 10001, pointerEvents: "auto" }}>
          <HighlightToolbar
            selectedText={selectedText}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            comment={comment}
            setComment={setComment}
            onApply={handleApplyHighlight}
            onCancel={() => setShowHighlightToolbar(false)}
            onCreateFlashcard={handleCreateFlashcardClick}
          />
        </div>
      )}

      {/* Flashcard creator modal */}
      {showFlashcardCreator && (
        <FlashcardCreator
          selectedText={selectedText}
          noteId={noteId}
          onSave={handleCreateFlashcard}
          onCancel={() => {
            setShowFlashcardCreator(false);
            setSelectedText("");
          }}
        />
      )}
    </div>
  );
});

export default NoteEditor;

