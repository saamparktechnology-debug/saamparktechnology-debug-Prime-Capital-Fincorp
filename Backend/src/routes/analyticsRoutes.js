// src/routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const {
  getAgentDashboardAnalytics,
  getAdminAgentOverviewReport,
  getAdminAgentProfileSummary,
} = require("../controllers/analyticsController");
const {
  getKpis,
  getLoanFunnel,
  getCollectionsTrend,
  getCustomerTrend,
  getBankDistribution,
  getOverdueAging,
  getRecentActivity,
  getTopCustomers,
  getProductMix,
  getDisbursementTrend,
  getLoanTypeDistribution,
  getCustomersByCity,
  getCollectionEfficiency,
  getInterestTypeSplit,
  getAgentLeaderboard,
  getKycFunnel,
} = require("../controllers/businessAnalyticsController");

router.use(authenticateToken);

// ---------- Existing agent-centric ----------
router.get("/agent-dashboard", getAgentDashboardAnalytics);
router.get("/admin/agents-overview", requireAdmin, getAdminAgentOverviewReport);
router.get(
  "/admin/agents/:agentId/summary",
  requireAdmin,
  getAdminAgentProfileSummary,
);

// ---------- Business-wide ----------
router.get("/business/kpis", getKpis);
router.get("/business/funnel", getLoanFunnel);
router.get("/business/collections-trend", getCollectionsTrend);
router.get("/business/customer-trend", getCustomerTrend);
router.get("/business/bank-distribution", requireAdmin, getBankDistribution);
router.get("/business/overdue-aging", getOverdueAging);
router.get("/business/recent-activity", getRecentActivity);
router.get("/business/top-customers", getTopCustomers);

router.get("/business/product-mix", getProductMix);
router.get("/business/disbursement-trend", getDisbursementTrend);
router.get("/business/loan-type-dist", getLoanTypeDistribution);
router.get("/business/customers-by-city", getCustomersByCity);
router.get("/business/collection-efficiency", getCollectionEfficiency);
router.get("/business/interest-type-split", getInterestTypeSplit);
router.get("/business/agent-leaderboard", requireAdmin, getAgentLeaderboard);
router.get("/business/kyc-funnel", getKycFunnel);

module.exports = router;
