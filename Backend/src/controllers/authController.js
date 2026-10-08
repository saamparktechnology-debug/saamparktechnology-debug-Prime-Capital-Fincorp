// src/controllers/authController.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const NotificationService = require("../services/notificationService");
const audit = require("../utils/auditLog");

const generateResetCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Login with email + password — issues JWT directly (no OTP).
 */
const login = async (req, res) => {
  const { email, password, role } = req.body;
  console.log(`[LOGIN] Email: ${email}, Role: ${role}`);

  if (!email || !password || !role) {
    return res.status(400).json({
      status: "fail",
      message: "Email, password, and role are required.",
    });
  }

  try {
    const table = role === "admin" ? "admins" : "agents";
    const idField = role === "admin" ? "admin_id" : "agent_id";

    const query =
      role === "admin"
        ? `SELECT * FROM admins WHERE email = ?`
        : `SELECT * FROM agents WHERE email = ? AND is_active = TRUE`;

    const [rows] = await pool.query(query, [email]);

    if (rows.length === 0) {
      audit(
        req,
        "login_failed",
        role,
        0,
        null,
        { email, reason: "user_not_found_or_inactive" },
        { actorType: "system", actorId: 0 },
      );
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials or inactive account.",
      });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      audit(
        req,
        "login_failed",
        role,
        user[idField],
        null,
        { email, reason: "wrong_password" },
        { actorType: role, actorId: user[idField] },
      );
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid credentials." });
    }

    // Issue JWT
    const tokenPayload = {
      id: user[idField],
      role,
      email,
      fullName: user.full_name,
    };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "8h" },
    );

    audit(
      req,
      "login",
      role,
      user[idField],
      null,
      { email, role, full_name: user.full_name },
      { actorType: role, actorId: user[idField] },
    );

    return res.status(200).json({
      status: "success",
      message: "Login successful.",
      data: {
        access_token: accessToken,
        user: tokenPayload,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error during login.",
    });
  }
};

/**
 * Step 1 of password reset — send code via email.
 */
const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res
      .status(400)
      .json({ status: "fail", message: "Email and role are required." });
  }

  try {
    const table = role === "admin" ? "admins" : "agents";
    const idField = role === "admin" ? "admin_id" : "agent_id";

    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE email = ?`, [
      email,
    ]);

    // Always respond with success to prevent email enumeration
    if (rows.length === 0) {
      audit(
        req,
        "password_reset_requested",
        role,
        0,
        null,
        { email, reason: "email_not_found" },
        { actorType: "system", actorId: 0 },
      );
      return res.status(200).json({
        status: "success",
        message:
          "If the email exists in our system, a reset code has been sent.",
      });
    }

    const user = rows[0];
    const code = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await pool.query(
      `UPDATE ${table} SET otp_code = ?, otp_expires_at = ? WHERE ${idField} = ?`,
      [code, expiresAt, user[idField]],
    );

    const emailSubject = "Password Reset Code — BSA Microfinance";
    const emailHtml = `
      <h3>Hello ${user.full_name},</h3>
      <p>You requested to reset your password. Use the code below:</p>
      <h1 style="color: #2563eb; letter-spacing: 4px; font-family: monospace;">${code}</h1>
      <p>This code is valid for 15 minutes. If you didn't request this, ignore this email.</p>
    `;

    await NotificationService.sendEmail(email, emailSubject, emailHtml);

    audit(
      req,
      "password_reset_requested",
      role,
      user[idField],
      null,
      { email },
      { actorType: role, actorId: user[idField] },
    );

    console.log(`[PASSWORD RESET] Code for ${email}: ${code}`);

    return res.status(200).json({
      status: "success",
      message: "Reset code sent to your email.",
      data: { email },
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

/**
 * Step 2 of password reset — verify code + update password.
 */
const resetPassword = async (req, res) => {
  const { email, role, code, new_password } = req.body;

  if (!email || !role || !code || !new_password) {
    return res.status(400).json({
      status: "fail",
      message: "Email, role, code, and new_password are required.",
    });
  }

  if (new_password.length < 6) {
    return res.status(400).json({
      status: "fail",
      message: "Password must be at least 6 characters.",
    });
  }

  try {
    const table = role === "admin" ? "admins" : "agents";
    const idField = role === "admin" ? "admin_id" : "agent_id";

    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE email = ?`, [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid reset request." });
    }

    const user = rows[0];

    if (!user.otp_code || user.otp_code !== code) {
      audit(
        req,
        "password_reset_failed",
        role,
        user[idField],
        null,
        { email, reason: "invalid_code" },
        { actorType: role, actorId: user[idField] },
      );
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid reset code." });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      audit(
        req,
        "password_reset_failed",
        role,
        user[idField],
        null,
        { email, reason: "expired_code" },
        { actorType: role, actorId: user[idField] },
      );
      return res
        .status(400)
        .json({ status: "fail", message: "Reset code has expired." });
    }

    const newHash = await bcrypt.hash(new_password, 10);

    await pool.query(
      `UPDATE ${table} 
       SET password_hash = ?, otp_code = NULL, otp_expires_at = NULL 
       WHERE ${idField} = ?`,
      [newHash, user[idField]],
    );

    audit(
      req,
      "password_reset",
      role,
      user[idField],
      null,
      { email },
      { actorType: role, actorId: user[idField] },
    );

    return res.status(200).json({
      status: "success",
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

/**
 * Change password (authenticated) — unchanged.
 */
const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({
      status: "fail",
      message: "Current and new password are required.",
    });
  }

  if (new_password.length < 6) {
    return res.status(400).json({
      status: "fail",
      message: "New password must be at least 6 characters.",
    });
  }

  try {
    const role = req.user.role;
    const table = role === "admin" ? "admins" : "agents";
    const idField = role === "admin" ? "admin_id" : "agent_id";

    const [rows] = await pool.query(
      `SELECT password_hash FROM ${table} WHERE ${idField} = ?`,
      [req.user.id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found." });
    }

    const valid = await bcrypt.compare(current_password, rows[0].password_hash);

    if (!valid) {
      audit(req, "password_change_failed", role, req.user.id, null, {
        reason: "wrong_current_password",
      });
      return res
        .status(401)
        .json({ status: "fail", message: "Current password is incorrect." });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query(
      `UPDATE ${table} SET password_hash = ? WHERE ${idField} = ?`,
      [newHash, req.user.id],
    );

    audit(req, "password_change", role, req.user.id, null, null);

    return res
      .status(200)
      .json({ status: "success", message: "Password changed successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};
