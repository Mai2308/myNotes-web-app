import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Clock,
  Bell,
  Repeat2,
  X,
  Check,
  AlertCircle,
  Calendar,
} from "lucide-react";
import "../styles/reminder.css";

const ReminderModal = ({ isOpen, onClose, onSave, initialReminder = null }) => {
  const { theme } = useTheme();
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("daily");
  const [notificationMethods, setNotificationMethods] = useState(["in-app"]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialReminder) {
      if (initialReminder.reminderDate) {
        const date = new Date(initialReminder.reminderDate);
        setReminderDate(date.toISOString().split("T")[0]);
        setReminderTime(
          `${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
          ).padStart(2, "0")}`
        );
      }
      setIsRecurring(initialReminder.isRecurring || false);
      setRecurringPattern(initialReminder.recurringPattern || "daily");
      setNotificationMethods(initialReminder.notificationMethods || ["in-app"]);
    }
  }, [initialReminder, isOpen]);

  const handleMethodToggle = (method) => {
    setNotificationMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const handleSave = () => {
    setError("");

    if (!reminderDate) {
      setError("Please select a reminder date");
      return;
    }

    const selectedDateTime = new Date(`${reminderDate}T${reminderTime}`);
    const now = new Date();

    if (selectedDateTime <= now) {
      setError("Reminder date and time must be in the future");
      return;
    }

    if (notificationMethods.length === 0) {
      setError("Please select at least one notification method");
      return;
    }

    const reminderData = {
      reminderDate: selectedDateTime.toISOString(),
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : null,
      notificationMethods,
    };

    onSave(reminderData);
    handleClose();
  };

  const handleClose = () => {
    setError("");
    setReminderDate("");
    setReminderTime("09:00");
    setIsRecurring(false);
    setRecurringPattern("daily");
    setNotificationMethods(["in-app"]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`reminder-modal-overlay theme-${theme}`}>
      <div className="reminder-modal">
        <div className="reminder-modal-header">
          <h2>
            <Clock size={20} /> Set Reminder
          </h2>
          <button className="reminder-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="reminder-modal-body">
          {error && (
            <div className="reminder-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Date & Time Selection */}
          <div className="reminder-section">
            <label className="reminder-label">
              <Calendar size={16} />
              Date & Time
            </label>
            <div className="reminder-datetime-inputs">
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="reminder-date-input"
              />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="reminder-time-input"
              />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="reminder-section">
            <label className="reminder-checkbox-label">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="reminder-checkbox"
              />
              <Repeat2 size={16} />
              <span>Repeat reminder</span>
            </label>
          </div>

          {/* Recurring Pattern */}
          {isRecurring && (
            <div className="reminder-section">
              <label className="reminder-label">Pattern</label>
              <select
                value={recurringPattern}
                onChange={(e) => setRecurringPattern(e.target.value)}
                className="reminder-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          {/* Notification Methods */}
          <div className="reminder-section">
            <label className="reminder-label">
              <Bell size={16} />
              Notifications
            </label>
            <div className="reminder-methods">
              <label className="reminder-method-checkbox">
                <input
                  type="checkbox"
                  checked={notificationMethods.includes("in-app")}
                  onChange={() => handleMethodToggle("in-app")}
                />
                <span>In-App Notification</span>
              </label>
              <label className="reminder-method-checkbox">
                <input
                  type="checkbox"
                  checked={notificationMethods.includes("email")}
                  onChange={() => handleMethodToggle("email")}
                />
                <span>Email Notification</span>
              </label>
            </div>
          </div>
        </div>

        <div className="reminder-modal-footer">
          <button className="reminder-btn-cancel" onClick={handleClose}>
            <X size={16} />
            Cancel
          </button>
          <button className="reminder-btn-save" onClick={handleSave}>
            <Check size={16} />
            Set Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
