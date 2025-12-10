import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import "../styles/Calendar.css";

const Calendar = () => {
  // State variables
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    reminderEnabled: false,
    color: "#3B82F6",
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch events when month/year changes
  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to fetch events from backend
  const fetchEvents = async () => {
    try {
      const month = currentDate.getMonth() + 1; // JS months are 0-indexed
      const year = currentDate.getFullYear();
      
      const response = await fetch(
        `${API_URL}/api/calendar?month=${month}&year=${year}`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );
      
      if (!response.ok) throw new Error("Failed to fetch events");
      
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  // Function to create new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/api/calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Clear form and close modal
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          reminderEnabled: false,
          color: "#3B82F6",
        });
        // Refresh events list
        fetchEvents();
      } else {
        console.error("Failed to create event");
      }
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  // Function to delete an event
  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/api/calendar/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        fetchEvents(); // Refresh events list
      } else {
        console.error("Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // Function to edit an event
  const handleEditEvent = async (eventId, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/api/calendar/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        fetchEvents(); // Refresh events list
      } else {
        console.error("Failed to edit event");
      }
    } catch (err) {
      console.error("Error editing event:", err);
    }
  };

  // Helper functions
  const daysInMonth = (date) => 
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const firstDayOfMonth = (date) => 
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Generate calendar days array
  const days = [];
  // Add empty spaces for days before month starts
  for (let i = 0; i < firstDayOfMonth(currentDate); i++) {
    days.push(null);
  }
  // Add days of current month
  for (let i = 1; i <= daysInMonth(currentDate); i++) {
    days.push(i);
  }

  // Check if a day has any events
  const hasEvent = (day) => {
    if (!day) return false;
    return events.some((e) => new Date(e.date).getDate() === day);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  return (
    <div className="calendar-container">
      {/* Header with month/year and navigation */}
      <div className="calendar-header">
        <button onClick={goToPreviousMonth}>
          <ChevronLeft />
        </button>
        <h2>
          {currentDate.toLocaleString("default", { 
            month: "long", 
            year: "numeric" 
          })}
        </h2>
        <button onClick={goToNextMonth}>
          <ChevronRight />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {days.map((day, idx) => (
          <div 
            key={idx} 
            className={`calendar-day ${hasEvent(day) ? "has-event" : ""}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Add event button */}
      <button 
        className="add-event-btn" 
        onClick={() => setShowModal(true)}
      >
        <Plus size={18} /> Add Event
      </button>

      {/* Modal for creating event */}
      {showModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Create Calendar Event</h3>
            <form onSubmit={handleCreateEvent}>
              <input
                type="text"
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => 
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Event description"
                value={formData.description}
                onChange={(e) => 
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => 
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => 
                  setFormData({ ...formData, time: e.target.value })
                }
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.reminderEnabled}
                  onChange={(e) => 
                    setFormData({ 
                      ...formData, 
                      reminderEnabled: e.target.checked 
                    })
                  }
                />
                Enable Reminder
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => 
                  setFormData({ ...formData, color: e.target.value })
                }
                title="Pick event color"
              />
              <button type="submit" className="submit-btn">
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add a clock to display the current time */}
      <div className="clock">
        <h3>Current Time: {currentTime.toLocaleTimeString()}</h3>
      </div>

      {/* Display events */}
      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <h4>{event.title}</h4>
            <p>{event.description}</p>
            <p>{new Date(event.date).toLocaleDateString()} {event.time}</p>
            <button onClick={() => handleEditEvent(event.id, { title: "Updated Title" })}>Edit</button>
            <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;