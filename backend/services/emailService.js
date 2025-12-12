import nodemailer from "nodemailer";

/**
 * Initialize the email transporter
 */
let transporter = null;

export const initializeEmailService = () => {
  try {
    // Configure based on your email service provider
    // This example uses Gmail, but you can use any SMTP service
    const smtpConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Only initialize if credentials are provided
    if (smtpConfig.auth.user && smtpConfig.auth.pass) {
      transporter = nodemailer.createTransport(smtpConfig);
      console.log("✅ Email service initialized");
    } else {
      console.warn("⚠️  Email service not configured. Set SMTP_USER and SMTP_PASS in .env");
    }
  } catch (error) {
    console.error("❌ Error initializing email service:", error);
  }
};

/**
 * Send a reminder email
 */
export const sendReminderEmail = async (userEmail, reminderData, noteData) => {
  if (!transporter) {
    console.warn("⚠️  Email service not configured. Skipping email send.");
    return false;
  }

  try {
    const isOverdue = new Date(reminderData.dueDate) < new Date();
    const subject = isOverdue 
      ? `⏰ OVERDUE: "${noteData.title}"`
      : `📌 Reminder: "${noteData.title}"`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${isOverdue ? "#dc3545" : "#007bff"};">
          ${isOverdue ? "⏰ Overdue Reminder" : "📌 Note Reminder"}
        </h2>
        
        <p style="font-size: 16px; color: #333;">
          You have a reminder for your note:
        </p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid ${isOverdue ? "#dc3545" : "#007bff"}; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">${noteData.title}</h3>
          ${noteData.content ? `<p style="color: #666; margin: 10px 0;">${noteData.content.substring(0, 200)}${noteData.content.length > 200 ? "..." : ""}</p>` : ""}
          <p style="color: #999; font-size: 14px; margin-bottom: 0;">
            Due: ${new Date(reminderData.dueDate).toLocaleString()}
          </p>
        </div>

        ${reminderData.recurring?.enabled ? `
          <div style="background-color: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #0066cc; font-size: 14px;">
              🔄 This is a <strong>${reminderData.recurring.frequency}</strong> recurring reminder
            </p>
          </div>
        ` : ""}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
          <p style="color: #999; font-size: 12px;">
            You can manage your reminders in the Notes App dashboard.
          </p>
        </div>
      </div>
    `;

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    console.log(`✅ Reminder email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending reminder email:", error);
    return false;
  }
};

/**
 * Send a bulk reminder email (multiple notes)
 */
export const sendBulkReminderEmail = async (userEmail, reminders) => {
  if (!transporter || reminders.length === 0) {
    return false;
  }

  try {
    const remindersList = reminders
      .map(
        (r) => `
        <li style="margin-bottom: 15px;">
          <strong>${r.note.title}</strong> - Due: ${new Date(r.dueDate).toLocaleString()}
        </li>
      `
      )
      .join("");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">📌 Your Daily Reminders</h2>
        
        <p style="font-size: 16px; color: #333;">
          You have ${reminders.length} reminder${reminders.length > 1 ? "s" : ""} today:
        </p>
        
        <ul style="list-style-type: none; padding: 0;">
          ${remindersList}
        </ul>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
          <p style="color: #999; font-size: 12px;">
            Log in to your Notes App to manage these reminders.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: `📌 You have ${reminders.length} reminder${reminders.length > 1 ? "s" : ""}`,
      html: htmlContent,
    });

    console.log(`✅ Bulk reminder email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending bulk reminder email:", error);
    return false;
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfiguration = async () => {
  if (!transporter) {
    console.warn("⚠️  Email service not configured");
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ Email configuration verified");
    return true;
  } catch (error) {
    console.error("❌ Email verification failed:", error);
    return false;
  }
};
