import React from 'react';

function NoteItem({ note }) {
  return (
    <div style={{ border: '1px solid gray', margin: '10px', padding: '10px' }}>
      <h3>{note.title}</h3>
      <p>{note.content}</p>
    </div>
  );
}

export default NoteItem;
