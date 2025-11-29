import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, GripVertical, CheckSquare, Square } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

export default function ChecklistEditor({ items = [], onChange }) {
  const [checklistItems, setChecklistItems] = useState(items);
  const [newItemText, setNewItemText] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const newItemInputRef = useRef(null);
  const itemInputRefs = useRef({});

  useEffect(() => {
    setChecklistItems(items);
  }, [items]);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem = {
      text: newItemText.trim(),
      completed: false,
      order: checklistItems.length
    };

    const updatedItems = [...checklistItems, newItem];
    setChecklistItems(updatedItems);
    setNewItemText("");
    
    if (onChange) {
      onChange(updatedItems);
    }
  };

  const handleToggleItem = (index) => {
    const updatedItems = checklistItems.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedItems);
    
    if (onChange) {
      onChange(updatedItems);
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = checklistItems
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, order: i }));
    
    setChecklistItems(updatedItems);
    
    if (onChange) {
      onChange(updatedItems);
    }
  };

  const handleEditItem = (index, newText) => {
    const updatedItems = checklistItems.map((item, i) =>
      i === index ? { ...item, text: newText } : item
    );
    setChecklistItems(updatedItems);
    
    if (onChange) {
      onChange(updatedItems);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const items = [...checklistItems];
    const draggedItem = items[draggedIndex];
    
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    const reorderedItems = items.map((item, i) => ({ ...item, order: i }));
    setChecklistItems(reorderedItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    
    if (onChange) {
      onChange(checklistItems);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleEmojiPick = (emoji, index = null) => {
    if (index === null) {
      // Add to new item input
      const input = newItemInputRef.current;
      if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const newText = newItemText.slice(0, start) + emoji + newItemText.slice(end);
        setNewItemText(newText);
        // Set cursor position after emoji
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = start + emoji.length;
          input.focus();
        }, 0);
      } else {
        setNewItemText(newItemText + emoji);
      }
      setActiveInputIndex(null);
    } else {
      // Add to existing item
      const input = itemInputRefs.current[index];
      if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const item = checklistItems[index];
        const newText = item.text.slice(0, start) + emoji + item.text.slice(end);
        handleEditItem(index, newText);
        // Set cursor position after emoji
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = start + emoji.length;
          input.focus();
        }, 0);
      } else {
        const item = checklistItems[index];
        handleEditItem(index, item.text + emoji);
      }
      setActiveInputIndex(null);
    }
  };

  return (
    <div className="checklist-editor">
      {/* Add new item input */}
      <div className="checklist-add-item">
        <input
          ref={newItemInputRef}
          type="text"
          placeholder="Add a new item..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setActiveInputIndex(null)}
          className="checklist-input"
        />
        <div style={{ position: "relative", display: "inline-block" }}>
          <EmojiPicker compact onPick={(emoji) => handleEmojiPick(emoji, null)} />
        </div>
        <button 
          onClick={handleAddItem}
          className="checklist-add-btn"
          disabled={!newItemText.trim()}
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {/* Checklist items */}
      <div className="checklist-items">
        {checklistItems.length === 0 ? (
          <p className="checklist-empty">No items yet. Add your first item above!</p>
        ) : (
          checklistItems.map((item, index) => (
            <div
              key={index}
              className={`checklist-item ${item.completed ? "completed" : ""} ${draggedIndex === index ? "dragging" : ""}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="checklist-item-drag">
                <GripVertical size={16} />
              </div>
              
              <button
                className="checklist-checkbox"
                onClick={() => handleToggleItem(index)}
              >
                {item.completed ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              
              <input
                ref={(el) => (itemInputRefs.current[index] = el)}
                type="text"
                value={item.text}
                onChange={(e) => handleEditItem(index, e.target.value)}
                onFocus={() => setActiveInputIndex(index)}
                className="checklist-item-text"
              />
              
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <EmojiPicker compact onPick={(emoji) => handleEmojiPick(emoji, index)} />
              </div>
              
              <button
                className="checklist-delete-btn"
                onClick={() => handleDeleteItem(index)}
                title="Delete item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Progress indicator */}
      {checklistItems.length > 0 && (
        <div className="checklist-progress">
          <div className="checklist-progress-bar">
            <div 
              className="checklist-progress-fill"
              style={{ 
                width: `${(checklistItems.filter(item => item.completed).length / checklistItems.length) * 100}%` 
              }}
            />
          </div>
          <span className="checklist-progress-text">
            {checklistItems.filter(item => item.completed).length} / {checklistItems.length} completed
          </span>
        </div>
      )}
    </div>
  );
}
