// Reminder API functions
const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function authHeaders(token) {
  const t = token ?? localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Set reminder for a note
export const setReminder = async (noteId, reminderData, token) => {
  const res = await fetch(`${BASE}/api/reminders/${noteId}/reminder`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(reminderData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to set reminder");
  }
  return await res.json();
};

// Remove reminder from a note
export const removeReminder = async (noteId, token) => {
  const res = await fetch(`${BASE}/api/reminders/${noteId}/reminder`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to remove reminder");
  }
  return await res.json();
};

// Get upcoming reminders
export const getUpcomingReminders = async (token) => {
  try {
    console.log("📡 Fetching upcoming reminders from:", `${BASE}/api/reminders/upcoming`);
    const res = await fetch(`${BASE}/api/reminders/upcoming`, {
      headers: { ...authHeaders(token) },
    });
    console.log("📡 Upcoming reminders response status:", res.status);
    const data = await res.json();
    console.log("✅ Upcoming reminders data:", data);
    if (!res.ok) {
      console.error("❌ Upcoming reminders error:", data);
      throw new Error(data.message || "Failed to fetch upcoming reminders");
    }
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch upcoming reminders:", error.message);
    throw error;
  }
};

// Get overdue notes
export const getOverdueNotes = async (token) => {
  try {
    console.log("📡 Fetching overdue notes from:", `${BASE}/api/reminders/overdue`);
    const res = await fetch(`${BASE}/api/reminders/overdue`, {
      headers: { ...authHeaders(token) },
    });
    console.log("📡 Overdue notes response status:", res.status);
    const data = await res.json();
    console.log("✅ Overdue notes data:", data);
    if (!res.ok) {
      console.error("❌ Overdue notes error:", data);
      throw new Error(data.message || "Failed to fetch overdue notes");
    }
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch overdue notes:", error.message);
    throw error;
  }
};

// Acknowledge reminder
export const acknowledgeReminder = async (noteId, token) => {
  const res = await fetch(`${BASE}/api/reminders/${noteId}/reminder/acknowledge`, {
    method: "POST",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to acknowledge reminder");
  }
  return await res.json();
};

// Snooze reminder
export const snoozeReminder = async (noteId, snoozeMinutes, token) => {
  const res = await fetch(`${BASE}/api/reminders/${noteId}/reminder/snooze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ snoozeMinutes }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to snooze reminder");
  }
  return await res.json();
};

// Get in-app notifications
export const getNotifications = async (token) => {
  const res = await fetch(`${BASE}/api/notifications`, {
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch notifications");
  }
  return await res.json();
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, token) => {
  const res = await fetch(`${BASE}/api/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to mark notification as read");
  }
  return await res.json();
};

// Clear all notifications
export const clearNotifications = async (token) => {
  const res = await fetch(`${BASE}/api/notifications`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to clear notifications");
  }
  return await res.json();
};
// Test if reminders API is reachable (no auth required)
export const testRemindersApi = async () => {
  try {
    console.log("🧪 Testing reminders API availability...");
    const res = await fetch(`${BASE}/api/reminders/debug/test`);
    const data = await res.json();
    console.log("✅ API Test Response:", data);
    return { success: res.ok, data };
  } catch (error) {
    console.error("❌ API Test Failed:", error.message);
    return { success: false, error: error.message };
  }
};