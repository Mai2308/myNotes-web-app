import React, { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, CheckSquare, Square } from "lucide-react";

export default function ChecklistEditor({ items = [], onChange }) {
  const [checklistItems, setChecklistItems] = useState(items);
  const [newItemText, setNewItemText] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);

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

  return (
    <div className="checklist-editor">
      {/* Add new item input */}
      <div className="checklist-add-item">
        <input
          type="text"
          placeholder="Add a new item..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="checklist-input"
        />
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
                type="text"
                value={item.text}
                onChange={(e) => handleEditItem(index, e.target.value)}
                className="checklist-item-text"
              />
              
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
