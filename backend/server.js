import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { poolConnect } from "./database/db.js"; // ✅ existing DB connection

// ✅ Import Routes
import userRoutes from "./routes/users.js"; // make sure filename matches exactly
import noteRoutes from "./routes/notes.js"; // for notes routes

// ✅ Load environment variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Test route (optional)
app.get("/", (req, res) => {
  res.send("🚀 Notes App Backend Running!");
});

// ✅ API Routes
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

// ✅ Connect to SQL Server
poolConnect
  .then(() => console.log("✅ Connected to SQL Server in Docker!"))
  .catch((err) => console.error("❌ SQL Server connection failed:", err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));