// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 */
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticateToken, changePassword);

module.exports = router;
