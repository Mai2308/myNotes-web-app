import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const NotesList = ({ notes, setNotes, layout }) => {
  if (notes.length === 0) return <p>No notes found.</p>;

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order for backend
    const updatedItems = items.map((note, index) => ({ ...note, order: index + 1 }));
    setNotes(updatedItems);

    // Call backend to save new order
    fetch("http://localhost:5000/api/notes/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItems.map(n => ({ id: n.id, order: n.order }))),
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="notes">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              display: "grid",
              gridTemplateColumns: layout === "grid" ? "repeat(2, 1fr)" : "1fr",
              gap: "15px",
            }}
          >
            {notes.map((note, index) => (
              <Draggable key={note.id} draggableId={note.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      ...provided.draggableProps.style,
                    }}
                  >
                    <h3>{note.title}</h3>
                    <p>{note.content}</p>
                    <small>{new Date(note.createdAt).toLocaleString()}</small>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default NotesList;


