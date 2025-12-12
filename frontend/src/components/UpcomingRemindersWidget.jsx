import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { useReminders } from '../context/ReminderContext';

/**
 * UpcomingRemindersWidget
 * Displays next 5 due reminders on the dashboard
 */
const UpcomingRemindersWidget = () => {
  const { reminders } = useReminders();

  // Get reminders that are due in next 7 days or overdue
  const upcomingReminders = reminders
    .filter(r => {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const dueDate = new Date(r.dueDate);
      return dueDate <= sevenDaysLater;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  if (upcomingReminders.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary, #f9f9f9)',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid var(--border-color, #e0e0e0)',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} style={{ color: '#28a745' }} />
          Upcoming Reminders
        </h3>
        <p style={{ color: 'var(--text-tertiary, #999)', margin: 0 }}>
          No reminders due in the next week
        </p>
      </div>
    );
  }

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffDays < 0) {
      return `⏰ ${Math.abs(diffDays)} days ago at ${time}`;
    } else if (diffDays === 0) {
      return `Today at ${time}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${time}`;
    } else {
      return `In ${diffDays} days at ${time}`;
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

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary, #f9f9f9)',
      borderRadius: '8px',
      padding: '20px',
      border: '1px solid var(--border-color, #e0e0e0)',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={20} style={{ color: '#007bff' }} />
        Upcoming Reminders ({upcomingReminders.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {upcomingReminders.map(reminder => {
          const status = getReminderStatus(reminder.dueDate);
          const statusColors = {
            overdue: { bg: 'rgba(220, 53, 69, 0.1)', icon: '⏰', color: '#dc3545' },
            'due-soon': { bg: 'rgba(255, 193, 7, 0.1)', icon: '⚠️', color: '#ffc107' },
            upcoming: { bg: 'rgba(40, 167, 69, 0.1)', icon: '✓', color: '#28a745' }
          };

          const statusColor = statusColors[status];

          return (
            <div
              key={reminder._id}
              style={{
                backgroundColor: statusColor.bg,
                borderLeft: `4px solid ${statusColor.color}`,
                padding: '12px',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ color: 'var(--text-primary, #333)' }}>
                  {reminder.noteTitle || 'Untitled Note'}
                </strong>
                <span style={{ color: statusColor.color }}>
                  {statusColor.icon} {status === 'overdue' ? 'OVERDUE' : status === 'due-soon' ? 'DUE SOON' : 'UPCOMING'}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary, #666)' }}>
                📅 {formatDueDate(reminder.dueDate)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingRemindersWidget;
