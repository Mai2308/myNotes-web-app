import express from "express";
import { 
  getInAppNotifications, 
  clearInAppNotifications,
  markNotificationAsRead 
} from "../services/notificationService.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all in-app notifications for the logged-in user
router.get("/", (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = getInAppNotifications(userId);
    
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
    const userId = req.user.id;
    const notificationId = parseInt(req.params.notificationId);
    
    markNotificationAsRead(userId, notificationId);
    
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Clear all notifications for the user
router.delete("/", (req, res) => {
  try {
    const userId = req.user.id;
    clearInAppNotifications(userId);
    
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("❌ Error clearing notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
