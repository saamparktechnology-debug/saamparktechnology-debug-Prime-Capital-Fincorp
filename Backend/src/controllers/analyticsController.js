// src/controllers/analyticsController.js
const AnalyticsModel = require("../models/analyticsModel");

const getAgentDashboardAnalytics = async (req, res) => {
  try {
    // If agent, use their own ID. If admin, allow passing agentId in query or params if inspecting someone else.
    const targetAgentId =
      req.user.role === "agent" ? req.user.id : req.query.agent_id;

    if (!targetAgentId) {
      return res.status(400).json({
        status: "fail",
        message: "Agent ID is required for analytics.",
      });
    }

    const data = await AnalyticsModel.getAgentAnalytics(targetAgentId);
    return res
      .status(200)
      .json({ status: "success", data, count: Object.keys(data).length });
  } catch (error) {
    console.error("Agent Analytics Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while fetching analytics.",
    });
  }
};

const getAdminAgentOverviewReport = async (req, res) => {
  try {
    const data = await AnalyticsModel.getAdminAgentOverview();
    return res
      .status(200)
      .json({ status: "success", count: data.length, data });
  } catch (error) {
    console.error("Admin Agent Overview Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getAdminAgentProfileSummary = async (req, res) => {
  try {
    const { agentId } = req.params;
    const data = await AnalyticsModel.getAgentProfileSummary(agentId);
    if (!data) {
      return res
        .status(404)
        .json({ status: "fail", message: "Agent not found." });
    }
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Agent Profile Summary Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  getAgentDashboardAnalytics,
  getAdminAgentOverviewReport,
  getAdminAgentProfileSummary,
};
