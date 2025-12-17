import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Get all in-app notifications
export const getNotifications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error.response?.data?.message || error.message;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error.response?.data?.message || error.message;
  }
};

// Clear all notifications
export const clearNotifications = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error clearing notifications:", error);
    throw error.response?.data?.message || error.message;
  }
};
