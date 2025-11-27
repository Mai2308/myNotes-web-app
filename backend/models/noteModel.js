import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String },
    tags: [{ type: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null }, // new
    isFavorite: { type: Boolean, default: false }, // track if note is favorited
    // If this note is a copy placed in Favorites, store the original note id
    sourceNoteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
