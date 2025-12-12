import Reminder from "../models/reminderModel.js";
import Notification from "../models/notificationModel.js";
import Note from "../models/noteModel.js";
import {
  createReminder,
  updateReminder,
  getUserReminders,
  getDueReminders,
  deleteReminder,
  snoozeReminder,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  cleanupOldNotifications,
} from "../services/reminderService.js";
import { manualTriggerReminderCheck } from "../services/schedulerService.js";

/**
 * GET /api/reminders - Get all reminders for the logged-in user
 */
export const getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, noteId } = req.query;

    const filter = { userId };
    if (status) filter.status = status;
    if (noteId) filter.noteId = noteId;

    const reminders = await getUserReminders(userId, filter);

    res.json(reminders);
  } catch (error) {
    console.error("❌ Error fetching reminders:", error);
    res.status(500).json({ message: "Error fetching reminders" });
  }
};

/**
 * GET /api/reminders/due - Get reminders that are due
 */
export const getDueRemindersForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await getDueReminders(userId);
    res.json(reminders);
  } catch (error) {
    console.error("❌ Error fetching due reminders:", error);
    res.status(500).json({ message: "Error fetching due reminders" });
  }
};

/**
 * GET /api/reminders/:id - Get a specific reminder
 */
export const getReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const reminder = await Reminder.findOne({ _id: id, userId })
      .populate("noteId", "title content")
      .exec();

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json(reminder);
  } catch (error) {
    console.error("❌ Error fetching reminder:", error);
    res.status(500).json({ message: "Error fetching reminder" });
  }
};

/**
 * POST /api/reminders - Create a new reminder
 */
export const createNewReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteId, dueDate, notificationType, recurring } = req.body;

    // Validate required fields
    if (!noteId || !dueDate) {
      return res
        .status(400)
        .json({ message: "noteId and dueDate are required" });
    }

    // Check if note exists and belongs to user
    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Create reminder
    const reminder = await createReminder(userId, noteId, {
      dueDate: new Date(dueDate),
      title: note.title,
      notificationType: notificationType || "in-app",
      recurring: recurring || { enabled: false },
    });

    // Optionally update the note with reminder info
    note.reminder = {
      enabled: true,
      dueDate: new Date(dueDate),
      notificationSent: false,
      recurring: recurring || { enabled: false },
    };
    await note.save();

    res.status(201).json({
      message: "Reminder created successfully",
      reminder: await reminder.populate("noteId"),
    });
  } catch (error) {
    console.error("❌ Error creating reminder:", error);
    res.status(500).json({ message: "Error creating reminder" });
  }
};

/**
 * PUT /api/reminders/:id - Update a reminder
 */
export const updateReminderData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { dueDate, notificationType, recurring, status } = req.body;

    // Check if reminder exists and belongs to user
    const reminder = await Reminder.findOne({ _id: id, userId });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Update allowed fields
    const updateData = {};
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (notificationType !== undefined) updateData.notificationType = notificationType;
    if (recurring !== undefined) updateData.recurring = recurring;
    if (status !== undefined && ["pending", "sent", "failed", "snoozed"].includes(status)) {
      updateData.status = status;
    }

    const updated = await updateReminder(id, updateData);

    // Also update the note's reminder field
    const note = await Note.findById(reminder.noteId);
    if (note) {
      note.reminder = {
        enabled: true,
        dueDate: updated.dueDate,
        notificationSent: updated.notificationSent,
        recurring: updated.recurring,
      };
      await note.save();
    }

    res.json({
      message: "Reminder updated successfully",
      reminder: await updated.populate("noteId"),
    });
  } catch (error) {
    console.error("❌ Error updating reminder:", error);
    res.status(500).json({ message: "Error updating reminder" });
  }
};

/**
 * DELETE /api/reminders/:id - Delete a reminder
 */
export const deleteReminderData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if reminder exists and belongs to user
    const reminder = await Reminder.findOne({ _id: id, userId });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    await deleteReminder(id);

    // Update the note to remove reminder
    const note = await Note.findById(reminder.noteId);
    if (note) {
      note.reminder = {
        enabled: false,
        dueDate: null,
        notificationSent: false,
        recurring: { enabled: false },
      };
      await note.save();
    }

    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting reminder:", error);
    res.status(500).json({ message: "Error deleting reminder" });
  }
};

/**
 * POST /api/reminders/:id/snooze - Snooze a reminder
 */
export const snoozeReminderData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { minutesToSnooze = 5 } = req.body;

    // Check if reminder exists and belongs to user
    const reminder = await Reminder.findOne({ _id: id, userId });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    const snoozed = await snoozeReminder(id, minutesToSnooze);

    res.json({
      message: `Reminder snoozed for ${minutesToSnooze} minutes`,
      reminder: await snoozed.populate("noteId"),
    });
  } catch (error) {
    console.error("❌ Error snoozing reminder:", error);
    res.status(500).json({ message: "Error snoozing reminder" });
  }
};

/**
 * GET /api/reminders/note/:noteId - Get all reminders for a specific note
 */
export const getRemindersByNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteId } = req.params;

    // Check if note exists and belongs to user
    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const reminders = await Reminder.find({ noteId, userId })
      .sort({ dueDate: 1 });

    res.json(reminders);
  } catch (error) {
    console.error("❌ Error fetching note reminders:", error);
    res.status(500).json({ message: "Error fetching reminders" });
  }
};

// ========== NOTIFICATION ENDPOINTS ==========

/**
 * GET /api/notifications - Get all notifications for the user
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, unreadOnly = false } = req.query;

    const filter = { userId };
    if (unreadOnly === "true") filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .exec();

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

/**
 * GET /api/notifications/:id - Get a specific notification
 */
export const getNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("❌ Error fetching notification:", error);
    res.status(500).json({ message: "Error fetching notification" });
  }
};

/**
 * PATCH /api/notifications/:id/read - Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const updated = await markNotificationAsRead(id);
    res.json({
      message: "Notification marked as read",
      notification: updated,
    });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

/**
 * DELETE /api/notifications/:id - Delete a notification
 */
export const deleteNotificationData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await deleteNotification(id);
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
};

/**
 * POST /api/notifications/mark-all-read - Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error marking notifications as read" });
  }
};

/**
 * DELETE /api/notifications/cleanup - Delete old read notifications
 */
export const cleanupNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { daysOld = 30 } = req.body;

    const result = await cleanupOldNotifications(userId, daysOld);

    res.json({
      message: `Cleaned up notifications older than ${daysOld} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error cleaning up notifications:", error);
    res.status(500).json({ message: "Error cleaning up notifications" });
  }
};

/**
 * POST /api/reminders/check - Manually trigger reminder check (admin only)
 */
export const manualCheckReminders = async (req, res) => {
  try {
    // You might want to add admin check here
    await manualTriggerReminderCheck();
    res.json({ message: "Reminder check triggered successfully" });
  } catch (error) {
    console.error("❌ Error triggering reminder check:", error);
    res.status(500).json({ message: "Error triggering reminder check" });
  }
};
