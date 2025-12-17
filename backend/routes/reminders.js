import express from "express";
import { 
  setReminder, 
  removeReminder, 
  getUpcomingReminders, 
  getOverdueNotes,
  acknowledgeReminder,
  snoozeReminder
} from "../controllers/reminderController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Set or update a reminder for a note
router.post("/:id/reminder", setReminder);

// Remove reminder from a note
router.delete("/:id/reminder", removeReminder);

// Get all upcoming reminders for the user
router.get("/upcoming", getUpcomingReminders);

// Get all overdue notes
router.get("/overdue", getOverdueNotes);

// Acknowledge a reminder (mark as seen)
router.post("/:id/reminder/acknowledge", acknowledgeReminder);

// Snooze a reminder
router.post("/:id/reminder/snooze", snoozeReminder);

export default router;
