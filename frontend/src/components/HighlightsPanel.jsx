import React, { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";

const colorMap = {
  yellow: "#FFFF00",
  green: "#00FF00",
  red: "#FF0000",
  blue: "#00AAFF",
  purple: "#FF00FF"
};

export default function HighlightsPanel({ 
  highlights = [], 
  onDeleteHighlight,
  onUpdateHighlight,
  onScrollToHighlight
}) {
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState("");

  const handleEditComment = (highlight) => {
    setEditingId(highlight._id);
    setEditComment(highlight.comment);
  };

  const handleSaveComment = async (highlight) => {
    await onUpdateHighlight(highlight._id, { comment: editComment });
    setEditingId(null);
  };

  if (!highlights || highlights.length === 0) {
    return (
      <div style={{ padding: "12px", color: "#999", textAlign: "center", fontSize: "13px" }}>
        No highlights yet. Select text and highlight it!
      </div>
    );
  }

  return (
    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
      {highlights.map((highlight) => (
        <div
          key={highlight._id}
          style={{
            padding: "12px",
            borderLeft: `4px solid ${colorMap[highlight.color] || "#FFFF00"}`,
            backgroundColor: "#f9f9f9",
            marginBottom: "8px",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          onClick={() => onScrollToHighlight(highlight.startOffset)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#333",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    backgroundColor: colorMap[highlight.color],
                    borderRadius: "2px"
                  }}
                />
                "{highlight.selectedText.substring(0, 50)}{highlight.selectedText.length > 50 ? "..." : ""}"
              </div>

              {editingId === highlight._id ? (
                <input
                  type="text"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  onBlur={() => handleSaveComment(highlight)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveComment(highlight);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "4px",
                    fontSize: "12px",
                    border: "1px solid #4CAF50",
                    borderRadius: "3px",
                    boxSizing: "border-box"
                  }}
                />
              ) : (
                <div style={{ fontSize: "12px", color: "#666", fontStyle: "italic", marginBottom: "4px" }}>
                  {highlight.comment || <span style={{ color: "#ccc" }}>No comment</span>}
                </div>
              )}

              <div style={{ fontSize: "11px", color: "#999" }}>
                {new Date(highlight.createdAt).toLocaleDateString()} {new Date(highlight.createdAt).toLocaleTimeString()}
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", marginLeft: "8px" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditComment(highlight);
                }}
                style={{
                  padding: "4px 6px",
                  fontSize: "12px",
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "3px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Edit comment"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteHighlight(highlight._id);
                }}
                style={{
                  padding: "4px 6px",
                  fontSize: "12px",
                  backgroundColor: "#ffebee",
                  border: "1px solid #ff9999",
                  borderRadius: "3px",
                  cursor: "pointer",
                  color: "#c62828",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Delete highlight"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
