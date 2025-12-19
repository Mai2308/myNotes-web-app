import React, { useState } from "react";
import { X, Plus } from "lucide-react";

export default function FlashcardCreator({ selectedText, onCancel, onSave, noteId }) {
  const [front, setFront] = useState(selectedText || "");
  const [back, setBack] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      alert("Both front and back are required!");
      return;
    }
    onSave({ front: front.trim(), back: back.trim(), noteId });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: "#fff",
          border: "2px solid #4CAF50",
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          minWidth: "320px",
          maxWidth: "400px",
          maxHeight: "80vh",
          overflow: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#4CAF50" }}>
          Create Flashcard
        </h3>
        <button
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px"
          }}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
            Front (Question/Term):
          </label>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="What is the question?"
            rows={3}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "13px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
            Back (Answer/Definition):
          </label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="What is the answer?"
            rows={3}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "13px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Plus size={16} /> Create
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
