import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getReminders, getNotifications, createReminder, updateReminder, deleteReminder, snoozeReminder } from '../api/remindersApi';

/**
 * ReminderContext
 * Global state management for reminders and notifications
 */
const ReminderContext = createContext();

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within ReminderProvider');
  }
  return context;
};

export const ReminderProvider = ({ children }) => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // Fetch reminders when user logs in
  useEffect(() => {
    if (user) {
      fetchReminders();
      // Poll reminders every 5 minutes
      const reminderInterval = setInterval(fetchReminders, 5 * 60 * 1000);

      // Poll notifications every 30 seconds
      const notificationInterval = setInterval(fetchNotifications, 30 * 1000);

      return () => {
        clearInterval(reminderInterval);
        clearInterval(notificationInterval);
      };
    }
  }, [user]);

  const fetchReminders = async () => {
    try {
      const data = await getReminders({});
      setReminders(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
      setError(err.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(20, false); // Include read notifications
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const createReminderHandler = async (noteId, reminderData) => {
    try {
      const newReminder = await createReminder(noteId, reminderData);
      setReminders([...reminders, newReminder]);
      return newReminder;
    } catch (err) {
      console.error('Failed to create reminder:', err);
      throw err;
    }
  };

  const updateReminderHandler = async (reminderId, reminderData) => {
    try {
      const updated = await updateReminder(reminderId, reminderData);
      setReminders(reminders.map(r => r._id === reminderId ? updated : r));
      return updated;
    } catch (err) {
      console.error('Failed to update reminder:', err);
      throw err;
    }
  };

  const deleteReminderHandler = async (reminderId) => {
    try {
      await deleteReminder(reminderId);
      setReminders(reminders.filter(r => r._id !== reminderId));
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      throw err;
    }
  };

  const snoozeReminderHandler = async (reminderId, minutes) => {
    try {
      const updated = await snoozeReminder(reminderId, minutes);
      setReminders(reminders.map(r => r._id === reminderId ? updated : r));
      return updated;
    } catch (err) {
      console.error('Failed to snooze reminder:', err);
      throw err;
    }
  };

  // Get upcoming reminders (due in next 24 hours or overdue)
  const getUpcomingReminders = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      return dueDate <= tomorrow;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  // Get overdue reminders
  const getOverdueReminders = () => {
    const now = new Date();
    return reminders.filter(r => new Date(r.dueDate) < now);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  const value = {
    reminders,
    notifications,
    error,
    fetchReminders,
    fetchNotifications,
    createReminderHandler,
    updateReminderHandler,
    deleteReminderHandler,
    snoozeReminderHandler,
    getUpcomingReminders,
    getOverdueReminders,
    getUnreadNotifications,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};

export default ReminderContext;
