// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import connectMongo from "./src/database/mongo.js"; // ensure this default-export exists

// Routes
import userRoutes from "./routes/users.js";
import noteRoutes from "./routes/notes.js";
import folderRoutes from "./routes/folders.js";
import emojiRoutes from "./routes/emojis.js";
import reminderRoutes from "./routes/reminders.js";
import notificationRoutes from "./routes/notifications.js";
import flashcardRoutes from "./routes/flashcards.js";

// Services
import { startNotificationScheduler } from "./services/notificationService.js";

dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // basic security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*", // tighten in production
}));
app.use(express.json({ limit: "10mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Simple health check
app.get("/", (req, res) => res.send("🚀 Notes App Backend Running!"));

// Debug endpoint (development only) - check user count
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/users", async (req, res) => {
    try {
      const User = await import("./models/userModel.js").then(m => m.default);
      const count = await User.countDocuments();
      res.json({ totalUsers: count, timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Mount API routes (routes should apply protect middleware where needed)
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/emojis", emojiRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/flashcards", flashcardRoutes);

// Global 404 handler
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
let server;

connectMongo()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      // Start the notification scheduler after server starts
      startNotificationScheduler();
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  try {
    if (server) server.close();
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
