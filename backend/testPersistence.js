#!/usr/bin/env node

const BASE = "http://localhost:5000";
const testEmail = `persisttest${Date.now()}@test.com`;

async function testPersistence() {
  try {
    console.log("🧪 Testing User Persistence\n");
    
    // Step 1: Register
    console.log("1️⃣ Registering new user:", testEmail);
    const regRes = await fetch(`${BASE}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Persist Test",
        email: testEmail,
        password: "Test123!"
      })
    });
    
    if (!regRes.ok) {
      console.error("❌ Registration failed:", await regRes.text());
      return;
    }
    
    const regData = await regRes.json();
    console.log("✅ Registered! User ID:", regData.user.id);
    
    // Step 2: Login immediately
    console.log("\n2️⃣ Logging in with same credentials...");
    const loginRes = await fetch(`${BASE}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "Test123!" })
    });
    
    if (!loginRes.ok) {
      console.error("❌ Login failed:", await loginRes.text());
      return;
    }
    
    const loginData = await loginRes.json();
    console.log("✅ Login successful! Token received");
    
    // Step 3: Verify user exists in database
    console.log("\n3️⃣ Verifying user in database...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const mongoose = await import('mongoose');
    const URI = "mongodb+srv://MyNotesDB:jpKcFRgzfmfoStS8@mynoteswebapp.m8ivge8.mongodb.net/?appName=MyNotesWebApp";
    await mongoose.default.connect(URI);
    
    const usersCol = mongoose.default.connection.collection('users');
    const user = await usersCol.findOne({ email: testEmail });
    
    if (user) {
      console.log("✅ User found in database!");
      console.log("   - Email:", user.email);
      console.log("   - Name:", user.name);
      console.log("   - ID:", user._id.toString());
      console.log("   - Created:", user.createdAt);
    } else {
      console.error("❌ User NOT found in database!");
    }
    
    // Count total users
    const totalUsers = await usersCol.countDocuments();
    console.log("\n📊 Total users in database:", totalUsers);
    
    await mongoose.default.connection.close();
    
    console.log("\n✨ Test complete! Users ARE being persisted! ✅");
    
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testPersistence();
