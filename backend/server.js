// backend/server.js
import dotenv from "dotenv";
import app from "./app.js";
import connectMongo from "./src/database/mongo.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
let server;

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
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
