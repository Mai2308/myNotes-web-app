import mongoose from "mongoose";

const calendarSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    noteId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Note" 
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    date: { 
      type: Date, 
      required: true 
    },
    time: { 
      type: String 
    },
    reminderEnabled: { 
      type: Boolean, 
      default: false 
    },
    reminderTime: { 
      type: Number 
    },
    color: { 
      type: String, 
      default: "#3B82F6" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Calendar", calendarSchema);