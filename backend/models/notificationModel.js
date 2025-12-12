import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reminderId: { type: mongoose.Schema.Types.ObjectId, ref: "Reminder", default: null },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    title: { type: String, required: true },
    message: { type: String },
    type: { 
      type: String, 
      enum: ["reminder", "deadline-approaching", "overdue", "custom"], 
      default: "reminder" 
    },
    notificationMethod: { 
      type: String, 
      enum: ["email", "in-app", "alert", "push"], 
      default: "in-app" 
    },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    priority: { 
      type: String, 
      enum: ["low", "normal", "high", "urgent"], 
      default: "normal" 
    },
    actionUrl: { type: String }, // Link to the note or action
    metadata: { type: mongoose.Schema.Types.Mixed }, // Additional context
  },
  { timestamps: true }
);

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model("Notification", NotificationSchema);
