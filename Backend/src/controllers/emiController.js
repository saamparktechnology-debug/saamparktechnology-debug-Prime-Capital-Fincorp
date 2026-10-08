// src/controllers/emiController.js
const pool = require("../config/db");
const NotificationService = require("../services/notificationService");
const EMIModel = require("../models/emiModel");
const LoanModel = require("../models/loanModel");
const audit = require("../utils/auditLog");

/**
 * Get EMI schedules for a specific loan (Scoped by role)
 */
const getEMIsByLoan = async (req, res) => {
  const { loanId } = req.params;

  try {
    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ status: "fail", message: "Loan not found." });
    }

    if (req.user.role === "agent" && loan.agent_id !== req.user.id) {
      return res.status(403).json({
        status: "fail",
        message: "Unauthorized access to loan EMI records.",
      });
    }

    const emis = await EMIModel.findByLoanId(loanId);
    return res
      .status(200)
      .json({ status: "success", count: emis.length, data: emis });
  } catch (error) {
    console.error("Get EMIs Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while fetching EMI records.",
    });
  }
};

/**
 * Admin: Update EMI Record Status
 */
const updateEMIStatus = async (req, res) => {
  const { emiId } = req.params;
  const { status } = req.body;

  if (!["Pending", "Paid", "Overdue"].includes(status)) {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid EMI status value." });
  }

  try {
    // Fetch current status for old value
    const [rows] = await pool.query(
      "SELECT emi_id, loan_id, customer_id, status, emi_amount FROM repayment_emis WHERE emi_id = ?",
      [emiId],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "EMI record not found." });
    }
    const oldEmi = rows[0];

    const success = await EMIModel.updateStatus(emiId, status);
    if (!success) {
      return res
        .status(404)
        .json({ status: "fail", message: "EMI record not found." });
    }

    // ---- Audit ----
    audit(
      req,
      "update_status",
      "emi",
      Number(emiId),
      { status: oldEmi.status },
      { status },
    );

    return res.status(200).json({
      status: "success",
      message: `EMI status successfully updated to '${status}'.`,
    });
  } catch (error) {
    console.error("Update EMI Status Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

/**
 * Get upcoming pending EMIs (scoped by role)
 */
const getUpcomingEmis = async (req, res) => {
  try {
    let query = `
      SELECT e.emi_id, e.loan_id, e.emi_amount, e.due_date, e.status,
             c.customer_id, c.first_name, c.last_name, c.primary_phone, c.email_address,
             l.loan_type, l.agent_id
      FROM repayment_emis e
      JOIN customers c ON e.customer_id = c.customer_id
      JOIN loans l ON e.loan_id = l.loan_id
      WHERE e.status = 'Pending' AND e.due_date >= CURDATE()
    `;
    const params = [];

    if (req.user.role === "agent") {
      query += " AND l.agent_id = ?";
      params.push(req.user.id);
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    query += ` ORDER BY e.due_date ASC LIMIT ${limit}`;

    const [rows] = await pool.query(query, params);
    return res
      .status(200)
      .json({ status: "success", count: rows.length, data: rows });
  } catch (error) {
    console.error("Error fetching upcoming EMIs:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

/**
 * Manually send an EMI reminder
 */
const sendManualReminder = async (req, res) => {
  try {
    const { emiId } = req.params;

    const query = `
      SELECT e.emi_amount, e.due_date,
             c.first_name, c.last_name, c.primary_phone, c.email_address,
             l.agent_id
      FROM repayment_emis e
      JOIN customers c ON e.customer_id = c.customer_id
      JOIN loans l ON e.loan_id = l.loan_id
      WHERE e.emi_id = ?
    `;
    const [rows] = await pool.query(query, [emiId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "EMI record not found." });
    }

    const emi = rows[0];

    if (req.user.role === "agent" && emi.agent_id !== req.user.id) {
      return res.status(403).json({
        status: "fail",
        message: "Unauthorized to send reminder for this EMI.",
      });
    }

    const message = `Dear ${emi.first_name}, this is a reminder that your EMI of $${emi.emi_amount} is due on ${emi.due_date}. Please make your payment on time.`;

    let sentVia = [];
    if (emi.primary_phone) {
      await NotificationService.sendSMS(emi.primary_phone, message);
      sentVia.push("sms");
    }
    if (emi.email_address) {
      await NotificationService.sendEmail(
        emi.email_address,
        "EMI Payment Reminder",
        `<p>${message}</p>`,
      );
      sentVia.push("email");
    }

    // ---- Audit ----
    audit(req, "send_reminder", "emi", Number(emiId), null, {
      customer: `${emi.first_name} ${emi.last_name}`,
      channels: sentVia,
      amount: emi.emi_amount,
      due_date: emi.due_date,
    });

    return res.status(200).json({
      status: "success",
      message: `Reminder successfully sent to ${emi.first_name} (${emi.primary_phone || emi.email_address}).`,
    });
  } catch (error) {
    console.error("Manual Reminder Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to send reminder." });
  }
};

module.exports = {
  getEMIsByLoan,
  updateEMIStatus,
  getUpcomingEmis,
  sendManualReminder,
};
