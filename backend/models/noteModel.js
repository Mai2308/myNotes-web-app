import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String },
    tags: [{ type: String }],
    emojis: [{ type: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null }, // new
    isFavorite: { type: Boolean, default: false }, // track if note is favorited
    // If this note is a copy placed in Favorites, store the original note id
    sourceNoteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", default: null },
    // Checklist mode fields
    isChecklist: { type: Boolean, default: false }, // whether this note is in checklist mode
    checklistItems: [{
      text: { type: String, required: true },
      completed: { type: Boolean, default: false },
      order: { type: Number, required: true }
    }],
    // Highlights and annotations
    highlights: [{
      _id: mongoose.Schema.Types.ObjectId,
      startOffset: { type: Number, required: true },
      endOffset: { type: Number, required: true },
      color: { type: String, enum: ["yellow", "green", "red", "blue", "purple"], default: "yellow" },
      selectedText: { type: String, required: true },
      comment: { type: String, default: "" },
      createdAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
