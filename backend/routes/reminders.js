import express from "express";
import {
  // Reminder endpoints
  getReminders,
  getDueRemindersForUser,
  getReminder,
  createNewReminder,
  updateReminderData,
  deleteReminderData,
  snoozeReminderData,
  getRemindersByNote,
  manualCheckReminders,
  // Notification endpoints
  getNotifications,
  getNotification,
  markAsRead,
  deleteNotificationData,
  markAllAsRead,
  cleanupNotifications,
} from "../controllers/reminderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========== REMINDER ROUTES ==========

// Get all reminders for the user
router.get("/", protect, getReminders);

// Get reminders that are due
router.get("/due", protect, getDueRemindersForUser);

// Get reminders for a specific note
router.get("/note/:noteId", protect, getRemindersByNote);

// Create a new reminder
router.post("/", protect, createNewReminder);

// Get a specific reminder
router.get("/:id", protect, getReminder);

// Update a reminder
router.put("/:id", protect, updateReminderData);

// Delete a reminder
router.delete("/:id", protect, deleteReminderData);

// Snooze a reminder
router.post("/:id/snooze", protect, snoozeReminderData);

// Manual trigger check (admin use)
router.post("/check", protect, manualCheckReminders);

// ========== NOTIFICATION ROUTES ==========

// Get all notifications
router.get("/notifications/", protect, getNotifications);

// Get a specific notification
router.get("/notifications/:id", protect, getNotification);

// Mark notification as read
router.patch("/notifications/:id/read", protect, markAsRead);

// Mark all notifications as read
router.post("/notifications/mark-all-read", protect, markAllAsRead);

// Delete a notification
router.delete("/notifications/:id", protect, deleteNotificationData);

// Cleanup old notifications
router.delete("/notifications/cleanup", protect, cleanupNotifications);

export default router;
