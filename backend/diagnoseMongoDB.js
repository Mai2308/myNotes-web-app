#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://MyNotesDB:jpKcFRgzfmfoStS8@mynoteswebapp.m8ivge8.mongodb.net/?appName=MyNotesWebApp";

console.log("🔍 Diagnosing MongoDB Connection...\n");
console.log("URI (masked):", MONGO_URI.replace(/:[^:]*@/, ":****@"));

async function diagnose() {
  try {
    // Connect
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log("\n✅ Connected to MongoDB");
    console.log("📊 Connection Details:");
    console.log("   - Database Name:", mongoose.connection.db.databaseName);
    console.log("   - Host:", mongoose.connection.host);
    console.log("   - Port:", mongoose.connection.port);
    console.log("   - Ready State:", mongoose.connection.readyState);
    
    // List all collections
    console.log("\n📚 Collections in database:");
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => console.log("   -", col.name));
    
    // Check users collection specifically
    console.log("\n👥 Users Collection:");
    const usersCollection = mongoose.connection.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log("   - Total documents:", userCount);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}, { projection: { email: 1, name: 1, createdAt: 1 } }).limit(5).toArray();
      console.log("   - Sample users:");
      users.forEach(u => console.log("     •", u.email, "-", u.name));
    }
    
    // Test write operation
    console.log("\n✍️ Testing write operation...");
    const testDoc = {
      testField: "diagnostic",
      timestamp: new Date()
    };
    const insertResult = await usersCollection.insertOne(testDoc);
    console.log("   ✅ Write successful! ID:", insertResult.insertedId);
    
    // Verify it was saved
    const found = await usersCollection.findOne({ _id: insertResult.insertedId });
    if (found) {
      console.log("   ✅ Document persisted and readable");
    } else {
      console.log("   ❌ Document not found after insert!");
    }
    
    // Clean up test document
    await usersCollection.deleteOne({ _id: insertResult.insertedId });
    console.log("   ✅ Test document cleaned up");
    
    console.log("\n✨ Diagnosis complete!");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\n🔧 Possible issues:");
    console.error("1. Database name not specified in connection string");
    console.error("2. Network access / IP whitelist issues");
    console.error("3. Database user permissions");
    console.error("4. Atlas cluster is paused or deleted");
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

diagnose();
