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
    // Connect to MongoDB on first request
    await initializeDB();

    // Handle the request with Express app
    return await new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  } catch (error) {
    console.error("API Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};
