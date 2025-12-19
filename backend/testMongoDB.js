import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://MyNotesDB:jpKcFRgzfmfoStS8@mynoteswebapp.m8ivge8.mongodb.net/?appName=MyNotesWebApp";

console.log("🔍 Testing MongoDB Connection...");
console.log("URI:", MONGO_URI.replace(/:[^:]*@/, ":****@")); // Hide password

async function testConnection() {
  try {
    console.log("\n⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected successfully!");

    // Check connection state
    console.log(`\n📊 Connection Details:`);
    console.log(`   - State: ${mongoose.connection.readyState === 1 ? "Connected" : "Not connected"}`);
    console.log(`   - Host: ${mongoose.connection.host}`);
    console.log(`   - Database: ${mongoose.connection.name}`);

    // Test write operation
    console.log("\n📝 Testing write operation...");
    const testCollection = mongoose.connection.collection("connection_test");
    const result = await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log("✅ Write successful! Inserted ID:", result.insertedId);

    // Test read operation
    console.log("\n📖 Testing read operation...");
    const found = await testCollection.findOne({ _id: result.insertedId });
    console.log("✅ Read successful!", found);

    // Clean up
    console.log("\n🧹 Cleaning up test document...");
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log("✅ Cleanup successful!");

    console.log("\n✨ All tests passed! MongoDB Atlas connection is working correctly.");
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);
    console.error("\n🔧 Troubleshooting steps:");
    console.error("1. Check MongoDB Atlas Network Access:");
    console.error("   - Go to https://account.mongodb.com/");
    console.error("   - Select your project and cluster");
    console.error("   - Go to Network Access > IP Whitelist");
    console.error("   - Add 0.0.0.0/0 to allow all IPs (for development)");
    console.error("\n2. Verify database user credentials:");
    console.error("   - Username: MyNotesDB");
    console.error("   - Check if the password matches in MongoDB Atlas");
    console.error("\n3. Check cluster is running:");
    console.error("   - Go to Clusters and verify status");
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("\n🔌 Connection closed.");
    }
    process.exit(0);
  }
}

testConnection();
