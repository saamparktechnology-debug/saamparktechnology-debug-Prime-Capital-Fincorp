// src/services/notificationService.js
const nodemailer = require("nodemailer");

const PORT = Number(process.env.EMAIL_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: PORT,
  secure: PORT === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection at startup (helpful for debugging)
transporter.verify((err, success) => {
  if (err) {
    console.error("[EMAIL] Transporter verify failed:", err.message);
  } else {
    console.log("[EMAIL] Transporter ready to send emails");
  }
});

const NotificationService = {
  async sendEmail(to, subject, htmlContent) {
    try {
      if (!to) return false;

      if (process.env.NODE_ENV === "development" && !process.env.EMAIL_USER) {
        console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
        return true;
      }

      const info = await transporter.sendMail({
        from: `"BSA Microfinance" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      });
      console.log("[EMAIL] Sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("[EMAIL] Send Error:", error.message);
      return false;
    }
  },

  async sendSMS(phoneNumber, message) {
    console.log(
      `[SMS GATEWAY SIMULATION] To: ${phoneNumber} | Message: ${message}`,
    );
    return true;
  },
};

module.exports = NotificationService;
