// src/controllers/auditController.js
const AuditModel = require("../models/auditModel");

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditModel.getLogs(req.user.role, req.user.id);
    return res
      .status(200)
      .json({ status: "success", count: logs.length, data: logs });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while fetching audit logs.",
    });
  }
};

module.exports = { getAuditLogs };
