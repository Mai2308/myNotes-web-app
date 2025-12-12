import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, cleanupNotifications } from '../api/remindersApi';
import '../styles/reminder.css';

/**
 * NotificationCenter Component
 * Displays notification bell icon with dropdown list of notifications
 */
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(10, false); // Get unread first
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      await cleanupNotifications(7); // Remove notifications older than 7 days
      fetchNotifications();
    } catch (error) {
      console.error('Failed to cleanup notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>
            <div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} title="Mark all as read">
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">
              No notifications
            </div>
          ) : (
            <>
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-item-content">
                    <div className="notification-item-text">
                      <div className="notification-item-title">
                        {notification.title}
                      </div>
                      <div className="notification-item-message">
                        {notification.message}
                      </div>
                      <div className="notification-item-actions">
                        {!notification.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            title="Mark as read"
                          >
                            <Check size={12} /> Mark Read
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification._id, e)}
                          title="Delete notification"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                    <span className="notification-item-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}

              {notifications.length > 0 && (
                <div style={{
                  padding: '10px 16px',
                  borderTop: '1px solid var(--border-color, #e0e0e0)',
                  textAlign: 'center'
                }}>
                  <button
                    onClick={handleCleanup}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary, #999)',
                      fontSize: '12px',
                      textDecoration: 'underline'
                    }}
                  >
                    Clean up old notifications
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
