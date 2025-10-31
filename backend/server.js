import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { poolConnect } from "./database/db.js";  // existing DB connection
import userRoutes from "./routes/userRoutes.js"; // ✅ new line

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Notes App Backend Running!");
});

// ✅ Add user API routes
app.use("/api/users", userRoutes);

// Connect to SQL Server
poolConnect
  .then(() => console.log("✅ Connected to SQL Server in Docker!"))
  .catch(err => console.error("❌ SQL Server connection failed:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
