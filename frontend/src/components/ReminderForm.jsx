import React, { useState } from 'react';
import { ChevronDown, Clock, RotateCw } from 'lucide-react';
import '../styles/reminder.css';

/**
 * ReminderForm Component
 * Allows users to set reminders with date, time, notification type, and recurring options
 */
const ReminderForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null,
  isLoading = false 
}) => {
  const [reminderData, setReminderData] = useState(
    initialData || {
      enabled: false,
      dueDate: '',
      dueTime: '09:00',
      notificationType: 'in-app',
      recurring: {
        enabled: false,
        frequency: 'daily',
        endDate: '',
      },
    }
  );

  const [showRecurringOptions, setShowRecurringOptions] = useState(
    initialData?.recurring?.enabled || false
  );

  const handleDateChange = (e) => {
    setReminderData({
      ...reminderData,
      dueDate: e.target.value,
    });
  };

  const handleTimeChange = (e) => {
    setReminderData({
      ...reminderData,
      dueTime: e.target.value,
    });
  };

  const handleNotificationTypeChange = (e) => {
    setReminderData({
      ...reminderData,
      notificationType: e.target.value,
    });
  };

  const handleRecurringToggle = () => {
    setShowRecurringOptions(!showRecurringOptions);
    setReminderData({
      ...reminderData,
      recurring: {
        ...reminderData.recurring,
        enabled: !showRecurringOptions,
      },
    });
  };

  const handleFrequencyChange = (e) => {
    setReminderData({
      ...reminderData,
      recurring: {
        ...reminderData.recurring,
        frequency: e.target.value,
      },
    });
  };

  const handleRecurringEndDateChange = (e) => {
    setReminderData({
      ...reminderData,
      recurring: {
        ...reminderData.recurring,
        endDate: e.target.value,
      },
    });
  };

  const handleEnabledToggle = () => {
    setReminderData({
      ...reminderData,
      enabled: !reminderData.enabled,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reminderData.enabled) {
      onSubmit(null);
      return;
    }

    if (!reminderData.dueDate) {
      alert('Please select a due date');
      return;
    }

    // Combine date and time into ISO string
    const dateTime = new Date(`${reminderData.dueDate}T${reminderData.dueTime}:00`);
    
    const submitData = {
      enabled: reminderData.enabled,
      dueDate: dateTime.toISOString(),
      notificationType: reminderData.notificationType,
      recurring: reminderData.recurring,
    };

    onSubmit(submitData);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="reminder-form" onSubmit={handleSubmit}>
      <div className="reminder-form-header">
        <h3>Set Reminder/Deadline</h3>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={reminderData.enabled}
            onChange={handleEnabledToggle}
            className="form-checkbox"
          />
          <span>Enable reminder for this note</span>
        </label>
      </div>

      {reminderData.enabled && (
        <>
          {/* Date and Time Selection */}
          <div className="form-group">
            <label htmlFor="due-date">Due Date *</label>
            <input
              type="date"
              id="due-date"
              value={reminderData.dueDate}
              onChange={handleDateChange}
              min={today}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="due-time">Due Time</label>
            <div className="time-input-wrapper">
              <Clock size={18} className="time-icon" />
              <input
                type="time"
                id="due-time"
                value={reminderData.dueTime}
                onChange={handleTimeChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Notification Type */}
          <div className="form-group">
            <label htmlFor="notification-type">Notification Type</label>
            <div className="select-wrapper">
              <select
                id="notification-type"
                value={reminderData.notificationType}
                onChange={handleNotificationTypeChange}
                className="form-select"
              >
                <option value="in-app">In-App Notification</option>
                <option value="email">Email</option>
                <option value="alert">Both (Email & Alert)</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          {/* Recurring Options */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showRecurringOptions}
                onChange={handleRecurringToggle}
                className="form-checkbox"
              />
              <span>
                <RotateCw size={16} className="recurring-icon" />
                Repeat reminder
              </span>
            </label>
          </div>

          {showRecurringOptions && (
            <div className="recurring-options">
              <div className="form-group">
                <label htmlFor="frequency">Repeat Frequency</label>
                <div className="select-wrapper">
                  <select
                    id="frequency"
                    value={reminderData.recurring.frequency}
                    onChange={handleFrequencyChange}
                    className="form-select"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="end-date">End Date (Optional)</label>
                <input
                  type="date"
                  id="end-date"
                  value={reminderData.recurring.endDate}
                  onChange={handleRecurringEndDateChange}
                  min={reminderData.dueDate}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Reminder Summary */}
          <div className="reminder-summary">
            <p className="summary-text">
              📅 Reminder on {new Date(reminderData.dueDate).toLocaleDateString()} at {reminderData.dueTime}
              {showRecurringOptions && (
                <>
                  <br />
                  🔄 Repeats {reminderData.recurring.frequency}
                  {reminderData.recurring.endDate && (
                    ` until ${new Date(reminderData.recurring.endDate).toLocaleDateString()}`
                  )}
                </>
              )}
              <br />
              📧 Via {reminderData.notificationType === 'in-app' ? 'In-App Notification' : reminderData.notificationType === 'email' ? 'Email' : 'Email & Alert'}
            </p>
          </div>
        </>
      )}

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Saving...' : 'Save Reminder'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ReminderForm;
