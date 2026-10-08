// src/routes/auditRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const { getAuditLogs } = require("../controllers/auditController");

router.use(authenticateToken);
router.get("/", requireAdmin, getAuditLogs); // Admin accesses full system audit trails

module.exports = router;
