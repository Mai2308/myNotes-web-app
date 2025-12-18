import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { Bell, X, CheckCircle2, AlertCircle } from "lucide-react";
import "../styles/notificationCenter.css";
import { getNotifications, markNotificationAsRead, clearNotifications, triggerNotificationCheck, addTestNotification } from "../api/notificationsApi";

const NotificationCenter = React.forwardRef((_, ref) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      console.log("🔔 Fetching notifications...");
      const response = await getNotifications();
      console.log("📬 Received notifications:", response);
      if (response.notifications) {
        setNotifications(response.notifications);
        const unread = response.notifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
        console.log(`✅ Updated notifications: ${response.notifications.length} total, ${unread} unread`);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  React.useImperativeHandle(ref, () => ({
    refreshNotifications: fetchNotifications,
    triggerCheck: async () => {
      try {
        await triggerNotificationCheck();
        await fetchNotifications();
      } catch (error) {
        console.error("Error triggering notification check:", error);
      }
    },
  }));

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 10000); // Poll every 10 seconds for faster updates

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const isOverdue = (notification) => notification.type === "overdue";

  return (
    <div className={`notification-center theme-${theme}`}>
      {/* Bell Icon with Badge */}
      <button
        className="notification-bell"
        onClick={() => {
          setIsOpen(!isOpen);
          fetchNotifications(); // Refresh when opening
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Reminders & Notifications</h3>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                className="notification-clear-btn"
                onClick={async () => {
                  try {
                    console.log("🧪 Adding test notification...");
                    await addTestNotification();
                    await fetchNotifications();
                  } catch (error) {
                    console.error("Failed to add test notification:", error);
                  }
                }}
                title="Add test notification"
                style={{ background: "#4CAF50", color: "white", fontSize: 10, padding: "4px 8px" }}
              >
                TEST
              </button>
              {notifications.length > 0 && (
                <button
                  className="notification-clear-btn"
                  onClick={handleClearAll}
                  title="Clear all notifications"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={32} />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${isOverdue(notification) ? "overdue" : ""} ${
                    !notification.read ? "unread" : ""
                  }`}
                >
                  <div className="notification-icon">
                    {isOverdue(notification) ? (
                      <AlertCircle size={20} />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                  </div>

                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.content}</p>
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {!notification.read && (
                    <button
                      className="notification-mark-read"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default NotificationCenter;
