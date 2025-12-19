import React, { useState, useEffect } from "react";
import { Trash2, Edit2, Check, X, RotateCcw } from "lucide-react";
import * as flashcardsApi from "../api/flashcardsApi";
import "../styles.css";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [dueFlashcards, setDueFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studying, setStudying] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found - user may not be logged in");
        setLoading(false);
        return;
      }
      const flashcardsData = await flashcardsApi.getFlashcards(null, token);
      const dueData = await flashcardsApi.getDueFlashcards(token);
      setFlashcards(flashcardsData || []);
      setDueFlashcards(dueData || []);
    } catch (err) {
      console.error("Failed to load flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const review = async (correct) => {
    const token = localStorage.getItem("token");
    await flashcardsApi.reviewFlashcard(
      dueFlashcards[index]._id,
      correct,
      token
    );

    if (index < dueFlashcards.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    } else {
      setStudying(false);
      setIndex(0);
      setFlipped(false);
      load();
    }
  };

  if (loading) return <div className="page">Loading…</div>;

  const current = dueFlashcards[index];

  return (
    <div className="page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1>Flashcards</h1>
        <button
          className="btn primary"
          disabled={!dueFlashcards.length}
          onClick={() => setStudying(true)}
        >
          <RotateCcw size={18} />
          Study ({dueFlashcards.length})
        </button>
      </div>

      {/* ===== STUDY SECTION (TOP) ===== */}
      {studying && current && (
        <div className="study-section">
          <div
            className="study-card"
            onClick={() => setFlipped(!flipped)}
          >
            {flipped ? current.back : current.front}
          </div>

          {flipped && (
            <div className="study-actions">
              <button className="btn danger" onClick={() => review(false)}>
                <X size={18} /> Incorrect
              </button>
              <button className="btn success" onClick={() => review(true)}>
                <Check size={18} /> Correct
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== CARDS GRID ===== */}
      <div className="flashcards-grid">
        {flashcards.map((card) => (
          <div className="flashcard" key={card._id}>
            <div className="flashcard-body">
              <div>
                <span className="card-label">Front</span>
                <p className="card-text main">{card.front}</p>
              </div>

              <div>
                <span className="card-label">Back</span>
                <p className="card-text">{card.back}</p>
              </div>

              <div className="card-meta">
                Next review ·{" "}
                {new Date(card.nextReviewDate).toLocaleDateString()}
              </div>
            </div>

            <div className="flashcard-footer">
              <span className="mastery">
                {"★".repeat(card.mastery)}
              </span>

              <div className="actions">
                <button className="icon-btn">
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

