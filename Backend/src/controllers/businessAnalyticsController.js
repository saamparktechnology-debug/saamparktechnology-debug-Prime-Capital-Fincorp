// src/controllers/businessAnalyticsController.js
const BusinessAnalyticsModel = require("../models/businessAnalyticsModel");

const resolveScope = (req) => {
  const role = req.user.role;
  let agentId = null;
  if (role === "agent") agentId = req.user.id;
  else if (role === "admin" && req.query.agent_id)
    agentId = Number(req.query.agent_id);
  return { role, agentId };
};

const getKpis = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const { range = "this_month", start, end } = req.query;
    const data = await BusinessAnalyticsModel.getKpis(
      role,
      agentId,
      range,
      start,
      end,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Business KPIs Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getLoanFunnel = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const data = await BusinessAnalyticsModel.getLoanFunnel(role, agentId);
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Loan Funnel Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getCollectionsTrend = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const months = Math.min(Number(req.query.months) || 6, 24);
    const data = await BusinessAnalyticsModel.getCollectionsTrend(
      role,
      agentId,
      months,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Collections Trend Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getCustomerTrend = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const months = Math.min(Number(req.query.months) || 6, 24);
    const data = await BusinessAnalyticsModel.getCustomerTrend(
      role,
      agentId,
      months,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Customer Trend Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getBankDistribution = async (req, res) => {
  try {
    const data = await BusinessAnalyticsModel.getBankDistribution();
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Bank Distribution Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getOverdueAging = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const data = await BusinessAnalyticsModel.getOverdueAging(role, agentId);
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Overdue Aging Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await BusinessAnalyticsModel.getRecentActivity(
      role,
      agentId,
      limit,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Recent Activity Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getTopCustomers = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await BusinessAnalyticsModel.getTopCustomers(
      role,
      agentId,
      limit,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Top Customers Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getProductMix = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const data = await BusinessAnalyticsModel.getProductMix(role, agentId);
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Product Mix Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getDisbursementTrend = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const months = Math.min(Number(req.query.months) || 6, 24);
    const data = await BusinessAnalyticsModel.getDisbursementTrend(
      role,
      agentId,
      months,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Disbursement Trend Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getLoanTypeDistribution = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const data = await BusinessAnalyticsModel.getLoanTypeDistribution(
      role,
      agentId,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Loan Type Distribution Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getCustomersByCity = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await BusinessAnalyticsModel.getCustomersByCity(
      role,
      agentId,
      limit,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Customers by City Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getCollectionEfficiency = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const data = await BusinessAnalyticsModel.getCollectionEfficiency(
      role,
      agentId,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Collection Efficiency Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getInterestTypeSplit = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const data = await BusinessAnalyticsModel.getInterestTypeSplit(
      role,
      agentId,
    );
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Interest Type Split Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getAgentLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await BusinessAnalyticsModel.getAgentLeaderboard(limit);
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Agent Leaderboard Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getKycFunnel = async (req, res) => {
  try {
    const { role, agentId } = resolveScope(req);
    const data = await BusinessAnalyticsModel.getKycFunnel(role, agentId);
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("KYC Funnel Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
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
};
