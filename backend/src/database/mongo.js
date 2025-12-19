import mongoose from "mongoose";

export async function connectMongo() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is not set. Define it in environment variables (e.g., Vercel Settings or backend/.env)."
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      // Modern driver options
      serverSelectionTimeoutMS: 30000,
      // For standard connection strings (mongodb://host1,host2,...)
      tls: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    console.error(
      "If you see ETIMEOUT on DNS TXT lookups, switch to a standard (non-SRV) connection string from Atlas or change your DNS to 8.8.8.8/1.1.1.1."
    );
    throw err;
  }
}

export default connectMongo;
