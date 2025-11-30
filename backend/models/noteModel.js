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
    // Lock feature fields
    isLocked: { type: Boolean, default: false }, // whether this note is locked
    lockPassword: { type: String, default: null }, // hashed password for lock
    lockType: { type: String, enum: ['password', 'biometric', null], default: null } // type of lock
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
