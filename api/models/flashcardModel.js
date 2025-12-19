import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true }, // Question/Term
    back: { type: String, required: true }, // Answer/Definition
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", default: null }, // Optional link to source note
    tags: [{ type: String }],
    mastery: { type: Number, default: 0, min: 0, max: 5 }, // 0-5 scale for spaced repetition
    nextReviewDate: { type: Date, default: Date.now },
    reviewCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Flashcard", FlashcardSchema);
