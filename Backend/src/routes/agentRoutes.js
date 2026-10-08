// src/routes/agentRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const {
  createAgent,
  getAllAgents,
  getAgentById,
  getAgentPermissions,
  toggleAgentStatus,
  updateAgentPermissions,
} = require("../controllers/agentController");

// All agent management routes require Admin authentication
router.use(authenticateToken, requireAdmin);

router.post("/", createAgent);
router.get("/", getAllAgents);
router.get("/:id", getAgentById);
router.get("/:id/permissions", getAgentPermissions);
router.patch("/:id/status", toggleAgentStatus);
router.put("/:id/permissions", updateAgentPermissions);

module.exports = router;
