import React from "react";
import { Highlighter, X, BookOpen } from "lucide-react";

const colors = [
  { name: "yellow", hex: "#FFFF00", label: "Yellow" },
  { name: "green", hex: "#00FF00", label: "Green" },
  { name: "red", hex: "#FF0000", label: "Red" },
  { name: "blue", hex: "#00AAFF", label: "Blue" },
  { name: "purple", hex: "#FF00FF", label: "Purple" }
];

export default function HighlightToolbar({ 
  selectedText, 
  selectedColor, 
  setSelectedColor, 
  onApply, 
  onCancel,
  comment,
  setComment,
  onCreateFlashcard
}) {
  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: "#fff",
        border: "2px solid #333",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 10000,
        minWidth: "280px"
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <p style={{ fontSize: "12px", color: "#666", margin: 0, marginBottom: "6px" }}>
          Selected: <strong>"{selectedText?.substring(0, 40)}{selectedText?.length > 40 ? "..." : ""}"</strong>
        </p>
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: "10px" }}>
        <p style={{ fontSize: "12px", fontWeight: "bold", margin: "0 0 6px 0" }}>Color:</p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              title={color.label}
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: color.hex,
                border: selectedColor === color.name ? "3px solid #333" : "1px solid #999",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            />
          ))}
        </div>
      </div>

      {/* Comment input */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
          Comment (optional):
        </label>
        <input
          type="text"
          placeholder="Add a note..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={120}
          style={{
            width: "100%",
            padding: "6px",
            fontSize: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxSizing: "border-box"
          }}
        />
        <p style={{ fontSize: "11px", color: "#999", margin: "4px 0 0 0" }}>
          {comment.length}/120
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => {
            console.log("❌ Cancel clicked");
            onCancel();
          }}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <X size={14} /> Cancel
        </button>
        {onCreateFlashcard && (
          <button
            type="button"
            onClick={onCreateFlashcard}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: "600"
            }}
          >
            <BookOpen size={14} /> Flashcard
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            console.log("🎨 Highlight button clicked", { onApply: !!onApply });
            if (onApply) {
              onApply();
            } else {
              console.error("❌ onApply is not defined!");
            }
          }}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: "600"
          }}
        >
          <Highlighter size={14} /> Highlight
        </button>
      </div>
    </div>
  );
}
