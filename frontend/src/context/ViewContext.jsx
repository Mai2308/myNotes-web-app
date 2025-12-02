import { createContext, useContext, useState } from "react";

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
  const [sort, setSort] = useState("createdAt_desc"); // default sort
  const [viewType, setViewType] = useState("grid");   // list OR grid
  const [notesOrder, setNotesOrder] = useState([]);   // drag & drop order

  return (
    <ViewContext.Provider
      value={{
        sort,
        setSort,
        viewType,
        setViewType,   // ⬅⬅⬅ ده اللي ناقص وكان عامل المشكلة
        notesOrder,
        setNotesOrder,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => useContext(ViewContext);

