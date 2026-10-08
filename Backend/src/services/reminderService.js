// src/services/reminderService.js
const pool = require("../config/db");
const NotificationService = require("./notificationService");

const ReminderService = {
  async checkAndSendEmiReminders() {
    try {
      // Calculate date exactly 7 days from today
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      const targetDateString = targetDate.toISOString().split("T")[0];

      // Query pending EMIs due on target date with customer contact details
      const query = `
                SELECT e.emi_id, e.emi_amount, e.due_date, 
                       c.first_name, c.last_name, c.primary_phone, c.email_address
                FROM repayment_emis e
                JOIN customers c ON e.customer_id = c.customer_id
                WHERE e.due_date = ? AND e.status = 'Pending'
            `;

      const [upcomingEmis] = await pool.query(query, [targetDateString]);

      console.log(
        `[REMINDER SERVICE] Found ${upcomingEmis.length} EMIs due on ${targetDateString}. Sending reminders...`,
      );

      for (const emi of upcomingEmis) {
        const message = `Dear ${emi.first_name}, your EMI of $${emi.emi_amount} is due in 7 days on ${emi.due_date}. Please ensure timely payment.`;

        // Send SMS
        if (emi.primary_phone) {
          await NotificationService.sendSMS(emi.primary_phone, message);
        }

        // Send Email
        if (emi.email_address) {
          await NotificationService.sendEmail(
            emi.email_address,
            "Upcoming EMI Payment Reminder",
            `<p>${message}</p>`,
          );
        }
      }
    } catch (error) {
      console.error("EMI Reminder Job Error:", error);
    }
  },
};

module.exports = ReminderService;
