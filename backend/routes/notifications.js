import express from "express";
import { 
  getInAppNotifications, 
  clearInAppNotifications,
  markNotificationAsRead,
  checkReminders,
  addInAppNotification 
} from "../services/notificationService.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all in-app notifications for the logged-in user
router.get("/", (req, res) => {
  try {
    const userId = String(req.user.id);
    const notifications = getInAppNotifications(userId);
    
    console.log(`📬 GET /api/notifications - User: ${userId}, Found: ${notifications.length} notifications`, notifications);
    
    res.json({ 
      count: notifications.length,
      notifications 
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark a notification as read
router.put("/:notificationId/read", (req, res) => {
  try {
    const userId = String(req.user.id);
    const notificationId = parseInt(req.params.notificationId);
    
    markNotificationAsRead(userId, notificationId);
    
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Trigger immediate reminder check
router.post("/check", async (req, res) => {
  try {
    await checkReminders();
    const userId = String(req.user.id);
    const notifications = getInAppNotifications(userId);
    
    res.json({ 
      message: "Reminders checked",
      count: notifications.length,
      notifications 
    });
  } catch (error) {
    console.error("❌ Error checking reminders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Test endpoint - add a test notification
router.post("/test", (req, res) => {
  try {
    const userId = String(req.user.id);
    
    console.log(`🧪 Adding test notification for user ${userId}`);
    
    addInAppNotification(userId, {
      title: "Test Notification",
      content: "This is a test notification to verify the system works",
      type: "test",
    });
    
    const notifications = getInAppNotifications(userId);
    
    console.log(`🧪 Test notification added for user ${userId}, total: ${notifications.length}`, notifications);
    
    res.json({ 
      message: "Test notification added",
      userId,
      count: notifications.length,
      notifications 
    });
  } catch (error) {
    console.error("❌ Error adding test notification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Debug endpoint - show all notifications in memory
router.get("/debug", (req, res) => {
  try {
    const userId = String(req.user.id);
    const notifications = getInAppNotifications(userId);
    
    res.json({ 
      userId,
      count: notifications.length,
      notifications,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error in debug endpoint:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Clear all notifications for the user
router.delete("/", (req, res) => {
  try {
    const userId = String(req.user.id);
    clearInAppNotifications(userId);
    
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("❌ Error clearing notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
