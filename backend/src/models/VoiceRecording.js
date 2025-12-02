import mongoose from "mongoose";

const voiceRecordingSchema = new mongoose.Schema(
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
    audioUrl: { 
      type: String, 
      required: true 
    },
    duration: { 
      type: Number 
    },
    transcription: { 
      type: String 
    },
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model("VoiceRecording", voiceRecordingSchema);