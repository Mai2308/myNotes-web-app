#!/usr/bin/env node

const testEmail = `test${Date.now()}@test.com`;
const testData = {
  name: "Test User",
  email: testEmail,
  password: "Test123!"
};

async function testRegistration() {
  try {
    console.log("🧪 Testing Registration...");
    console.log("📤 Sending:", testData);
    
    const res = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData)
    });
    
    const data = await res.json();
    console.log("📥 Response Status:", res.status);
    console.log("📥 Response Data:", data);
    
    if (!res.ok) {
      console.error("❌ Registration failed");
      return;
    }
    
    console.log("✅ Registration successful!");
    console.log("👤 User ID:", data.user.id);
    
    // Now test login
    console.log("\n🧪 Testing Login...");
    const loginRes = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "Test123!" })
    });
    
    const loginData = await loginRes.json();
    console.log("📥 Login Response Status:", loginRes.status);
    console.log("📥 Login Response Data:", loginData);
    
    if (loginRes.ok) {
      console.log("✅ Login successful!");
      console.log("🔑 Token:", loginData.token ? "✅ Received" : "❌ Missing");
    } else {
      console.error("❌ Login failed");
    }
    
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testRegistration();
