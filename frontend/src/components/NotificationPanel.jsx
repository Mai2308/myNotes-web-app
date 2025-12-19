import React, { useState, useEffect } from "react";
import { Bell, X, CheckCircle, Clock, Trash2 } from "lucide-react";
import { getNotifications, markNotificationAsRead, clearNotifications, snoozeReminder } from "../api/remindersApi";
import "../styles.css";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Poll for notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(token);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId, token);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleSnooze = async (noteId, minutes) => {
    try {
      await snoozeReminder(noteId, minutes, token);
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to snooze reminder:", error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Clear all notifications?")) {
      try {
        await clearNotifications(token);
        setNotifications([]);
      } catch (error) {
        console.error("Failed to clear notifications:", error);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-panel-container">
      <style>{`
        .notification-panel-container {
          position: relative;
        }

        .notification-bell-button {
          position: relative;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          transition: all 0.2s;
          border-radius: 6px;
        }

        .notification-bell-button:hover {
          background: var(--input-bg);
          opacity: 0.8;
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
        }

        .notification-panel {
          position: absolute;
          top: 50px;
          right: 0;
          width: 380px;
          max-height: 500px;
          background: var(--card-bg);
          border: 1px solid var(--input-border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--input-border);
          background: var(--input-bg);
        }

        .notification-panel-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--muted);
        }

        .notification-panel-actions {
          display: flex;
          gap: 8px;
        }

        .notification-panel-actions button {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--muted);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .notification-panel-actions button:hover {
          color: var(--accent);
          background: var(--card-bg);
        }

        .notification-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .notification-item {
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 8px;
          background: var(--input-bg);
          border-left: 3px solid var(--accent);
          transition: all 0.2s;
          opacity: 0.9;
        }

        .notification-item.unread {
          opacity: 1;
          border-left-color: #ff6b6b;
          background: linear-gradient(135deg, rgba(255, 126, 185, 0.05) 0%, rgba(66, 217, 244, 0.05) 100%);
        }

        .notification-item:hover {
          transform: translateX(4px);
        }

        .notification-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .notification-item-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
        }

        .notification-item-type {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .notification-item-type.reminder {
          background: rgba(255, 126, 185, 0.2);
          color: var(--accent);
        }

        .notification-item-type.overdue {
          background: rgba(255, 107, 107, 0.2);
          color: #ff6b6b;
        }

        .notification-item-content {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .notification-item-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .notification-item-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .notification-item-action-btn {
          flex: 1;
          min-width: 70px;
          padding: 6px 10px;
          font-size: 12px;
          border-radius: 4px;
          border: 1px solid var(--input-border);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .notification-item-action-btn:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .notification-empty {
          padding: 32px 16px;
          text-align: center;
          color: var(--muted);
        }

        .notification-empty svg {
          width: 40px;
          height: 40px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        @media (max-width: 480px) {
          .notification-panel {
            width: calc(100vw - 32px);
            right: -50%;
            transform: translateX(50%);
          }
        }
      `}</style>

      {/* Notification Bell Button */}
      <button
        className="notification-bell-button"
        onClick={() => {
          setShowPanel(!showPanel);
          if (!showPanel) fetchNotifications();
        }}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="notification-panel">
          {/* Header */}
          <div className="notification-panel-header">
            <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
            <div className="notification-panel-actions">
              {notifications.length > 0 && (
                <button onClick={handleClearAll} title="Clear all">
                  <Trash2 size={16} />
                </button>
              )}
              <button onClick={() => setShowPanel(false)} title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={40} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? "" : "unread"}`}
                >
                  <div className="notification-item-header">
                    <div className="notification-item-title">{notification.title}</div>
                    <span
                      className={`notification-item-type ${notification.type}`}
                    >
                      {notification.type}
                    </span>
                  </div>

                  {notification.content && (
                    <div className="notification-item-content">
                      {notification.content}
                    </div>
                  )}

                  <div className="notification-item-time">
                    <Clock size={12} />
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>

                  <div className="notification-item-actions">
                    {!notification.read && (
                      <button
                        className="notification-item-action-btn"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle size={12} />
                        Mark Read
                      </button>
                    )}
                    <button
                      className="notification-item-action-btn"
                      onClick={() => handleSnooze(notification.noteId, 10)}
                    >
                      <Clock size={12} />
                      Snooze 10m
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
