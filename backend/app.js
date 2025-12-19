// backend/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import userRoutes from "./routes/users.js";
import noteRoutes from "./routes/notes.js";
import folderRoutes from "./routes/folders.js";
import emojiRoutes from "./routes/emojis.js";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
}));
app.use(express.json({ limit: "10mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Notes App Backend Running!");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/emojis", emojiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

export default app;

