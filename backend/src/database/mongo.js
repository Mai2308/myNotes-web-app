import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI || "mongodb+srv://MyNotesDB:jpKcFRgzfmfoStS8@mynoteswebapp.m8ivge8.mongodb.net/?appName=MyNotesWebApp"

export async function connectMongo() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

export default connectMongo;
