import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, note }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#fff",
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      <h4>{note.title}</h4>
      <p>{note.content?.slice(0, 80)}...</p>
    </div>
  );
}
