import Calendar from "../models/Calendar.js";

// CREATE a new event
export const createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, date, time, reminderEnabled, reminderTime, color } = req.body;

    const event = new Calendar({
      userId,
      title,
      description,
      date,
      time,
      reminderEnabled,
      reminderTime,
      color,
    });

    await event.save();
    res.status(201).json({ 
      message: "Event created successfully", 
      event 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error creating event", 
      error: err.message 
    });
  }
};

// READ all events for current user
export const getEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let query = { userId };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const events = await Calendar.find(query).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching events", 
      error: err.message 
    });
  }
};

// UPDATE an event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const event = await Calendar.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.json({ 
      message: "Event updated successfully", 
      event 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error updating event", 
      error: err.message 
    });
  }
};

// DELETE an event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Calendar.findOneAndDelete({ _id: id, userId });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ 
      message: "Error deleting event", 
      error: err.message 
    });
  }
};