import Reminder from "../models/reminderModel.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import Note from "../models/noteModel.js";
import {
  markReminderTriggered,
  createNotification,
} from "./reminderService.js";
import { sendReminderEmail } from "./emailService.js";

let schedulerInterval = null;
const SCHEDULER_INTERVAL = 60000; // Check every 60 seconds (adjust as needed)

/**
 * Start the reminder scheduler
 */
export const startReminderScheduler = () => {
  if (schedulerInterval) {
    console.warn("⚠️  Reminder scheduler already running");
    return;
  }

  console.log("🚀 Starting reminder scheduler...");

  schedulerInterval = setInterval(async () => {
    try {
      await checkAndTriggerReminders();
    } catch (error) {
      console.error("❌ Error in reminder scheduler:", error);
    }
  }, SCHEDULER_INTERVAL);

  // Initial check immediately
  checkAndTriggerReminders().catch((error) => {
    console.error("❌ Initial reminder check failed:", error);
  });
};

/**
 * Stop the reminder scheduler
 */
export const stopReminderScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("⏹️  Reminder scheduler stopped");
  }
};

/**
 * Check for due reminders and trigger notifications
 */
export const checkAndTriggerReminders = async () => {
  try {
    const now = new Date();

    // Find all reminders that are due
    const dueReminders = await Reminder.find({
      $or: [
        // Non-recurring reminders that haven't been sent
        {
          dueDate: { $lte: now },
          notificationSent: false,
          "recurring.enabled": false,
        },
        // Recurring reminders that are due
        {
          dueDate: { $lte: now },
          "recurring.enabled": true,
          status: { $in: ["pending", "sent"] },
        },
        // Snoozed reminders that snooze time has passed
        {
          status: "snoozed",
          snoozeUntil: { $lte: now },
        },
      ],
    })
      .populate("userId", "email name")
      .populate("noteId", "title content");

    if (dueReminders.length > 0) {
      console.log(`⏰ Found ${dueReminders.length} due reminders`);

      // Group reminders by user for batch email sending
      const remindersByUser = {};

      for (const reminder of dueReminders) {
        if (!reminder.userId || !reminder.noteId) {
          console.warn("⚠️  Skipping reminder with missing userId or noteId:", reminder._id);
          continue;
        }

        const userId = reminder.userId._id.toString();

        // Create notification
        try {
          await createNotification(reminder.userId, reminder, reminder.noteId);
          console.log(`📬 Notification created for reminder ${reminder._id}`);
        } catch (error) {
          console.error("❌ Error creating notification:", error);
        }

        // Handle snoozed reminders that need reactivation
        if (reminder.status === "snoozed") {
          await Reminder.findByIdAndUpdate(reminder._id, {
            status: "pending",
            snoozeUntil: null,
          });
          continue;
        }

        // Group for email if needed
        if (reminder.notificationType === "email" || reminder.notificationType === "alert") {
          if (!remindersByUser[userId]) {
            remindersByUser[userId] = {
              email: reminder.userId.email,
              reminders: [],
            };
          }
          remindersByUser[userId].reminders.push({
            ...reminder.toObject(),
            note: reminder.noteId,
          });
        }

        // Mark reminder as triggered
        try {
          await markReminderTriggered(
            reminder._id,
            reminder.recurring.enabled ? reminder.recurring : null
          );
          console.log(`✅ Reminder triggered: ${reminder._id}`);
        } catch (error) {
          console.error("❌ Error marking reminder as triggered:", error);
        }
      }

      // Send emails for grouped reminders
      for (const userId in remindersByUser) {
        const { email, reminders } = remindersByUser[userId];

        if (reminders.length === 1) {
          // Single email for one reminder
          try {
            await sendReminderEmail(email, reminders[0], reminders[0].note);
          } catch (error) {
            console.error("❌ Error sending reminder email:", error);
          }
        } else if (reminders.length > 1) {
          // Bulk email for multiple reminders
          try {
            await sendReminderEmail(email, reminders, reminders[0].note);
          } catch (error) {
            console.error("❌ Error sending bulk reminder email:", error);
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error checking reminders:", error);
  }
};

/**
 * Manually trigger a reminder check (useful for testing)
 */
export const manualTriggerReminderCheck = async () => {
  try {
    await checkAndTriggerReminders();
    console.log("✅ Manual reminder check completed");
  } catch (error) {
    console.error("❌ Error during manual reminder check:", error);
    throw error;
  }
};

/**
 * Get scheduler status
 */
export const getSchedulerStatus = () => {
  return {
    isRunning: schedulerInterval !== null,
    interval: SCHEDULER_INTERVAL,
  };
};

/**
 * Clean up snoozed reminders that are very old
 */
export const cleanupOldSnoozedReminders = async (daysOld = 7) => {
  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const result = await Reminder.deleteMany({
      status: "snoozed",
      updatedAt: { $lt: cutoffDate },
    });
    console.log(`🧹 Cleaned up ${result.deletedCount} old snoozed reminders`);
    return result;
  } catch (error) {
    console.error("❌ Error cleaning up snoozed reminders:", error);
    throw error;
  }
};
