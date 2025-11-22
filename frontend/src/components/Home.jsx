import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ notes = [] }) {
  return (
    <div className="home">
      <h1>My Notes</h1>
      <p><Link to="/create">Create a new note</Link></p>
      <ul>
        {notes && notes.length > 0 ? (
          notes.map((n) => (
            <li key={n.id ?? n._id ?? Math.random()}>
              <Link to={`/edit/${n.id ?? n._id}`}>{n.title || 'Untitled'}</Link>
            </li>
          ))
        ) : (
          <li>No notes yet</li>
        )}
      </ul>
    </div>
  );
}