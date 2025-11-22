const NotesList = ({ notes, onToggleFavourite }) => {
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
          borderRadius: "8px",
          position: "relative"
        }}>
          {onToggleFavourite && (
            <button
              onClick={() => onToggleFavourite(note.id)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                padding: "5px"
              }}
              title={note.isFavourite ? "Remove from favourites" : "Add to favourites"}
            >
              {note.isFavourite ? "⭐" : "☆"}
            </button>
          )}
          <h3>{note.title}</h3>
          {/* Content is sanitized on the server using sanitize-html before storage */}
          <p dangerouslySetInnerHTML={{ __html: note.content }} />
        </div>
      ))}
    </div>
  );
};

export default NotesList;
