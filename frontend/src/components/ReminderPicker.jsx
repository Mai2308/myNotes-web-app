import React, { useState, useEffect } from "react";
import { Calendar, Clock, Repeat, Bell, X } from "lucide-react";
import "../styles.css";

export default function ReminderPicker({ onReminderSet, existingReminder, disabled }) {
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("daily");

  // Load existing reminder data
  useEffect(() => {
    if (existingReminder?.reminderDate) {
      const date = new Date(existingReminder.reminderDate);
      const dateStr = date.toISOString().split("T")[0];
      const timeStr = date.toISOString().split("T")[1].substring(0, 5);
      
      setReminderDate(dateStr);
      setReminderTime(timeStr);
      setIsRecurring(existingReminder.isRecurring || false);
      setRecurringPattern(existingReminder.recurringPattern || "daily");
      setShowReminder(true);
    }
  }, [existingReminder]);

  const handleDateChange = (e) => setReminderDate(e.target.value);
  const handleTimeChange = (e) => setReminderTime(e.target.value);

  const handleSetReminder = () => {
    if (!reminderDate || !reminderTime) {
      alert("Please select both date and time");
      return;
    }

    // Combine date and time into ISO string
    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
    
    const reminderData = {
      reminderDate: reminderDateTime.toISOString(),
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : null,
    };

    onReminderSet(reminderData);
    setShowReminder(false);
  };

  const handleClearReminder = () => {
    setShowReminder(false);
    setReminderDate("");
    setReminderTime("");
    setIsRecurring(false);
    setRecurringPattern("daily");
    onReminderSet(null);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];
  const minTime = new Date().toISOString().split("T")[1].substring(0, 5);

  return (
    <div className="reminder-section">
      <style>{`
        .reminder-section {
          margin: 16px 0;
          padding: 12px;
          border-radius: var(--radius);
          background: var(--input-bg);
          border: 1px solid var(--input-border);
        }

        .reminder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .reminder-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
          color: var(--accent);
        }

        .reminder-toggle:hover {
          opacity: 0.8;
        }

        .reminder-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--input-border);
        }

        .reminder-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .reminder-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 150px;
        }

        .reminder-input-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .reminder-input-group input,
        .reminder-input-group select {
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid var(--input-border);
          background: var(--card-bg);
          color: var(--text);
          font-size: 14px;
          font-family: var(--font-sans);
        }

        .reminder-input-group input:focus,
        .reminder-input-group select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255, 126, 185, 0.1);
        }

        .reminder-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .reminder-checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reminder-checkbox-item input[type="checkbox"] {
          cursor: pointer;
          width: 18px;
          height: 18px;
          accent-color: var(--accent);
        }

        .reminder-checkbox-item label {
          cursor: pointer;
          font-size: 14px;
        }

        .reminder-recurring {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reminder-recurring input[type="checkbox"] {
          cursor: pointer;
          width: 18px;
          height: 18px;
          accent-color: var(--accent);
        }

        .reminder-recurring label {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .reminder-buttons {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .reminder-buttons button {
          flex: 1;
          padding: 10px 16px;
          border-radius: 6px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .reminder-buttons .save-btn {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
          color: white;
        }

        .reminder-buttons .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 126, 185, 0.3);
        }

        .reminder-buttons .clear-btn {
          background: transparent;
          border: 1px solid var(--input-border);
          color: var(--muted);
        }

        .reminder-buttons .clear-btn:hover {
          background: var(--input-bg);
          color: var(--text);
        }

        .reminder-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
          color: white;
          font-size: 13px;
          font-weight: 600;
        }

        .reminder-badge svg {
          width: 14px;
          height: 14px;
        }
      `}</style>

      {!showReminder ? (
        <div className="reminder-header">
          <button
            className="reminder-toggle"
            onClick={() => setShowReminder(true)}
            disabled={disabled}
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            <Bell size={18} />
            {existingReminder?.reminderDate ? "Edit Reminder" : "Add Reminder"}
          </button>
          {existingReminder?.reminderDate && (
            <div className="reminder-badge">
              <Calendar size={14} />
              {new Date(existingReminder.reminderDate).toLocaleDateString()} at{" "}
              {new Date(existingReminder.reminderDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="reminder-content">
          {/* Date and Time */}
          <div className="reminder-row">
            <div className="reminder-input-group">
              <label>
                <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />
                Date
              </label>
              <input
                type="date"
                value={reminderDate}
                onChange={handleDateChange}
                min={today}
              />
            </div>
            <div className="reminder-input-group">
              <label>
                <Clock size={14} style={{ display: "inline", marginRight: "4px" }} />
                Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={handleTimeChange}
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="reminder-checkbox-group">
            <div className="reminder-recurring">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <label htmlFor="recurring">
                <Repeat size={14} />
                Repeat Reminder
              </label>
            </div>
            {isRecurring && (
              <div className="reminder-input-group">
                <label>Pattern</label>
                <select
                  value={recurringPattern}
                  onChange={(e) => setRecurringPattern(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="reminder-buttons">
            <button className="save-btn" onClick={handleSetReminder}>
              Save Reminder
            </button>
            <button className="clear-btn" onClick={handleClearReminder}>
              <X size={16} style={{ display: "inline", marginRight: "4px" }} />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
