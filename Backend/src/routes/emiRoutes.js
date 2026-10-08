// src/routes/emiRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const {
  getEMIsByLoan,
  updateEMIStatus,
  getUpcomingEmis,
  sendManualReminder,
} = require("../controllers/emiController");

router.use(authenticateToken);

router.get("/loan/:loanId", getEMIsByLoan);
router.patch("/:emiId/status", requireAdmin, updateEMIStatus);
router.get("/upcoming", authenticateToken, getUpcomingEmis);
router.post("/:emiId/send-reminder", authenticateToken, sendManualReminder);
module.exports = router;
