import React, { useState, useEffect } from 'react';
import { Clock, RotateCw, Bell, Trash2, Zap } from 'lucide-react';
import { getReminders, deleteReminder, snoozeReminder, sortRemindersByDueDate, filterRemindersByStatus, groupRemindersByDate } from '../api/remindersApi';
import '../styles/reminder.css';

/**
 * RemindersList Component
 * Displays all reminders with filtering, sorting, and action options
 */
const RemindersList = ({ onReminderUpdated = () => {} }) => {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'overdue', 'due-soon', 'upcoming'
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getReminders({});
      setReminders(data || []);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
      setError('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await deleteReminder(reminderId);
      setReminders(reminders.filter(r => r._id !== reminderId));
      onReminderUpdated();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      alert('Failed to delete reminder');
    }
  };

  const handleSnooze = async (reminderId, minutes = 60) => {
    try {
      await snoozeReminder(reminderId, minutes);
      await fetchReminders();
      onReminderUpdated();
    } catch (err) {
      console.error('Failed to snooze reminder:', err);
      alert('Failed to snooze reminder');
    }
  };

  const getReminderStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) return 'overdue';
    if (diffHours < 24) return 'due-soon';
    return 'upcoming';
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (dueDate.getTime() === today.getTime()) {
      return `Today at ${time}`;
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${time}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined }) + ` at ${time}`;
    }
  };

  // Apply filtering and sorting
  let processedReminders = [...reminders];

  // Apply status filter
  if (filterStatus !== 'all') {
    processedReminders = processedReminders.filter(r => {
      const status = getReminderStatus(r.dueDate);
      return status === filterStatus;
    });
  }

  // Apply sorting
  processedReminders = sortRemindersByDueDate(processedReminders, sortOrder === 'asc');

  // Group by date
  const groupedReminders = groupRemindersByDate(processedReminders);

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return '#dc3545';
      case 'due-soon':
        return '#ffc107';
      case 'upcoming':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  if (isLoading) {
    return <div className="reminders-list" style={{ padding: '20px', textAlign: 'center' }}>Loading reminders...</div>;
  }

  return (
    <div style={{ padding: '0 0 20px 0' }}>
      {/* Reminder Controls */}
      <div className="reminder-controls">
        <div className="reminder-filter-group">
          <button
            className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`filter-button ${filterStatus === 'overdue' ? 'active' : ''}`}
            onClick={() => setFilterStatus('overdue')}
          >
            ⏰ Overdue
          </button>
          <button
            className={`filter-button ${filterStatus === 'due-soon' ? 'active' : ''}`}
            onClick={() => setFilterStatus('due-soon')}
          >
            ⚠️ Due Soon
          </button>
          <button
            className={`filter-button ${filterStatus === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilterStatus('upcoming')}
          >
            ✓ Upcoming
          </button>
        </div>

        <div className="reminder-filter-group">
          <button
            className={`filter-button ${sortOrder === 'asc' ? 'active' : ''}`}
            onClick={() => setSortOrder('asc')}
            title="Sort: Earliest first"
          >
            ↑ Earliest First
          </button>
          <button
            className={`filter-button ${sortOrder === 'desc' ? 'active' : ''}`}
            onClick={() => setSortOrder('desc')}
            title="Sort: Latest first"
          >
            ↓ Latest First
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          borderRadius: '4px',
          color: '#dc3545',
          marginBottom: '16px',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {processedReminders.length === 0 ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-tertiary, #999)',
          fontSize: '14px',
          background: 'var(--bg-secondary, #f9f9f9)',
          borderRadius: '6px',
          border: '1px solid var(--border-color, #e0e0e0)'
        }}>
          No reminders to display
        </div>
      ) : (
        <div className="reminders-list">
          {Object.entries(groupedReminders).map(([groupKey, groupReminders]) => (
            <div key={groupKey}>
              <div
                style={{
                  padding: '10px 0',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary, #666)',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginTop: '8px'
                }}
                onClick={() => toggleGroup(groupKey)}
              >
                {groupKey} ({groupReminders.length})
              </div>

              {expandedGroups[groupKey] !== false && (
                <>
                  {groupReminders.map(reminder => {
                    const status = getReminderStatus(reminder.dueDate);
                    return (
                      <div
                        key={reminder._id}
                        className={`reminder-item ${status}`}
                        style={{ borderLeft: `4px solid ${getStatusColor(status)}` }}
                      >
                        <div className="reminder-item-indicator" style={{ backgroundColor: getStatusColor(status) }} />

                        <div className="reminder-item-content">
                          <div className="reminder-item-title">
                            {reminder.noteTitle || 'Untitled Note'}
                          </div>
                          <div className="reminder-item-meta">
                            <span>
                              <Clock size={12} />
                              {formatDueDate(reminder.dueDate)}
                            </span>
                            {reminder.notificationType && (
                              <span>
                                <Bell size={12} />
                                {reminder.notificationType === 'in-app' ? 'In-App' : reminder.notificationType === 'email' ? 'Email' : 'Email & Alert'}
                              </span>
                            )}
                            {reminder.recurring && reminder.recurring.enabled && (
                              <span>
                                <RotateCw size={12} />
                                {reminder.recurring.frequency}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="reminder-item-actions">
                          {status === 'overdue' && (
                            <button
                              className="reminder-item-action-btn"
                              onClick={() => handleSnooze(reminder._id, 60)}
                              title="Snooze 1 hour"
                            >
                              <Zap size={12} /> 1h
                            </button>
                          )}
                          {status === 'overdue' && (
                            <button
                              className="reminder-item-action-btn"
                              onClick={() => handleSnooze(reminder._id, 1440)}
                              title="Snooze 1 day"
                            >
                              <Zap size={12} /> 1d
                            </button>
                          )}
                          <button
                            className="reminder-item-action-btn"
                            onClick={() => handleDelete(reminder._id)}
                            title="Delete reminder"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RemindersList;
