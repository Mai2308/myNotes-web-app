// Test script for reminder API
const BASE = "http://localhost:5000";

// Test user credentials (you need to have a user in the database)
const testEmail = "test@example.com";
const testPassword = "Test@123";

let testToken = "";
let testNoteId = "";

async function login() {
  console.log("🔐 Logging in...");
  const res = await fetch(`${BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("❌ Login failed:", data);
    return false;
  }

  testToken = data.token;
  console.log("✅ Login successful. Token:", testToken.substring(0, 20) + "...");
  return true;
}

async function createNote() {
  console.log("\n📝 Creating a test note...");
  
  // Create note with a deadline
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 2); // 2 hours from now
  
  const res = await fetch(`${BASE}/api/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testToken}`,
    },
    body: JSON.stringify({
      title: "Test Note with Reminder and Deadline",
      content: "This is a test note for reminder and deadline functionality",
      deadline: deadline.toISOString(),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("❌ Note creation failed:", data);
    return false;
  }

  testNoteId = data.note._id;
  console.log("✅ Note created. ID:", testNoteId);
  return true;
}

async function setReminder() {
  console.log("\n⏰ Setting a reminder...");
  const reminderDate = new Date();
  reminderDate.setMinutes(reminderDate.getMinutes() + 10); // 10 minutes from now

  const res = await fetch(`${BASE}/api/reminders/${testNoteId}/reminder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testToken}`,
    },
    body: JSON.stringify({
      reminderDate: reminderDate.toISOString(),
      isRecurring: false,
      notificationMethods: ["in-app"],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("❌ Set reminder failed:", data);
    return false;
  }

  console.log("✅ Reminder set successfully!");
  console.log("   Note:", {
    reminderDate: data.note.reminderDate,
    deadline: data.note.deadline,
    isRecurring: data.note.isRecurring,
    notificationMethods: data.note.notificationMethods,
    isOverdue: data.note.isOverdue,
  });
  return true;
}

async function getUpcomingReminders() {
  console.log("\n📋 Fetching upcoming reminders...");
  const res = await fetch(`${BASE}/api/reminders/upcoming`, {
    headers: {
      Authorization: `Bearer ${testToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("❌ Fetch reminders failed:", data);
    return false;
  }

  console.log(`✅ Found ${data.count} upcoming reminder(s)/deadline(s)`);
  data.reminders.forEach((note) => {
    const reminder = note.reminderDate ? `Reminder: ${new Date(note.reminderDate).toLocaleString()}` : '';
    const deadline = note.deadline ? `Deadline: ${new Date(note.deadline).toLocaleString()}` : '';
    const due = [reminder, deadline].filter(Boolean).join(', ');
    console.log(`   - ${note.title} (${due || 'No dates set'})`);
  });
  return true;
}

async function getNotifications() {
  console.log("\n🔔 Fetching notifications...");
  const res = await fetch(`${BASE}/api/notifications`, {
    headers: {
      Authorization: `Bearer ${testToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("❌ Fetch notifications failed:", data);
    return false;
  }

  console.log(`✅ Found ${data.count} notification(s)`);
  data.notifications.forEach((notif) => {
    console.log(`   - ${notif.title} (${notif.type})`);
  });
  return true;getOverdueNotes() {
  console.log("\n⚠️  Fetching overdue notes...");
  const res = await fetch(`${BASE}/api/reminders/overdue`, {
    headers: {
      Authorization: `Bearer ${testToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("❌ Fetch overdue notes failed:", data);
    return false;
  }

  console.log(`✅ Found ${data.count} overdue note(s)`);
  data.overdueNotes.forEach((note) => {
    const reminder = note.reminderDate ? `Reminder: ${new Date(note.reminderDate).toLocaleString()}` : '';
    const deadline = note.deadline ? `Deadline: ${new Date(note.deadline).toLocaleString()}` : '';
    const due = [reminder, deadline].filter(Boolean).join(', ');
    console.log(`   - ${note.title} (${due})`);
  });
  return true;
}

async function testReminders() {
  console.log("🚀 Starting Reminder/Deadline API Tests\n");
  console.log("================================================");

  if (!(await login())) return;
  if (!(await createNote())) return;
  if (!(await setReminder())) return;
  if (!(await getUpcomingReminders())) return;
  if (!(await getOverdueNotes())) return;
  if (!(await getNotifications())) return;

  console.log("\n================================================");
  console.log("✅ All tests completed successfully!");
  console.log("\n💡 Tip: Check the Dashboard UI to see the new deadline field and reminders panel

  console.log("\n================================================");
  console.log("✅ All tests completed successfully!");
}

testReminders().catch(console.error);
