import React, { useRef, useState } from 'react';

export default function VoiceNotes({ onSave }) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = e => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioURL(URL.createObjectURL(blob));
    };
    mr.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function handleSaveVoice() {
    if (!chunksRef.current.length) return;
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const form = new FormData();
    form.append('audio', blob, 'note.webm');
    const res = await fetch('/api/notes/upload-voice', { method: 'POST', body: form });
    const uploaded = await res.json();
    const note = {
      content: 'Voice note',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0,10),
      audioPath: uploaded.file?.filename || uploaded.file?.path || null,
    };
    if (onSave) onSave(note);
  }

  return (
    <div>
      <h3>Voice Notes</h3>
      {!recording && <button onClick={startRecording}>Start</button>}
      {recording && <button onClick={stopRecording}>Stop</button>}
      {audioURL && (
        <>
          <audio controls src={audioURL} />
          <button onClick={handleSaveVoice}>Save voice note</button>
        </>
      )}
    </div>
  );
}
