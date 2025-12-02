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
import calendarRoutes from "./routes/calendar.js";
import voiceRoutes from "./routes/voice.js";

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

// Mount API routes (routes should apply protect middleware where needed)
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/uploads", express.static("public/uploads"));

// Global 404 handler
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
let server;

// Connect DB then start
connectMongo()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  try {
    if (server) server.close();
    // If your connectMongo returns a mongoose instance or you can import mongoose here and disconnect:
    // await mongoose.disconnect();
  } catch (err) {
    console.error("Error during shutdown:", err);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

export default app;