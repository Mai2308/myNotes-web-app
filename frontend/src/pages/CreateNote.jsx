import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NoteEditor from "../components/NoteEditor";
import ChecklistEditor from "../components/ChecklistEditor";
import ReminderForm from "../components/ReminderForm";
import { createReminder } from "../api/remindersApi";
import "../styles.css";
import { createNote as apiCreateNote, convertToChecklist, updateChecklistItems } from "../api/notesApi";
import { getFolders } from "../api/foldersApi";
import { ListTodo, FileText, Clock } from "lucide-react";

export default function CreateNote() {
  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderData, setReminderData] = useState(null);
  const editorRef = useRef(null);
  const location = useLocation();

  // Get folderId from navigation state if passed from Dashboard
  useEffect(() => {
    if (location.state?.folderId) {
      setFolderId(location.state.folderId);
    }
  }, [location.state]);

  // Load folders for dropdown
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getFolders(token);
        setFolders(data);
      } catch (err) {
        console.error("Failed to load folders", err);
      }
    };
    loadFolders();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (isChecklist) {
        if (checklistItems.length === 0) {
          setError("Add at least one checklist item.");
          setLoading(false);
          return;
        }

        // Compose plain text content from checklist items for initial note creation
        const contentFromItems = checklistItems.map(i => i.text).join("\n");

        const createRes = await apiCreateNote({
          title: title.trim() || "Untitled Checklist",
          content: contentFromItems,
          folderId: folderId || null,
        }, token);

        const noteId = createRes?.note?._id;
        if (!noteId) throw new Error("Failed to create note");

        // Convert the new note to checklist mode, then set items (to preserve completed/order)
        await convertToChecklist(noteId, token);
        await updateChecklistItems(noteId, checklistItems, token);

        // Create reminder if set
        if (reminderData) {
          try {
            await createReminder(noteId, reminderData);
          } catch (err) {
            console.error("Failed to create reminder:", err);
            // Don't fail note creation if reminder fails
          }
        }

      } else {
        const content = editorRef.current?.getContent() ?? "";
        if (!title.trim() && !content.trim()) {
          setError("Title or note content required.");
          setLoading(false);
          return;
        }

        const createRes = await apiCreateNote({
          title: title.trim(),
          content,
          folderId: folderId || null,
        }, token);

        const noteId = createRes?.note?._id;

        // Create reminder if set
        if (reminderData && noteId) {
          try {
            await createReminder(noteId, reminderData);
          } catch (err) {
            console.error("Failed to create reminder:", err);
            // Don't fail note creation if reminder fails
          }
        }
      }

      setSuccess("Note saved successfully!");
      setTitle("");
      setFolderId(null);
      setChecklistItems([]);
      setIsChecklist(false);
      setReminderData(null);
      setShowReminderForm(false);
      editorRef.current?.clearContent();
    } catch (err) {
      setError(err.message || "Failed to save note");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  // Build folder options with hierarchy
  const buildFolderOptions = () => {
    const buildTree = (parentId, depth = 0) => {
      return folders
        .filter((f) => f.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .flatMap((folder) => [
          { ...folder, depth },
          ...buildTree(folder._id, depth + 1)
        ]);
    };
    return buildTree(null);
  };

  const folderOptions = buildFolderOptions();

  return (
    <div className="auth-page center" style={{ padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 800 }}>
        <input
          className="note-title"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Folder Selection Dropdown */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>
            Save to Folder:
          </label>
          <select
            value={folderId || ""}
            onChange={(e) => setFolderId(e.target.value || null)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              backgroundColor: "var(--background)",
              color: "var(--text-color)",
            }}
          >
            <option value="">Root (No Folder)</option>
            {folderOptions.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {"—".repeat(folder.depth)} {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reminder Section */}
        <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "var(--bg-secondary, #f9f9f9)", borderRadius: "6px", border: "1px solid var(--border-color, #e0e0e0)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} />
              Reminder/Deadline:
            </label>
            <button
              type="button"
              className="btn"
              onClick={() => setShowReminderForm(!showReminderForm)}
              style={{ fontSize: "12px", padding: "6px 10px", backgroundColor: reminderData ? "var(--accent)" : "var(--accent-dark)", minWidth: "auto" }}
            >
              {reminderData ? "✓ Configured" : "Set Reminder"}
            </button>
          </div>
          
          {reminderData && !showReminderForm && (
            <div style={{ fontSize: "13px", color: "var(--text-secondary, #666)", padding: "8px", backgroundColor: "var(--bg-primary, #fff)", borderRadius: "4px" }}>
              📅 {new Date(reminderData.dueDate).toLocaleDateString()} at {new Date(reminderData.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {reminderData.recurring && reminderData.recurring.enabled && (
                <>
                  <br />
                  🔄 Repeats {reminderData.recurring.frequency}
                </>
              )}
            </div>
          )}

          {showReminderForm && (
            <ReminderForm
              onSubmit={(data) => {
                setReminderData(data);
                setShowReminderForm(false);
              }}
              onCancel={() => setShowReminderForm(false)}
              initialData={reminderData}
              isLoading={false}
            />
          )}
        </div>

        {/* Mode Toggle Button */}
        <div style={{ marginBottom: "16px" }}>
          <button
            className="btn mode-toggle-btn"
            onClick={() => setIsChecklist(v => !v)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: isChecklist ? "#6366f1" : "#10b981",
              width: "100%"
            }}
          >
            {isChecklist ? (
              <>
                <FileText size={18} /> Create as Regular Note
              </>
            ) : (
              <>
                <ListTodo size={18} /> Create as Checklist
              </>
            )}
          </button>
        </div>

        {/* Editor */}
        {isChecklist ? (
          <ChecklistEditor items={checklistItems} onChange={setChecklistItems} />
        ) : (
          <NoteEditor ref={editorRef} />
        )}

        {error && <div className="alert">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* Full-width Save Button */}
        <button
          className="btn"
          onClick={handleSave}
          disabled={loading}
          style={{ width: "100%", marginTop: 12 }}
        >
          {loading ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
