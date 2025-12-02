import express from "express";
import multer from "multer";
import path from "path";
import { 
  uploadVoiceRecording, 
  getVoiceRecordings, 
  deleteVoiceRecording, 
  updateVoiceRecording 
} from "../src/controllers/voiceController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/voice/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const audioMimes = [
      "audio/mpeg",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/mp4",
    ];
    if (audioMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files allowed."));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// POST /api/voice - Upload new recording
router.post("/", protect, upload.single("audio"), uploadVoiceRecording);

// GET /api/voice - Get all recordings
router.get("/", protect, getVoiceRecordings);

// PUT /api/voice/:id - Update recording
router.put("/:id", protect, updateVoiceRecording);

// DELETE /api/voice/:id - Delete recording
router.delete("/:id", protect, deleteVoiceRecording);

export default router;