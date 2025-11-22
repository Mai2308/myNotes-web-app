import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditNote({ notes = [], onSave }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const note = notes.find(n => String(n.id) === String(id));
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    }
  }, [id, notes]);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { id, title, content };
    if (typeof onSave === 'function') onSave(payload);
    navigate('/');
  }

  return (
    <div className="edit-note">
      <h2>Edit Note</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}