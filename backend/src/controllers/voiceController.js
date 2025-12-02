import VoiceRecording from "../models/VoiceRecording.js";
import fs from "fs";
import path from "path";

// CREATE - Upload a voice recording
export const uploadVoiceRecording = async (req, res) => {
  try {
    const { title, duration, tags } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No audio file provided" });
    }

    const audioUrl = `/uploads/voice/${file.filename}`;

    const recording = new VoiceRecording({
      userId,
      title: title || `Recording ${new Date().toLocaleDateString()}`,
      audioUrl,
      duration: parseInt(duration) || 0,
      tags: tags ? tags.split(",") : [],
    });

    await recording.save();
    res.status(201).json({ 
      message: "Recording uploaded successfully", 
      recording 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error uploading recording", 
      error: err.message 
    });
  }
};

// READ - Get all voice recordings for current user
export const getVoiceRecordings = async (req, res) => {
  try {
    const userId = req.user.id;
    const recordings = await VoiceRecording.find({ userId }).sort({ 
      createdAt: -1 
    });
    res.json(recordings);
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching recordings", 
      error: err.message 
    });
  }
};

// UPDATE - Update a voice recording
export const updateVoiceRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const recording = await VoiceRecording.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    res.json({ 
      message: "Recording updated successfully", 
      recording 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error updating recording", 
      error: err.message 
    });
  }
};

// DELETE - Delete a voice recording
export const deleteVoiceRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recording = await VoiceRecording.findOneAndDelete({ 
      _id: id, 
      userId 
    });

    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    // Delete the actual audio file
    const filePath = path.join(process.cwd(), "public", recording.audioUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Recording deleted successfully" });
  } catch (err) {
    res.status(500).json({ 
      message: "Error deleting recording", 
      error: err.message 
    });
  }
};