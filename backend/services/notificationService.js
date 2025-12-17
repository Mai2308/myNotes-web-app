import cron from "node-cron";
import Note from "../models/noteModel.js";
import User from "../models/userModel.js";
import { sendReminderEmail, sendOverdueEmail } from "./emailService.js";

// In-app notification storage (in production, use a proper database or messaging system)
const inAppNotifications = new Map();

// Get in-app notifications for a user
export const getInAppNotifications = (userId) => {
  return inAppNotifications.get(userId) || [];
};

// Add in-app notification
export const addInAppNotification = (userId, notification) => {
  const userNotifications = inAppNotifications.get(userId) || [];
  userNotifications.push({
    ...notification,
    id: Date.now(),
    timestamp: new Date(),
    read: false,
  });
  inAppNotifications.set(userId, userNotifications);
};

// Clear in-app notifications for a user
export const clearInAppNotifications = (userId) => {
  inAppNotifications.delete(userId);
};

// Mark notification as read
export const markNotificationAsRead = (userId, notificationId) => {
  const userNotifications = inAppNotifications.get(userId) || [];
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

// Process a single reminder
async function processReminder(note, user) {
  const now = new Date();
  const notificationMethods = note.notificationMethods || ['in-app'];

  console.log(`📢 Processing reminder for note: ${note.title} (${note._id})`);

  // Send in-app notification
  if (notificationMethods.includes('in-app')) {
    addInAppNotification(user._id.toString(), {
      noteId: note._id,
      title: note.title,
      content: note.content,
      reminderDate: note.reminderDate,
      type: note.reminderDate < now ? 'overdue' : 'reminder',
    });
    console.log(`✅ In-app notification added for user ${user.email}`);
  }

  // Send email notification
  if (notificationMethods.includes('email') && user.email) {
    if (note.reminderDate < now) {
      await sendOverdueEmail(user.email, note.title, note.content, note.reminderDate);
    } else {
      await sendReminderEmail(user.email, note.title, note.content, note.reminderDate);
    }
  }

  // Update note status
  note.notificationSent = true;
  note.lastNotificationDate = now;

  // Handle overdue status
  if (note.reminderDate < now) {
    note.isOverdue = true;
  }

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

    console.log(`🔍 Checking for reminders... (${now.toISOString()})`);

    // Find notes with reminders due within the next 5 minutes (or overdue)
    const dueNotes = await Note.find({
      reminderDate: { 
        $ne: null,
        $lte: fiveMinutesAhead 
      },
      $or: [
        { notificationSent: false },
        { 
          isRecurring: true,
          lastNotificationDate: { 
            $lt: new Date(now.getTime() - 60000) // At least 1 minute since last notification
          }
        }
      ]
    }).populate('user');

    console.log(`📋 Found ${dueNotes.length} due reminder(s)`);

    for (const note of dueNotes) {
      if (!note.user) {
        console.warn(`⚠️ Note ${note._id} has no associated user, skipping...`);
        continue;
      }

      try {
        await processReminder(note, note.user);
      } catch (error) {
        console.error(`❌ Error processing reminder for note ${note._id}:`, error);
      }
    }

    console.log(`✅ Reminder check completed`);
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
