import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { poolConnect } from "./database/db.js"; // DB connection

// Import Routes
import userRoutes from "./routes/users.js";
import noteRoutes from "./routes/notes.js";
import folderRoutes from "./routes/folders.js";

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Notes App Backend Running!");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/folders", folderRoutes);

// Database Connection Check
poolConnect
  .then(() => console.log("✅ Connected to SQL Server in Docker!"))
  .catch((err) => console.error("❌ SQL Server connection failed:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
