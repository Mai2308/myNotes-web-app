import { useView } from "../../context/ViewContext";

export default function ViewLayoutSelector() {
  const { viewType, setViewType } = useView();

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        onClick={() => setViewType("grid")}
        style={{
          padding: "8px 14px",
          borderRadius: "6px",
          background: viewType === "grid" ? "#007bff" : "#ccc",
          color: "#fff",
          border: "none"
        }}
      >
        Grid
      </button>

      <button
        onClick={() => setViewType("list")}
        style={{
          padding: "8px 14px",
          borderRadius: "6px",
          background: viewType === "list" ? "#007bff" : "#ccc",
          color: "#fff",
          border: "none"
        }}
      >
        List
      </button>
    </div>
  );
}
