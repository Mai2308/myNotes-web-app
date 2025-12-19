// api/index.js - Vercel serverless function wrapper
import dotenv from "dotenv";
import app from "../backend/app.js";
import connectMongo from "../backend/src/database/mongo.js";

dotenv.config();

// Connect to MongoDB once (cached across requests)
let isConnected = false;

const connectDB = async () => {
  if (!isConnected) {
    await connectMongo();
    isConnected = true;
  }
};

// Export the serverless function
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
