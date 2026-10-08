// src/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  getSummary,
  getRecentLoans,
  getBankBreakdown,
  getAgentPerformanceMini,
  getCollectionsMonthly,
  getCustomerTrendMonthly,
} = require("../controllers/dashboardController");

router.use(authenticateToken);

router.get("/summary", getSummary);
router.get("/recent-loans", getRecentLoans);
router.get("/banks", getBankBreakdown);
router.get("/agent-performance", getAgentPerformanceMini);
router.get("/collections-monthly", getCollectionsMonthly);
router.get("/customer-trend", getCustomerTrendMonthly);

module.exports = router;
