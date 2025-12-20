// backend/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Routes
import userRoutes from "./routes/users.js";
import noteRoutes from "./routes/notes.js";
import folderRoutes from "./routes/folders.js";
import emojiRoutes from "./routes/emojis.js";
import flashcardRoutes from "./routes/flashcards.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
}));
app.use(express.json({ limit: "10mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Serve static files from frontend build
// Try both locations: public folder (production) and ../frontend/build (local dev)
let buildPath = path.join(__dirname, "public");
if (!fs.existsSync(buildPath)) {
  buildPath = path.join(__dirname, "../frontend/build");
}
console.log("Build path:", buildPath);

// Check if build directory exists and serve static files
if (fs.existsSync(buildPath)) {
  console.log("Build directory found, serving static files");
  app.use(express.static(buildPath));
} else {
  console.warn("WARNING: Build directory does not exist at", buildPath);
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "🚀 Notes App Backend Running!" });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/emojis", emojiRoutes);
app.use("/api/flashcards", flashcardRoutes);

// Serve React app for all other routes (must be after API routes)
// Express 5 compatible - use middleware instead of wildcard route
app.use((req, res) => {
  const indexPath = path.join(buildPath, "index.html");
  console.log("Attempting to serve index.html from:", indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error serving index.html", error: err.message });
      }
    }
  });
});

// Error handler (must be last)
app.use((err, req, res, next) => {
  console.error("Express error handler - Unhandled error:", err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      message: err.message || "Server error",
    });
  }
});

export default app;

