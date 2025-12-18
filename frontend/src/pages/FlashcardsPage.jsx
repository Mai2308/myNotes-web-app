import React, { useState, useEffect } from "react";
import { Trash2, Edit2, Check, X, RotateCcw } from "lucide-react";
import * as flashcardsApi from "../api/flashcardsApi";
import "../styles.css";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [dueFlashcards, setDueFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [editMastery, setEditMastery] = useState(0);
  const [editNextReviewDate, setEditNextReviewDate] = useState("");

  useEffect(() => {
    loadFlashcards();
    loadDueFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await flashcardsApi.getFlashcards(null, token);
      setFlashcards(data);
    } catch (err) {
      console.error("Failed to load flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDueFlashcards = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await flashcardsApi.getDueFlashcards(token);
      setDueFlashcards(data);
    } catch (err) {
      console.error("Failed to load due flashcards:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this flashcard?")) return;
    try {
      const token = localStorage.getItem("token");
      await flashcardsApi.deleteFlashcard(id, token);
      await loadFlashcards();
      await loadDueFlashcards();
    } catch (err) {
      console.error("Failed to delete flashcard:", err);
    }
  };

  const handleEdit = (flashcard) => {
    setEditingId(flashcard._id);
    setEditFront(flashcard.front);
    setEditBack(flashcard.back);
    setEditMastery(flashcard.mastery || 0);
    setEditNextReviewDate(flashcard.nextReviewDate ? new Date(flashcard.nextReviewDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await flashcardsApi.updateFlashcard(editingId, { 
        front: editFront, 
        back: editBack,
        mastery: editMastery,
        nextReviewDate: new Date(editNextReviewDate)
      }, token);
      setEditingId(null);
      await loadFlashcards();
      await loadDueFlashcards();
    } catch (err) {
      console.error("Failed to update flashcard:", err);
    }
  };

  const handleReview = async (correct) => {
    try {
      const token = localStorage.getItem("token");
      const currentCard = dueFlashcards[currentCardIndex];
      await flashcardsApi.reviewFlashcard(currentCard._id, correct, token);
      
      if (currentCardIndex < dueFlashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setFlipped(false);
      } else {
        // Refresh due flashcards before exiting study mode
        await loadDueFlashcards();
        setShowStudyMode(false);
        setCurrentCardIndex(0);
        setFlipped(false);
        alert("Study session complete! 🎉");
      }
    } catch (err) {
      console.error("Failed to review flashcard:", err);
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;

  if (showStudyMode && dueFlashcards.length > 0) {
    const currentCard = dueFlashcards[currentCardIndex];
    return (
      <div className="main-content">
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "20px" }}>
            <button onClick={() => { setShowStudyMode(false); setFlipped(false); }} style={{ padding: "8px 16px" }}>
              ← Back to List
            </button>
            <p style={{ margin: "10px 0", fontSize: "14px", color: "#666" }}>
              Card {currentCardIndex + 1} of {dueFlashcards.length}
            </p>
          </div>

          <div
            onClick={() => setFlipped(!flipped)}
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "300px",
              margin: "0 auto",
              backgroundColor: flipped ? "#e3f2fd" : "#fff",
              border: "2px solid #4CAF50",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: "24px",
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            <p style={{ fontSize: "20px", fontWeight: "500", textAlign: "center" }}>
              {flipped ? currentCard.back : currentCard.front}
            </p>
          </div>

          {flipped && (
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={(e) => { e.stopPropagation(); handleReview(false); }}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#ff5252",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600"
                }}
              >
                <X size={20} /> Incorrect
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleReview(true); }}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600"
                }}
              >
                <Check size={20} /> Correct
              </button>
            </div>
          )}

          <p style={{ marginTop: "16px", fontSize: "13px", color: "#999" }}>
            Click card to flip
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>📚 Flashcards</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setShowStudyMode(true)}
            disabled={dueFlashcards.length === 0}
            style={{
              padding: "10px 20px",
              backgroundColor: dueFlashcards.length > 0 ? "#4CAF50" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: dueFlashcards.length > 0 ? "pointer" : "not-allowed",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <RotateCcw size={18} /> Study Now {dueFlashcards.length > 0 ? `(${dueFlashcards.length})` : "(0)"}
          </button>
        </div>
      </div>

      {flashcards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p style={{ fontSize: "18px", marginBottom: "12px" }}>No flashcards yet!</p>
          <p>Select text in your notes and click "Create flashcard" to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {flashcards.map((card) => (
            <div
              key={card._id}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {editingId === card._id ? (
                <>
                  <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Front:</label>
                  <textarea
                    value={editFront}
                    onChange={(e) => setEditFront(e.target.value)}
                    rows={2}
                    style={{ width: "100%", marginBottom: "8px", padding: "8px", fontSize: "13px", boxSizing: "border-box" }}
                  />
                  <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Back:</label>
                  <textarea
                    value={editBack}
                    onChange={(e) => setEditBack(e.target.value)}
                    rows={2}
                    style={{ width: "100%", marginBottom: "8px", padding: "8px", fontSize: "13px", boxSizing: "border-box" }}
                  />
                  <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Mastery Level:</label>
                  <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={editMastery}
                      onChange={(e) => setEditMastery(Math.min(5, Math.max(0, parseInt(e.target.value) || 0)))}
                      style={{ width: "60px", padding: "6px", fontSize: "13px", boxSizing: "border-box" }}
                    />
                    <span style={{ fontSize: "14px" }}>{"".repeat(editMastery)}⭐</span>
                  </div>
                  <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Next Review Date:</label>
                  <input
                    type="date"
                    value={editNextReviewDate}
                    onChange={(e) => setEditNextReviewDate(e.target.value)}
                    style={{ width: "100%", marginBottom: "12px", padding: "6px", fontSize: "13px", boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleSaveEdit} style={{ flex: 1, padding: "6px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", fontWeight: "600" }}>
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "6px", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px" }}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "bold", color: "#666", marginBottom: "4px" }}>Front:</p>
                    <p style={{ fontSize: "14px", fontWeight: "500" }}>{card.front}</p>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "bold", color: "#666", marginBottom: "4px" }}>Back:</p>
                    <p style={{ fontSize: "14px" }}>{card.back}</p>
                  </div>
                  <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
                    <p style={{ fontSize: "12px", fontWeight: "bold", color: "#666", marginBottom: "4px" }}>Next Review:</p>
                    <p style={{ fontSize: "13px", color: "#333" }}>{new Date(card.nextReviewDate).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      Mastery: {"⭐".repeat(card.mastery)}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEdit(card)}
                        style={{ padding: "4px 8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(card._id)}
                        style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#ffebee", border: "1px solid #ffcdd2", color: "#c62828", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
