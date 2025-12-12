import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema(
  {
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true }, // when the reminder is due
    title: { type: String }, // title of the note for quick reference
    notificationType: { 
      type: String, 
      enum: ["email", "in-app", "alert"], 
      default: "in-app" 
    },
    notificationSent: { type: Boolean, default: false },
    sentAt: { type: Date, default: null },
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: { 
        type: String, 
        enum: ["daily", "weekly", "monthly", "yearly"], 
        default: null 
      },
      endDate: { type: Date, default: null }, // when to stop recurring
      lastTriggeredAt: { type: Date, default: null } // last time this reminder was triggered
    },
    status: { 
      type: String, 
      enum: ["pending", "sent", "failed", "snoozed"], 
      default: "pending" 
    },
    snoozeUntil: { type: Date, default: null }, // if snoozed, when to show again
  },
  { timestamps: true }
);

// Index for efficient queries on reminders that need to be triggered
ReminderSchema.index({ userId: 1, dueDate: 1, notificationSent: 1 });
ReminderSchema.index({ userId: 1, status: 1 });
ReminderSchema.index({ "recurring.enabled": 1, "recurring.lastTriggeredAt": 1 });

export default mongoose.model("Reminder", ReminderSchema);
