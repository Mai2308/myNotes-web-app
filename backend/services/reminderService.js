import Reminder from "../models/reminderModel.js";
import Notification from "../models/notificationModel.js";
import Note from "../models/noteModel.js";
import User from "../models/userModel.js";

/**
 * Create a new reminder for a note
 */
export const createReminder = async (userId, noteId, reminderData) => {
  try {
    const reminder = new Reminder({
      noteId,
      userId,
      dueDate: reminderData.dueDate,
      title: reminderData.title,
      notificationType: reminderData.notificationType || "in-app",
      recurring: reminderData.recurring || { enabled: false },
    });
    await reminder.save();
    return reminder;
  } catch (error) {
    console.error("❌ Error creating reminder:", error);
    throw error;
  }
};

/**
 * Update an existing reminder
 */
export const updateReminder = async (reminderId, updateData) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(reminderId, updateData, { new: true });
    return reminder;
  } catch (error) {
    console.error("❌ Error updating reminder:", error);
    throw error;
  }
};

/**
 * Get all reminders for a user
 */
export const getUserReminders = async (userId, filter = {}) => {
  try {
    const query = { userId, ...filter };
    const reminders = await Reminder.find(query)
      .populate("noteId", "title content")
      .sort({ dueDate: 1 });
    return reminders;
  } catch (error) {
    console.error("❌ Error fetching reminders:", error);
    throw error;
  }
};

/**
 * Get reminders that are due for a specific user
 */
export const getDueReminders = async (userId) => {
  try {
    const now = new Date();
    const reminders = await Reminder.find({
      userId,
      dueDate: { $lte: now },
      notificationSent: false,
      status: { $ne: "snoozed" },
    })
      .populate("noteId", "title content")
      .exec();
    return reminders;
  } catch (error) {
    console.error("❌ Error fetching due reminders:", error);
    throw error;
  }
};

/**
 * Create a notification for a reminder
 */
export const createNotification = async (userId, reminderData, noteData) => {
  try {
    const now = new Date();
    const isOverdue = new Date(reminderData.dueDate) < now;
    
    const notification = new Notification({
      userId,
      reminderId: reminderData._id,
      noteId: reminderData.noteId,
      title: noteData.title || "Reminder",
      message: `Reminder for: "${noteData.title}"${isOverdue ? " (Overdue)" : ""}`,
      type: isOverdue ? "overdue" : "reminder",
      notificationMethod: reminderData.notificationType,
      priority: isOverdue ? "urgent" : "normal",
      actionUrl: `/notes/${reminderData.noteId}`,
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    throw error;
  }
};

/**
 * Mark a reminder as triggered (notification sent)
 */
export const markReminderTriggered = async (reminderId, recurringData = null) => {
  try {
    const updateData = {
      notificationSent: true,
      sentAt: new Date(),
      status: "sent",
    };

    if (recurringData && recurringData.enabled) {
      // For recurring reminders, calculate next due date
      const reminder = await Reminder.findById(reminderId);
      const nextDueDate = calculateNextDueDate(
        reminder.dueDate,
        recurringData.frequency
      );

      // Check if we've exceeded the end date
      if (recurringData.endDate && nextDueDate > new Date(recurringData.endDate)) {
        updateData.status = "sent";
        updateData.recurring = { ...recurringData, enabled: false };
      } else {
        updateData.dueDate = nextDueDate;
        updateData.notificationSent = false;
        updateData.status = "pending";
        updateData.recurring = {
          ...recurringData,
          lastTriggeredAt: new Date(),
        };
      }
    }

    const updated = await Reminder.findByIdAndUpdate(reminderId, updateData, {
      new: true,
    });
    return updated;
  } catch (error) {
    console.error("❌ Error marking reminder as triggered:", error);
    throw error;
  }
};

/**
 * Calculate next due date for recurring reminders
 */
export const calculateNextDueDate = (currentDate, frequency) => {
  const next = new Date(currentDate);
  
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return currentDate;
  }
  
  return next;
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (reminderId) => {
  try {
    await Reminder.findByIdAndDelete(reminderId);
  } catch (error) {
    console.error("❌ Error deleting reminder:", error);
    throw error;
  }
};

/**
 * Snooze a reminder for a specified duration (in minutes)
 */
export const snoozeReminder = async (reminderId, minutesToSnooze = 5) => {
  try {
    const snoozeUntil = new Date(Date.now() + minutesToSnooze * 60000);
    const updated = await Reminder.findByIdAndUpdate(
      reminderId,
      {
        status: "snoozed",
        snoozeUntil,
      },
      { new: true }
    );
    return updated;
  } catch (error) {
    console.error("❌ Error snoozing reminder:", error);
    throw error;
  }
};

/**
 * Get all pending notifications for a user
 */
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return notifications;
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    await Notification.findByIdAndDelete(notificationId);
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    throw error;
  }
};

/**
 * Cleanup old notifications (older than specified days)
 */
export const cleanupOldNotifications = async (userId, daysOld = 30) => {
  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const result = await Notification.deleteMany({
      userId,
      createdAt: { $lt: cutoffDate },
      read: true,
    });
    return result;
  } catch (error) {
    console.error("❌ Error cleaning up notifications:", error);
    throw error;
  }
};
