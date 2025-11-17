import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { poolConnect } from "./database/db.js";

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize Express App
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Import Routes
import userRoutes from "./routes/users.js";
import noteRoutes from "./routes/notes.js";
import folderRoutes from "./routes/folders.js";

// ✅ API Routes
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/folders", folderRoutes);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// ✅ Connect to SQL Server & Start Server
const PORT = process.env.PORT || 5000;

poolConnect
  .then(() => {
    console.log("✅ Connected to SQL Server");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });