// api/index.js - Vercel serverless function wrapper
import dotenv from "dotenv";
import app from "../backend/app.js";
import connectMongo from "../backend/src/database/mongo.js";

dotenv.config();

// Connection cache
let isConnected = false;

// Initialize MongoDB connection
async function initializeDB() {
  if (!isConnected) {
    try {
      await connectMongo();
      isConnected = true;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      isConnected = false;
      throw error;
    }
  }
}

// Vercel serverless handler
export default async (req, res) => {
  try {
    // Log request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path || req.url}`);

    // Connect to MongoDB on first request
    await initializeDB();

    // Handle the request with Express app
    // Express apps can be called as middleware
    app(req, res);
  } catch (error) {
    console.error("API Error:", error);
    console.error("Error stack:", error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  }
};
