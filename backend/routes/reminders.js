import express from "express";
import { 
  setReminder, 
  removeReminder, 
  getUpcomingReminders, 
  getOverdueNotes,
  acknowledgeReminder,
  snoozeReminder
} from "../controllers/reminderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug endpoint (no auth required) - for testing
router.get("/debug/test", (req, res) => {
  res.json({ status: "ok", message: "Reminders API is reachable" });
});

// All routes require authentication
router.use(protect);

// Get all upcoming reminders for the user (must be before /:id routes)
router.get("/upcoming", getUpcomingReminders);

// Get all overdue notes (must be before /:id routes)
router.get("/overdue", getOverdueNotes);

// Set or update a reminder for a note
router.post("/:id/reminder", setReminder);

// Remove reminder from a note
router.delete("/:id/reminder", removeReminder);

// Acknowledge a reminder (mark as seen)
router.post("/:id/reminder/acknowledge", acknowledgeReminder);

// Snooze a reminder
router.post("/:id/reminder/snooze", snoozeReminder);

export default router;
