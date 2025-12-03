const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: false },
    content: { type: String, required: false },
    folderId: { type: String, default: null },
    isFavorite: { type: Boolean, default: false },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", NoteSchema);

