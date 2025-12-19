import cron from "node-cron";
import Note from "../models/noteModel.js";
import User from "../models/userModel.js";
import { sendReminderEmail, sendOverdueEmail } from "./emailService.js";

const computeIsOverdue = (noteLike, now = new Date()) => {
  const deadlineAt = noteLike?.deadline ? new Date(noteLike.deadline) : null;
  const reminderAt = noteLike?.reminderDate ? new Date(noteLike.reminderDate) : null;

  const deadlinePassed = deadlineAt && !isNaN(deadlineAt) && deadlineAt < now;
  const reminderPassed = reminderAt && !isNaN(reminderAt) && !noteLike?.isRecurring && reminderAt < now;

  return Boolean(deadlinePassed || reminderPassed);
};

const getNextDueDate = (noteLike) => {
  const dates = [];
  if (noteLike?.reminderDate) {
    const d = new Date(noteLike.reminderDate);
    if (!isNaN(d)) dates.push(d);
  }
  if (noteLike?.deadline) {
    const d = new Date(noteLike.deadline);
    if (!isNaN(d)) dates.push(d);
  }
  if (!dates.length) return null;
  return new Date(Math.min(...dates.map((d) => d.getTime())));
};

// In-app notification storage (in production, use a proper database or messaging system)
const inAppNotifications = new Map();

// Get in-app notifications for a user
export const getInAppNotifications = (userId) => {
  const userIdStr = String(userId);
  return inAppNotifications.get(userIdStr) || [];
};

// Add in-app notification
export const addInAppNotification = (userId, notification) => {
  const userIdStr = String(userId);
  const userNotifications = inAppNotifications.get(userIdStr) || [];
  userNotifications.push({
    ...notification,
    id: Date.now(),
    timestamp: new Date(),
    read: false,
  });
  inAppNotifications.set(userIdStr, userNotifications);
  console.log(`✅ Added notification for user ${userIdStr}, total notifications: ${userNotifications.length}`);
};

// Clear in-app notifications for a user
export const clearInAppNotifications = (userId) => {
  const userIdStr = String(userId);
  inAppNotifications.delete(userIdStr);
};

// Mark notification as read
export const markNotificationAsRead = (userId, notificationId) => {
  const userIdStr = String(userId);
  const userNotifications = inAppNotifications.get(userIdStr) || [];
  const notification = userNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

// Calculate next reminder date for recurring reminders
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

// Process a single reminder or deadline
async function processReminder(note, user, { dueDate, overdue }) {
  const now = new Date();
  const notificationMethods = Array.isArray(note.notificationMethods) && note.notificationMethods.length > 0
    ? note.notificationMethods
    : ['in-app'];

  console.log(`📢 Processing reminder for note: ${note.title} (${note._id})`);

  // Send in-app notification
  if (notificationMethods.includes('in-app')) {
    addInAppNotification(user._id.toString(), {
      noteId: note._id,
      title: note.title,
      content: note.content,
      reminderDate: note.reminderDate,
      deadline: note.deadline,
      dueDate,
      type: overdue ? 'overdue' : 'reminder',
    });
    console.log(`✅ In-app notification added for user ${user.email}`);
  }

  // Email notifications removed - only in-app notifications are supported

  // Update note status
  note.notificationSent = true;
  note.lastNotificationDate = now;
  note.isOverdue = overdue;

  // Handle recurring reminders
  if (note.isRecurring && note.recurringPattern) {
    const nextDate = calculateNextReminderDate(note.reminderDate, note.recurringPattern);
    note.reminderDate = nextDate;
    note.notificationSent = false; // Reset for next occurrence
    note.isOverdue = false;
    console.log(`🔄 Next reminder scheduled for: ${nextDate}`);
  }

  await note.save();
}

// Check for due reminders
export const checkReminders = async () => {
  try {
    const now = new Date();
    const fiveMinutesAhead = new Date(now.getTime() + 5 * 60000); // 5 minutes buffer

    console.log(`🔍 Checking for reminders and deadlines... (${now.toISOString()})`);

    const candidateNotes = await Note.find({
      $or: [
        { reminderDate: { $ne: null } },
        { deadline: { $ne: null } },
      ],
    }).populate('user');

    const dueNotes = candidateNotes.filter((note) => {
      const dueDate = getNextDueDate(note);
      if (!dueDate) return false;

      const overdue = computeIsOverdue(note, now);
      const dueSoon = dueDate <= fiveMinutesAhead;

      const isRecurring = note.isRecurring && note.recurringPattern;
      const sentAlready = note.notificationSent && !isRecurring;
      const sentRecentlyRecurring = isRecurring && note.lastNotificationDate && (now.getTime() - new Date(note.lastNotificationDate).getTime() < 60000);

      if (!(overdue || dueSoon)) return false;
      if (sentAlready) return false;
      if (sentRecentlyRecurring) return false;

      return true;
    });

    console.log(`📋 Found ${dueNotes.length} due reminder(s)/deadline(s)`);

    for (const note of dueNotes) {
      if (!note.user) {
        console.warn(`⚠️ Note ${note._id} has no associated user, skipping...`);
        continue;
      }

      const dueDate = getNextDueDate(note);
      const overdue = computeIsOverdue(note, now);

      try {
        await processReminder(note, note.user, { dueDate, overdue });
      } catch (error) {
        console.error(`❌ Error processing reminder for note ${note._id}:`, error);
      }
    }

    console.log(`✅ Reminder/deadline check completed`);
  } catch (error) {
    console.error("❌ Error in checkReminders:", error);
  }
};

// Start the notification scheduler
export const startNotificationScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', () => {
    checkReminders();
  });

  console.log("🚀 Notification scheduler started (runs every minute)");
  
  // Also run immediately on startup
  checkReminders();
};

// Stop all scheduled tasks (useful for testing or graceful shutdown)
export const stopNotificationScheduler = () => {
  cron.getTasks().forEach(task => task.stop());
  console.log("🛑 Notification scheduler stopped");
};
