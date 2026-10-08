// src/routes/agentKycRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
  requireAgent,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const {
  getMyKyc,
  updateMyKyc,
  getAgentKyc,
  updateAgentKyc,
  reviewAgentKyc,
  uploadDocument,
  listDocuments,
  deleteDocument,
} = require("../controllers/agentKycController");

router.use(authenticateToken);

// ---------- Agent self-service ----------
router.get("/me", requireAgent, getMyKyc);
router.patch("/me", requireAgent, updateMyKyc);

// ---------- Admin ----------
router.get("/:agentId", requireAdmin, getAgentKyc);
router.patch("/:agentId", requireAdmin, updateAgentKyc);
router.patch("/:agentId/review", requireAdmin, reviewAgentKyc);
router.post(
  "/:agentId/documents",
  requireAdmin,
  upload.single("document"),
  uploadDocument,
);
router.delete("/:agentId/documents/:documentId", requireAdmin, deleteDocument);

// ---------- Both roles can list ----------
router.get("/:agentId/documents", listDocuments);

module.exports = router;
