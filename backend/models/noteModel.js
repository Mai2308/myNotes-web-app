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
    // Hard deadline for the note
    deadline: { type: Date, default: null },
    // Reminder/Deadline fields
    reminderDate: { type: Date, default: null }, // Date and time for the reminder
    isRecurring: { type: Boolean, default: false }, // Whether the reminder repeats
    recurringPattern: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'yearly', null],
      default: null 
    }, // Recurrence pattern
    notificationSent: { type: Boolean, default: false }, // Track if notification was sent
    lastNotificationDate: { type: Date, default: null }, // Track when last notification was sent
    notificationMethods: {
      type: [{
        type: String,
        enum: ['in-app', 'email'],
      }],
      default: ['in-app'],
    }, // How to notify the user
    isOverdue: { type: Boolean, default: false }, // Mark if deadline passed
    // Highlights field
    highlights: [{
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      startOffset: { type: Number, required: true },
      endOffset: { type: Number, required: true },
      color: { type: String, default: 'yellow' },
      selectedText: { type: String, required: true },
      comment: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
