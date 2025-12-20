import React, { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react";

export default function FlashcardStudyMode({ flashcards, onExit, startIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10002,
          flexDirection: "column",
          gap: "20px"
        }}
      >
        <h1 style={{ color: "#fff", fontSize: "28px" }}>No Flashcards</h1>
        <button
          onClick={onExit}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#ff7eb9",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Back to Notes
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = `${currentIndex + 1}/${flashcards.length}`;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleCorrect = () => {
    setCorrectCount(correctCount + 1);
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
  };

  console.log("🎓 FlashcardStudyMode rendered", { flashcards: flashcards?.length, currentIndex });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10002,
        flexDirection: "column",
        gap: "30px",
        padding: "20px"
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", color: "#fff" }}>
        <h1 style={{ fontSize: "32px", margin: 0, marginBottom: "8px" }}>📚 Study Mode</h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
          Progress: {progress} | Correct: {correctCount}
        </p>
      </div>

      {/* Main Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "320px",
          backgroundColor: isFlipped ? "#0ea5e9" : "#7c3aed",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          border: "2px solid rgba(255,255,255,0.1)"
        }}
      >
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: 0, marginBottom: "20px" }}>
          {isFlipped ? "Answer" : "Question"}
        </p>
        <p
          style={{
            fontSize: "22px",
            fontWeight: "600",
            color: "white",
            margin: 0,
            textAlign: "center",
            lineHeight: "1.6"
          }}
        >
          {isFlipped ? currentCard.back : currentCard.front}
        </p>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: "20px 0 0 0" }}>
          Click to {isFlipped ? "see question" : "reveal answer"}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: currentIndex === 0 ? "#4b5563" : "#64748b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: currentIndex === 0 ? 0.5 : 1
          }}
        >
          <ChevronLeft size={18} /> Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: currentIndex === flashcards.length - 1 ? "#4b5563" : "#64748b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: currentIndex === flashcards.length - 1 ? "not-allowed" : "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: currentIndex === flashcards.length - 1 ? 0.5 : 1
          }}
        >
          Next <ChevronRight size={18} />
        </button>

        <button
          onClick={handleCorrect}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Check size={18} /> Got It
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <RotateCcw size={18} /> Restart
        </button>

        <button
          onClick={onExit}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <X size={18} /> Exit
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          textAlign: "center",
          marginTop: "20px"
        }}
      >
        <p style={{ margin: 0 }}>
          Correct: <span style={{ color: "#10b981", fontWeight: "600" }}>{correctCount}</span>
          {" / "}
          Total: <span style={{ color: "#7c3aed", fontWeight: "600" }}>{flashcards.length}</span>
        </p>
      </div>
    </div>
  );
}
