import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axios instance with auth token
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ REMINDER ENDPOINTS ============

/**
 * Create a new reminder for a note
 */
export const createReminder = async (noteId, reminderData) => {
  try {
    const response = await axiosInstance.post('/reminders', {
      noteId,
      ...reminderData,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

/**
 * Get all reminders for the user
 */
export const getReminders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.noteId) params.append('noteId', filters.noteId);

    const response = await axiosInstance.get(`/reminders?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};

/**
 * Get reminders that are due
 */
export const getDueReminders = async () => {
  try {
    const response = await axiosInstance.get('/reminders/due');
    return response.data;
  } catch (error) {
    console.error('Error fetching due reminders:', error);
    throw error;
  }
};

/**
 * Get a specific reminder
 */
export const getReminder = async (reminderId) => {
  try {
    const response = await axiosInstance.get(`/reminders/${reminderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reminder:', error);
    throw error;
  }
};

/**
 * Update a reminder
 */
export const updateReminder = async (reminderId, updateData) => {
  try {
    const response = await axiosInstance.put(`/reminders/${reminderId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (reminderId) => {
  try {
    const response = await axiosInstance.delete(`/reminders/${reminderId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

/**
 * Snooze a reminder
 */
export const snoozeReminder = async (reminderId, minutesToSnooze = 5) => {
  try {
    const response = await axiosInstance.post(`/reminders/${reminderId}/snooze`, {
      minutesToSnooze,
    });
    return response.data;
  } catch (error) {
    console.error('Error snoozing reminder:', error);
    throw error;
  }
};

/**
 * Get reminders for a specific note
 */
export const getRemindersForNote = async (noteId) => {
  try {
    const response = await axiosInstance.get(`/reminders/note/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching note reminders:', error);
    throw error;
  }
};

// ============ NOTIFICATION ENDPOINTS ============

/**
 * Get all notifications
 */
export const getNotifications = async (limit = 50, unreadOnly = false) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('unreadOnly', unreadOnly);

    const response = await axiosInstance.get(`/notifications?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get a specific notification
 */
export const getNotification = async (notificationId) => {
  try {
    const response = await axiosInstance.get(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosInstance.post('/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axiosInstance.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Cleanup old notifications
 */
export const cleanupNotifications = async (daysOld = 30) => {
  try {
    const response = await axiosInstance.delete('/notifications/cleanup', {
      data: { daysOld },
    });
    return response.data;
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    throw error;
  }
};

// ============ UTILITY FUNCTIONS ============

/**
 * Format reminder data for display
 */
export const formatReminderForDisplay = (reminder) => {
  const dueDate = new Date(reminder.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now;
  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

  return {
    ...reminder,
    dueDate: dueDate,
    isOverdue,
    daysUntilDue,
    formattedDate: dueDate.toLocaleDateString(),
    formattedTime: dueDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    formattedDateTime: dueDate.toLocaleString(),
    status: isOverdue ? 'overdue' : daysUntilDue <= 1 ? 'due-soon' : 'upcoming',
  };
};

/**
 * Sort reminders by due date
 */
export const sortRemindersByDueDate = (reminders, ascending = true) => {
  return [...reminders].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Filter reminders by status
 */
export const filterRemindersByStatus = (reminders, status) => {
  return reminders.filter((reminder) => reminder.status === status);
};

/**
 * Get reminders grouped by date
 */
export const groupRemindersByDate = (reminders) => {
  const grouped = {};

  reminders.forEach((reminder) => {
    const date = new Date(reminder.dueDate).toLocaleDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(reminder);
  });

  return grouped;
};

const remindersAPI = {
  // Reminders
  createReminder,
  getReminders,
  getDueReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  snoozeReminder,
  getRemindersForNote,
  // Notifications
  getNotifications,
  getNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  cleanupNotifications,
  // Utilities
  formatReminderForDisplay,
  sortRemindersByDueDate,
  filterRemindersByStatus,
  groupRemindersByDate,
};

export default remindersAPI;
