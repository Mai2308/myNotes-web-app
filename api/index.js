// api/index.js - Vercel serverless function wrapper
import dotenv from "dotenv";
import app from "../backend/app.js";
import connectMongo from "../backend/src/database/mongo.js";

dotenv.config();

// Connection cache
let isConnected = false;

// Vercel serverless handler
export default async (req, res) => {
  try {
    // Connect to MongoDB on first request
    if (!isConnected) {
      await connectMongo();
      isConnected = true;
    }

    // Handle the request with Express app
    app(req, res);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
};
