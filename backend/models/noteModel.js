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
    // Reminder/Deadline fields
    reminder: {
      enabled: { type: Boolean, default: false },
      dueDate: { type: Date, default: null }, // when the reminder/deadline is due
      notificationSent: { type: Boolean, default: false }, // has notification been sent?
      recurring: {
        enabled: { type: Boolean, default: false },
        frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], default: null }, // recurring frequency
        endDate: { type: Date, default: null }, // when to stop recurring (optional)
        lastNotificationDate: { type: Date, default: null } // last time notification was sent for recurring reminder
      }
    },
    // Notification history
    notifications: [{
      type: { type: String, enum: ["email", "in-app", "alert"], default: "in-app" },
      sentAt: { type: Date, default: Date.now },
      status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" }
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
