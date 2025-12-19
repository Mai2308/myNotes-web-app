import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create email transporter
const createTransporter = () => {
  // Configure with environment variables
  // nodemailer default export is the createTransport function in v6+
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
    },
  });
};

// Send reminder email
export const sendReminderEmail = async (userEmail, noteTitle, noteContent, reminderDate) => {
  try {
    const transporter = createTransporter();

    // Format the reminder date
    const formattedDate = new Date(reminderDate).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Email content
    const mailOptions = {
      from: `"MyNotes App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `⏰ Reminder: ${noteTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 10px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 10px 10px;
            }
            .note-title {
              font-size: 24px;
              font-weight: bold;
              color: #4CAF50;
              margin-bottom: 10px;
            }
            .note-content {
              background-color: #f5f5f5;
              padding: 15px;
              border-left: 4px solid #4CAF50;
              margin: 20px 0;
              border-radius: 5px;
            }
            .reminder-time {
              color: #666;
              font-style: italic;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Reminder Alert</h1>
            </div>
            <div class="content">
              <div class="note-title">${noteTitle}</div>
              <p class="reminder-time">📅 Scheduled for: ${formattedDate}</p>
              <div class="note-content">
                <p>${noteContent || "No additional details"}</p>
              </div>
              <p>This is a reminder for your note. Don't forget to take action!</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder from MyNotes App</p>
              <p>Please do not reply to this email</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reminder: ${noteTitle}
        
        Scheduled for: ${formattedDate}
        
        ${noteContent || "No additional details"}
        
        This is an automated reminder from MyNotes App.
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Send overdue notification email
export const sendOverdueEmail = async (userEmail, noteTitle, noteContent, originalDate) => {
  try {
    const transporter = createTransporter();

    const formattedDate = new Date(originalDate).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const mailOptions = {
      from: `"MyNotes App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🔴 Overdue: ${noteTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 10px;
            }
            .header {
              background-color: #f44336;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 10px 10px;
            }
            .note-title {
              font-size: 24px;
              font-weight: bold;
              color: #f44336;
              margin-bottom: 10px;
            }
            .note-content {
              background-color: #ffebee;
              padding: 15px;
              border-left: 4px solid #f44336;
              margin: 20px 0;
              border-radius: 5px;
            }
            .overdue-notice {
              color: #f44336;
              font-weight: bold;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔴 Overdue Notification</h1>
            </div>
            <div class="content">
              <div class="note-title">${noteTitle}</div>
              <p class="overdue-notice">⚠️ This reminder was due: ${formattedDate}</p>
              <div class="note-content">
                <p>${noteContent || "No additional details"}</p>
              </div>
              <p>This reminder is now overdue. Please take action as soon as possible!</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from MyNotes App</p>
              <p>Please do not reply to this email</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        OVERDUE: ${noteTitle}
        
        Was due: ${formattedDate}
        
        ${noteContent || "No additional details"}
        
        This reminder is now overdue. Please take action as soon as possible!
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Overdue email sent:", info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌ Error sending overdue email:", error);
    return { success: false, error: error.message };
  }
};
