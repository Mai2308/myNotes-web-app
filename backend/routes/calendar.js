import express from "express";
import { 
  createEvent, 
  getEvents, 
  updateEvent, 
  deleteEvent 
} from "../src/controllers/calendarController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createEvent);
router.get("/", protect, getEvents);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;