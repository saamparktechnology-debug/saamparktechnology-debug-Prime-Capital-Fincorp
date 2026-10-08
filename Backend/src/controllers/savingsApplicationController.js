// src/controllers/savingsApplicationController.js
const SavingsModel = require("../models/savingsModel");
const audit = require("../utils/auditLog");

const listApplications = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      bank_id: req.query.bank_id ? Number(req.query.bank_id) : undefined,
      agent_id: req.query.agent_id ? Number(req.query.agent_id) : undefined,
      search: req.query.search,
    };

    const apps = await SavingsModel.listApplications(
      req.user.role,
      req.user.id,
      filters,
    );

    return res
      .status(200)
      .json({ status: "success", count: apps.length, data: apps });
  } catch (error) {
    console.error("List Savings Applications Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getApplication = async (req, res) => {
  try {
    const app = await SavingsModel.getApplicationById(req.params.id);
    if (!app) {
      return res
        .status(404)
        .json({ status: "fail", message: "Application not found." });
    }

    if (req.user.role === "agent" && app.agent_id !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized." });
    }

    return res.status(200).json({ status: "success", data: app });
  } catch (error) {
    console.error("Get Savings Application Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const createApplication = async (req, res) => {
  try {
    const {
      bank_id,
      agent_id,
      full_name,
      email,
      phone,
      aadhaar_number,
      pan_number,
      pincode,
      notes,
    } = req.body;

    if (
      !bank_id ||
      !full_name ||
      !email ||
      !phone ||
      !aadhaar_number ||
      !pan_number ||
      !pincode
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "bank_id, full_name, email, phone, aadhaar_number, pan_number, pincode are required.",
      });
    }

    if (!/^\d{4}\s?\d{4}\s?\d{4}$/.test(aadhaar_number)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid Aadhaar number." });
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan_number.toUpperCase())) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid PAN number." });
    }

    let assignedAgentId;
    if (req.user.role === "agent") {
      assignedAgentId = req.user.id;
    } else if (req.user.role === "admin") {
      if (!agent_id) {
        return res.status(400).json({
          status: "fail",
          message: "Admin must specify agent_id.",
        });
      }
      assignedAgentId = Number(agent_id);
    }

    const bank = await SavingsModel.getBankById(bank_id);
    if (!bank || !bank.is_active) {
      return res
        .status(400)
        .json({ status: "fail", message: "Bank not available." });
    }

    const appId = await SavingsModel.createApplication({
      bank_id: Number(bank_id),
      agent_id: assignedAgentId,
      full_name,
      email,
      phone,
      aadhaar_number: aadhaar_number.trim(),
      pan_number: pan_number.trim().toUpperCase(),
      pincode,
      notes,
    });

    audit(req, "create", "savings_application", appId, null, {
      bank_id: Number(bank_id),
      full_name,
      email,
      phone,
      aadhaar_number: aadhaar_number.trim(),
      pan_number: pan_number.trim().toUpperCase(),
    });

    const created = await SavingsModel.getApplicationById(appId);

    return res.status(201).json({
      status: "success",
      message: "Savings application recorded.",
      data: created,
    });
  } catch (error) {
    console.error("Create Savings Application Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!["initiated", "completed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid status." });
    }

    const app = await SavingsModel.getApplicationById(req.params.id);
    if (!app) {
      return res
        .status(404)
        .json({ status: "fail", message: "Application not found." });
    }

    if (req.user.role === "agent" && app.agent_id !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized." });
    }

    await SavingsModel.updateApplicationStatus(req.params.id, status, notes);

    audit(
      req,
      "update_status",
      "savings_application",
      Number(req.params.id),
      { status: app.status },
      { status, notes },
    );

    return res
      .status(200)
      .json({ status: "success", message: "Status updated." });
  } catch (error) {
    console.error("Update Savings Status Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  listApplications,
  getApplication,
  createApplication,
  updateStatus,
};
