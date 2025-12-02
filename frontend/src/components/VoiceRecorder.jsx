import React, { useState, useEffect } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import "../styles/VoiceRecorder.css";

const VoiceRecorder = () => {
  const mediaRecorder = React.useRef(null);
  const audioChunks = React.useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch recordings on component mount
  useEffect(() => {
    fetchRecordings();
  }, []);

  // Fetch all recordings
  const fetchRecordings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/voice`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch recordings");
      const data = await response.json();
      setRecordings(data);
    } catch (err) {
      console.error("Error fetching recordings:", err);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { 
          type: "audio/webm" 
        });
        await uploadRecording(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setDuration(0);

      // Track duration
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to record");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // Upload recording to backend
  const uploadRecording = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append(
        "title",
        title || `Recording ${new Date().toLocaleString()}`
      );
      formData.append("duration", duration);

      const response = await fetch(`${API_URL}/api/voice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setRecordings([data.recording, ...recordings]);
        setTitle("");
        setDuration(0);
      } else {
        console.error("Failed to upload recording");
      }
    } catch (err) {
      console.error("Error uploading recording:", err);
    }
  };

  // Delete recording
  const deleteRecording = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/voice/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setRecordings(recordings.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Error deleting recording:", err);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="voice-recorder-container">
      <div className="recorder-panel">
        <h3>🎤 Voice Recorder</h3>
        <input
          type="text"
          placeholder="Recording title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />

        <div className="recording-controls">
          <div className="timer">{formatTime(duration)}</div>
          {!isRecording ? (
            <button className="record-btn" onClick={startRecording}>
              <Mic size={20} /> Start
            </button>
          ) : (
            <button className="stop-btn" onClick={stopRecording}>
              <Square size={20} /> Stop
            </button>
          )}
        </div>
      </div>

      <div className="recordings-list">
        <h3>Your Recordings</h3>
        {recordings.length === 0 ? (
          <p className="no-recordings">No recordings yet. Start recording!</p>
        ) : (
          recordings.map((recording) => (
            <div key={recording._id} className="recording-item">
              <div className="recording-info">
                <h4>{recording.title}</h4>
                <p>{formatTime(recording.duration)}</p>
              </div>
              <div className="recording-actions">
                <audio controls className="audio-player">
                  <source 
                    src={recording.audioUrl} 
                    type="audio/webm" 
                  />
                  Your browser does not support the audio element.
                </audio>
                <button
                  onClick={() => deleteRecording(recording._id)}
                  className="delete-btn"
                  title="Delete recording"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;