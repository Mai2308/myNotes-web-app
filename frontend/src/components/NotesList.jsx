const NotesList = ({ notes }) => {
  if (notes.length === 0) {
    return <p>No notes found.</p>;
  }

  return (
    <div>
      {notes.map(note => (
        <div key={note.id} style={{
          border: "1px solid #ddd",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "8px"
        }}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
