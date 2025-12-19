#!/usr/bin/env node

const BASE = "http://localhost:5000";

async function testFeatures() {
  try {
    // First, register and login to get token
    const testEmail = `featuretest${Date.now()}@test.com`;
    console.log("🔐 Registering test user...");
    
    const regRes = await fetch(`${BASE}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Feature Tester",
        email: testEmail,
        password: "Test123!"
      })
    });
    
    const regData = await regRes.json();
    console.log("✅ Registration:", regRes.status, regData.message);
    
    // Login
    const loginRes = await fetch(`${BASE}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "Test123!" })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("✅ Login successful, token received\n");
    
    // Create a test note
    console.log("📝 Creating test note...");
    const noteRes = await fetch(`${BASE}/api/notes`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "Test Note for Features",
        content: "This is a test note with some content to highlight and create flashcards."
      })
    });
    
    const noteData = await noteRes.json();
    const noteId = noteData.note?._id;
    console.log("✅ Note created:", noteId, "\n");
    
    if (!noteId) {
      console.error("❌ Failed to create note");
      return;
    }
    
    // Test Highlights
    console.log("🎨 Testing Highlights Feature...");
    const highlightRes = await fetch(`${BASE}/api/notes/${noteId}/highlights`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        startOffset: 10,
        endOffset: 19,
        color: "yellow",
        selectedText: "test note",
        comment: "Important text"
      })
    });
    
    console.log("   Status:", highlightRes.status);
    const highlightData = await highlightRes.json();
    console.log("   Response:", JSON.stringify(highlightData, null, 2));
    
    if (highlightRes.ok) {
      console.log("✅ Highlight feature working!\n");
    } else {
      console.log("❌ Highlight feature failed\n");
    }
    
    // Get highlights
    const getHighlightsRes = await fetch(`${BASE}/api/notes/${noteId}/highlights`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const highlights = await getHighlightsRes.json();
    console.log("   Retrieved highlights:", highlights.length, "\n");
    
    // Test Flashcards
    console.log("🃏 Testing Flashcard Feature...");
    const flashcardRes = await fetch(`${BASE}/api/flashcards`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        front: "What is this test about?",
        back: "Testing flashcard and highlight features",
        noteId: noteId
      })
    });
    
    console.log("   Status:", flashcardRes.status);
    const flashcardData = await flashcardRes.json();
    console.log("   Response:", JSON.stringify(flashcardData, null, 2));
    
    if (flashcardRes.ok) {
      console.log("✅ Flashcard feature working!\n");
    } else {
      console.log("❌ Flashcard feature failed\n");
    }
    
    // Get flashcards
    const getFlashcardsRes = await fetch(`${BASE}/api/flashcards`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const flashcards = await getFlashcardsRes.json();
    console.log("   Retrieved flashcards:", flashcards.length);
    
    console.log("\n✨ Feature testing complete!");
    
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testFeatures();
