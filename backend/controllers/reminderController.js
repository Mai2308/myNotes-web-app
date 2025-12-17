import Note from "../models/noteModel.js";
import mongoose from "mongoose";

const { Types: { ObjectId } } = mongoose;

// Set or update a reminder for a note
export const setReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { reminderDate, isRecurring, recurringPattern, notificationMethods } = req.body;

    // Validate reminder date
    if (!reminderDate) {
      return res.status(400).json({ message: "Reminder date is required" });
    }

    const reminderDateTime = new Date(reminderDate);
    if (isNaN(reminderDateTime.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Check if date is in the past
    if (reminderDateTime < new Date()) {
      return res.status(400).json({ message: "Reminder date cannot be in the past" });
    }

    // Validate recurring pattern if isRecurring is true
    if (isRecurring && !['daily', 'weekly', 'monthly', 'yearly'].includes(recurringPattern)) {
      return res.status(400).json({ message: "Invalid recurring pattern" });
    }

    // Find the note
    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update reminder fields
    note.reminderDate = reminderDateTime;
    note.isRecurring = isRecurring || false;
    note.recurringPattern = isRecurring ? recurringPattern : null;
    note.notificationMethods = notificationMethods || ['in-app'];
    note.notificationSent = false;
    note.isOverdue = false;
    note.lastNotificationDate = null;

    await note.save();

    res.json({ 
      message: "Reminder set successfully", 
      note 
    });

  } catch (error) {
    console.error("❌ Error setting reminder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove reminder from a note
export const removeReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Clear reminder fields
    note.reminderDate = null;
    note.isRecurring = false;
    note.recurringPattern = null;
    note.notificationSent = false;
    note.isOverdue = false;
    note.lastNotificationDate = null;
    note.notificationMethods = [];

    await note.save();

    res.json({ 
      message: "Reminder removed successfully", 
      note 
    });

  } catch (error) {
    console.error("❌ Error removing reminder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all notes with upcoming reminders
export const getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Find notes with reminders that haven't been sent yet or are recurring
    const notes = await Note.find({
      user: userId,
      reminderDate: { $ne: null },
      $or: [
        { notificationSent: false },
        { isRecurring: true }
      ]
    }).sort({ reminderDate: 1 });

    res.json({ 
      count: notes.length,
      reminders: notes 
    });

  } catch (error) {
    console.error("❌ Error fetching upcoming reminders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get overdue notes
export const getOverdueNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const notes = await Note.find({
      user: userId,
      reminderDate: { $lt: now, $ne: null },
      isOverdue: true
    }).sort({ reminderDate: 1 });

    res.json({ 
      count: notes.length,
      overdueNotes: notes 
    });

  } catch (error) {
    console.error("❌ Error fetching overdue notes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark reminder as acknowledged (for in-app notifications)
export const acknowledgeReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.notificationSent = true;
    note.lastNotificationDate = new Date();

    // If recurring, calculate next reminder date
    if (note.isRecurring && note.recurringPattern) {
      const nextDate = calculateNextReminderDate(note.reminderDate, note.recurringPattern);
      note.reminderDate = nextDate;
      note.notificationSent = false; // Reset for next occurrence
      note.isOverdue = false;
    } else {
      // For non-recurring reminders, keep the date but mark as sent
      note.isOverdue = false;
    }

    await note.save();

    res.json({ 
      message: "Reminder acknowledged", 
      note 
    });

  } catch (error) {
    console.error("❌ Error acknowledging reminder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to calculate next reminder date for recurring reminders
function calculateNextReminderDate(currentDate, pattern) {
  const nextDate = new Date(currentDate);
  
  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      return currentDate;
  }
  
  return nextDate;
}

// Snooze a reminder (postpone by specified minutes)
export const snoozeReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { snoozeMinutes } = req.body; // Default to 10 minutes if not specified

    const minutes = snoozeMinutes || 10;

    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (!note.reminderDate) {
      return res.status(400).json({ message: "Note has no reminder set" });
    }

    // Add snooze time to current date
    const newReminderDate = new Date();
    newReminderDate.setMinutes(newReminderDate.getMinutes() + minutes);

    note.reminderDate = newReminderDate;
    note.notificationSent = false;
    note.isOverdue = false;

    await note.save();

    res.json({ 
      message: `Reminder snoozed for ${minutes} minutes`, 
      note 
    });

  } catch (error) {
    console.error("❌ Error snoozing reminder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
