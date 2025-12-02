import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { useView } from "../../context/ViewContext";

export default function NotesDragContainer({ notes }) {
  const { notesOrder, setNotesOrder, viewType } = useView();

  const currentOrder = notesOrder.length ? notesOrder : notes.map((n) => n._id);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const oldIndex = currentOrder.indexOf(active.id);
    const newIndex = currentOrder.indexOf(over.id);

    const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
    setNotesOrder(newOrder);
  };

  const orderedNotes = currentOrder
    .map((id) => notes.find((n) => n._id === id))
    .filter(Boolean);

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={currentOrder} strategy={verticalListSortingStrategy}>
        <div
          style={{
            display: viewType === "grid" ? "grid" : "block",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px"
          }}
        >
          {orderedNotes.map((note) => (
            <SortableItem key={note._id} id={note._id} note={note} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
