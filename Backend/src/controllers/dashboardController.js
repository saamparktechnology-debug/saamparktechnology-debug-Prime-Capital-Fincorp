// src/controllers/dashboardController.js
const DashboardModel = require("../models/dashboardModel");

/**
 * GET /analytics/dashboard/summary?range=this_month|today|this_fy|custom&start&end
 */
const getSummary = async (req, res) => {
  try {
    const { range = "this_month", start, end } = req.query;
    const data = await DashboardModel.getSummary(
      req.user.role,
      req.user.id,
      range,
      start,
      end,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getRecentLoans = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const data = await DashboardModel.getRecentLoans(limit);
    return res
      .status(200)
      .json({ status: "success", count: data.length, data });
  } catch (error) {
    console.error("Dashboard Recent Loans Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getBankBreakdown = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const data = await DashboardModel.getBankBreakdown(limit);
    return res
      .status(200)
      .json({ status: "success", count: data.length, data });
  } catch (error) {
    console.error("Dashboard Bank Breakdown Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getAgentPerformanceMini = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const data = await DashboardModel.getAgentPerformanceMini(limit);
    return res
      .status(200)
      .json({ status: "success", count: data.length, data });
  } catch (error) {
    console.error("Dashboard Agent Performance Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getCollectionsMonthly = async (req, res) => {
  try {
    const months = Math.min(Number(req.query.months) || 6, 24);
    const data = await DashboardModel.getCollectionsMonthly(months);
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Dashboard Collections Monthly Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getCustomerTrendMonthly = async (req, res) => {
  try {
    const months = Math.min(Number(req.query.months) || 6, 24);
    const data = await DashboardModel.getCustomerTrendMonthly(months);
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Dashboard Customer Trend Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  getSummary,
  getRecentLoans,
  getBankBreakdown,
  getAgentPerformanceMini,
  getCollectionsMonthly,
  getCustomerTrendMonthly,
};
