import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
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
import HighlightsPanel from "./HighlightsPanel";

const HIGHLIGHT_COLORS = {
  yellow: "#FFF59D",
  green: "#C8E6C9",
  red: "#FFCDD2",
  blue: "#BBDEFB",
  purple: "#E1BEE7",
};

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
  const [selectionOffsets, setSelectionOffsets] = useState({ start: null, end: null });
  const [selectedComment, setSelectedComment] = useState(null);

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
      console.log("📖 Loading highlights for noteId:", noteId);
      const token = localStorage.getItem("token");
      const data = await highlightsApi.getHighlights(noteId, token);
      console.log("✅ Loaded highlights:", data?.length || 0);
      if (data?.length > 0) {
        console.log("📋 Highlight data:", data.map(h => ({
          text: h.selectedText?.substring(0, 20),
          comment: h.comment || '(empty)',
          hasComment: !!h.comment
        })));
      }
      setHighlights(data);
    } catch (err) {
      console.warn("❌ Failed to load highlights:", err);
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

  const clearDomHighlights = useCallback(() => {
    if (!editorRef.current) return;
    
    // Remove comment indicator buttons
    const commentBtns = editorRef.current.querySelectorAll('.highlight-comment-indicator');
    commentBtns.forEach(btn => btn.remove());
    
    const spans = editorRef.current.querySelectorAll('[data-highlight-span="1"]');
    spans.forEach((span) => {
      const parent = span.parentNode;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    });
  }, []);

  const getTextNodes = useCallback((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let node = walker.nextNode();
    while (node) {
      nodes.push(node);
      node = walker.nextNode();
    }
    return nodes;
  }, []);

  const findPositionInText = useCallback((nodes, target) => {
    let traversed = 0;
    for (const node of nodes) {
      const len = node.nodeValue.length;
      if (traversed + len >= target) {
        return { node, offset: target - traversed };
      }
      traversed += len;
    }
    return null;
  }, []);

  const renderHighlights = useCallback((list = highlights) => {
    if (!editorRef.current || !list || list.length === 0) {
      clearDomHighlights();
      return;
    }

    clearDomHighlights();
    const nodes = getTextNodes(editorRef.current);
    if (!nodes.length) return;

    const sorted = [...list].sort((a, b) => a.startOffset - b.startOffset);
    sorted.forEach((h) => {
      if (h.startOffset == null || h.endOffset == null) return;
      if (h.endOffset <= h.startOffset) return;

      const startPos = findPositionInText(nodes, h.startOffset);
      const endPos = findPositionInText(nodes, h.endOffset);
      if (!startPos || !endPos) return;

      const range = document.createRange();
      try {
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
      } catch (e) {
        return;
      }

      const span = document.createElement("span");
      span.setAttribute("data-highlight-span", "1");
      if (h._id) span.setAttribute("data-highlight-id", h._id);
      span.style.backgroundColor = HIGHLIGHT_COLORS[h.color] || HIGHLIGHT_COLORS.yellow;
      span.style.borderRadius = "2px";
      span.style.padding = "0 2px";

      try {
        range.surroundContents(span);
        
        // Add comment indicator button inline if highlight has a comment
        if (h.comment && h.comment.trim()) {
          const commentBtn = document.createElement("button");
          commentBtn.innerHTML = "💬";
          commentBtn.className = "highlight-comment-indicator";
          commentBtn.setAttribute("data-comment", h.comment);
          commentBtn.setAttribute("data-highlight-id", h._id);
          commentBtn.style.cssText = `
            background: #3B82F6;
            border: none;
            border-radius: 4px;
            width: 24px;
            height: 20px;
            font-size: 12px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: 4px;
            vertical-align: middle;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            padding: 0;
            line-height: 1;
            transition: all 0.2s;
          `;
          commentBtn.title = "Click to view comment";
          
          // Prevent button click from affecting selection and show in side panel
          commentBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedComment({
              text: h.comment,
              highlightText: h.selectedText
            });
          });
          
          span.parentNode.insertBefore(commentBtn, span.nextSibling);
        }
      } catch (e) {
        // ignore invalid ranges that cross non-text nodes
      }
    });
  }, [clearDomHighlights, findPositionInText, getTextNodes, highlights]);

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

  useEffect(() => {
    renderHighlights(highlights);
  }, [highlights, renderHighlights]);

  const captureSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // Check if we're interacting with the highlight toolbar (input, buttons)
      const activeEl = document.activeElement;
      const isInToolbar = activeEl && activeEl.closest('[data-highlight-toolbar]');
      
      if (!isInToolbar) {
        setShowHighlightToolbar(false);
        setSelectedText("");
        setSelectionOffsets({ start: null, end: null });
      }
      return;
    }

    const range = selection.rangeCount ? selection.getRangeAt(0) : null;
    if (!range || !editorRef.current || !editorRef.current.contains(range.commonAncestorContainer)) {
      // Check if we're interacting with the highlight toolbar (input, buttons)
      const activeEl = document.activeElement;
      const isInToolbar = activeEl && activeEl.closest('[data-highlight-toolbar]');
      
      if (!isInToolbar) {
        setShowHighlightToolbar(false);
        setSelectedText("");
        setSelectionOffsets({ start: null, end: null });
      }
      return;
    }

    const rawText = selection.toString();
    const trimmed = rawText.trim();
    if (!trimmed) {
      setShowHighlightToolbar(false);
      setSelectedText("");
      setSelectionOffsets({ start: null, end: null });
      return;
    }

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editorRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + range.toString().length;

    const rect = range.getBoundingClientRect();
    const toolbarWidth = 350; // max-width from HighlightToolbar
    const toolbarHeight = 300; // estimated height
    
    let top = rect.top + window.scrollY - toolbarHeight - 10;
    let left = rect.left + window.scrollX;
    
    // Keep toolbar within viewport
    if (top < window.scrollY + 10) {
      top = rect.bottom + window.scrollY + 10; // show below selection if not enough space above
    }
    if (left + toolbarWidth > window.innerWidth) {
      left = window.innerWidth - toolbarWidth - 20;
    }
    if (left < 10) {
      left = 10;
    }
    
    setToolbarPos({ top, left });
    setSelectedText(rawText);
    setSelectionOffsets({ start, end });
    setShowHighlightToolbar(true);
  }, [setToolbarPos]);

  useEffect(() => {
    const handler = () => captureSelection();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, [captureSelection]);

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
      console.log("📍 handleApplyHighlight called", { 
        noteId, 
        selectedText, 
        comment,
        selectedColor,
        selectionOffsets
      });
      
      if (!noteId) {
        console.warn("⚠️ Cannot highlight: Note hasn't been saved yet");
        alert("❌ Please save the note first before highlighting text!");
        return;
      }
      
      if (!selectedText || !selectedText.trim()) {
        console.warn("⚠️ Missing selectedText");
        alert("Please select some text to highlight");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to add highlights.");
        return;
      }

      const { start, end } = selectionOffsets;
      if (start === null || end === null) {
        console.warn("⚠️ Selection offsets missing, ignoring highlight");
        alert("Selection offset error. Try selecting text again.");
        return;
      }

      const highlightData = {
        startOffset: start,
        endOffset: end,
        color: selectedColor || "yellow",
        selectedText: selectedText.trim(),
        comment: comment.trim() || ""
      };

      console.log("📤 Sending highlight data to API:", {
        ...highlightData,
        noteId,
        commentLength: highlightData.comment.length,
        commentEmpty: highlightData.comment === ""
      });
      
      const response = await highlightsApi.addHighlight(noteId, highlightData, token);
      console.log("✅ Highlight response from API:", response);
      
      setSavedMessage("✅ Highlight added!");
      setTimeout(() => setSavedMessage(""), 2000);
      
      await loadHighlights();

      setShowHighlightToolbar(false);
      setSelectedColor("yellow");
      setComment("");
      setSelectionOffsets({ start: null, end: null });
      setSelectedText("");
      window.getSelection().removeAllRanges();
    } catch (err) {
      console.error("❌ Failed to apply highlight:", err);
      alert(`Error: ${err.message || 'Failed to add highlight'}`);
    }
  };

  const handleDeleteHighlight = async (highlightId) => {
    try {
      const token = localStorage.getItem("token");
      await highlightsApi.deleteHighlight(noteId, highlightId, token);
      await loadHighlights();
    } catch (err) {
      console.error("Failed to delete highlight:", err);
    }
  };

  const handleUpdateHighlight = async (highlightId, updates) => {
    try {
      const token = localStorage.getItem("token");
      await highlightsApi.updateHighlight(noteId, highlightId, updates, token);
      await loadHighlights();
    } catch (err) {
      console.error("Failed to update highlight:", err);
    }
  };

  const handleScrollToHighlight = (offset) => {
    if (!editorRef.current) return;

    // Approximate scroll based on characters before the highlight
    const textBefore = editorRef.current.innerText.substring(0, offset);
    const lineCount = textBefore.split("\n").length;
    editorRef.current.focus();
    editorRef.current.parentElement.scrollTop = Math.max(lineCount * 24 - 50, 0);
  };

  // Flashcard handlers
  const handleCreateFlashcardClick = () => {
    if (!selectedText || !selectedText.trim()) {
      alert("Please select some text first to create a flashcard.");
      return;
    }
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
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
        onTouchEnd={captureSelection}
        suppressContentEditableWarning
      />

      {/* Comment display panel beside editor */}
      {selectedComment && (
        <div style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "280px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
          padding: "16px",
          marginLeft: "16px",
          maxHeight: "400px",
          overflowY: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 100
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1e40af" }}>
              💬 Comment
            </h4>
            <button
              onClick={() => setSelectedComment(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "#666",
                padding: "0",
                width: "20px",
                height: "20px"
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #dbeafe",
            marginBottom: "12px"
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: "13px", 
              color: "#1e40af",
              fontWeight: "500",
              marginBottom: "8px"
            }}>
              Highlighted text:
            </p>
            <p style={{
              margin: 0,
              fontSize: "12px",
              color: "#0c4a6e",
              fontStyle: "italic",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              "{selectedComment.highlightText}"
            </p>
          </div>

          <div style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #dbeafe"
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: "13px", 
              color: "#1e40af",
              fontWeight: "500",
              marginBottom: "8px"
            }}>
              Your note:
            </p>
            <p style={{
              margin: 0,
              fontSize: "13px",
              color: "#0c4a6e",
              lineHeight: "1.5",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}>
              {selectedComment.text}
            </p>
          </div>
        </div>
      )}

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
        <div 
          data-highlight-toolbar="true"
          style={{ position: "fixed", top: `${toolbarPos.top}px`, left: `${toolbarPos.left}px`, zIndex: 10001, pointerEvents: "auto" }}
        >
          <HighlightToolbar
            selectedText={selectedText}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            comment={comment}
            setComment={setComment}
            onApply={handleApplyHighlight}
            onCancel={() => {
              console.log("❌ Cancel toolbar clicked");
              setShowHighlightToolbar(false);
              setComment("");
              setSelectedColor("yellow");
              setSelectedText("");
              setSelectionOffsets({ start: null, end: null });
              window.getSelection().removeAllRanges();
            }}
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

      {showHighlightsPanel && (
        <div style={{ marginTop: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px", background: "#f8fafc" }}>
          <HighlightsPanel
            highlights={highlights}
            onDeleteHighlight={handleDeleteHighlight}
            onUpdateHighlight={handleUpdateHighlight}
            onScrollToHighlight={handleScrollToHighlight}
          />
        </div>
      )}
    </div>
  );
});

export default NoteEditor;

