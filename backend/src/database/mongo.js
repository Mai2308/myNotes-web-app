import mongoose from "mongoose";

export async function connectMongo() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is not set. Define it in environment variables (e.g., Vercel Settings or backend/.env)."
    );
  }

  try {
    // Enable TLS only for SRV URIs (mongodb+srv://); don't force it for local mongodb://
    const isSrv = mongoUri.startsWith("mongodb+srv://");
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      tls: isSrv ? true : undefined,
    });
    
    const { host, name } = mongoose.connection;
    console.log(`✅ Connected to MongoDB host="${host}" db="${name}"`);
    if (!isSrv) {
      console.log("ℹ️ Using standard connection string; TLS is disabled.");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err?.message || err);
    console.error(
      "Check MONGO_URI. For local dev, use mongodb://127.0.0.1:27017/myNotes. For Atlas, use mongodb+srv://..."
    );
    throw err;
  }
}

export default connectMongo;
