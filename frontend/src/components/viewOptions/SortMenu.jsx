import { useView } from "../../context/ViewContext";

export default function SortMenu() {
  const { sort, setSort } = useView();

  return (
    <select
      value={sort}
      onChange={(e) => setSort(e.target.value)}
      style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
    >
     <option value="createdAt_desc">Newest First</option>
<option value="createdAt_asc">Oldest First</option>
      <option value="title_asc">Title A → Z</option>
      <option value="title_desc">Title Z → A</option>
      <option value="favorite">Favorites First</option>
    </select>
  );
}

