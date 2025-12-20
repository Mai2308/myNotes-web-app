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
      data-highlight-toolbar="true"
      style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,105,180,0.3)",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 8px 32px rgba(255,105,180,0.15), 0 2px 8px rgba(0,0,0,0.1)",
        zIndex: 10001,
        minWidth: "300px",
        maxWidth: "350px",
        color: "#0f172a",
        pointerEvents: "auto"
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <p style={{ fontSize: "11px", color: "#6b7280", margin: 0, marginBottom: "6px", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>
          Selected Text
        </p>
        <p style={{ fontSize: "13px", color: "#333", margin: 0, fontWeight: "500", wordBreak: "break-word", maxHeight: "40px", overflow: "hidden", textOverflow: "ellipsis" }}>
          "{selectedText?.substring(0, 60)}{selectedText?.length > 60 ? "..." : ""}"
        </p>
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", margin: "0 0 8px 0", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Color:</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              title={color.label}
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: color.hex,
                border: selectedColor === color.name ? "3px solid #333" : "2px solid rgba(0,0,0,0.1)",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: selectedColor === color.name ? "0 0 0 2px rgba(255,105,180,0.3)" : "none"
              }}
            />
          ))}
        </div>
      </div>

      {/* Comment input */}
      <div style={{ marginBottom: "14px" }}>
        <label style={{ fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Comment (optional):
        </label>
        <input
          type="text"
          placeholder="Add a note..."
          value={comment}
          onChange={(e) => {
            console.log("📝 Comment changed:", { 
              newValue: e.target.value, 
              length: e.target.value.length 
            });
            setComment(e.target.value);
          }}
          maxLength={120}
          style={{
            width: "100%",
            padding: "8px 12px",
            fontSize: "13px",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "6px",
            boxSizing: "border-box",
            backgroundColor: "rgba(255,255,255,0.7)",
            color: "#0f172a",
            transition: "all 0.2s"
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
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log("❌ Cancel clicked");
            onCancel();
          }}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: "600",
            backgroundColor: "rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s",
            color: "#333",
            pointerEvents: "auto"
          }}
        >
          <X size={14} /> Cancel
        </button>
        {onCreateFlashcard && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("📚 Flashcard button clicked");
              onCreateFlashcard();
            }}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #7afcff 0%, #42d9f4 100%)",
              color: "#0f172a",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(122,252,255,0.3)",
              pointerEvents: "auto"
            }}
          >
            <BookOpen size={14} /> Flashcard
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log("🎨 Highlight button clicked", { onApply: !!onApply });
            if (onApply) {
              console.log("📤 Calling onApply handler");
              onApply();
            } else {
              console.error("❌ onApply is not defined!");
            }
          }}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: "600",
            background: "linear-gradient(135deg, #ff7eb9 0%, #ff5ca2 100%)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s",
            boxShadow: "0 4px 12px rgba(255,105,180,0.3)",
            pointerEvents: "auto"
          }}
        >
          <Highlighter size={14} /> Highlight
        </button>
      </div>
    </div>
  );
}
