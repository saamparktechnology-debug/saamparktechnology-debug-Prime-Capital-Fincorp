// src/controllers/creditCardController.js
const CreditCardModel = require("../models/creditCardModel");
const audit = require("../utils/auditLog");

// ---------- List ----------
const listApplications = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      card_type: req.query.card_type,
      bank_id: req.query.bank_id ? Number(req.query.bank_id) : undefined,
      agent_id: req.query.agent_id ? Number(req.query.agent_id) : undefined,
      search: req.query.search,
    };

    const apps = await CreditCardModel.listApplications(
      req.user.role,
      req.user.id,
      filters,
    );

    return res
      .status(200)
      .json({ status: "success", count: apps.length, data: apps });
  } catch (error) {
    console.error("List Credit Card Applications Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getApplication = async (req, res) => {
  try {
    const app = await CreditCardModel.getApplicationById(req.params.id);
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
    console.error("Get Credit Card Application Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const createApplication = async (req, res) => {
  try {
    const {
      card_type,
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

    if (!["fd", "normal"].includes(card_type)) {
      return res.status(400).json({
        status: "fail",
        message: "card_type must be 'fd' or 'normal'.",
      });
    }

    // Bank required
    if (!bank_id) {
      return res.status(400).json({
        status: "fail",
        message: "bank_id is required.",
      });
    }

    if (
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
          "full_name, email, phone, aadhaar_number, pan_number, pincode are required.",
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

    let assignedAgentId = null;
    let appliedFromOffice = false;

    if (req.user.role === "agent") {
      assignedAgentId = req.user.id;
      appliedFromOffice = false;
    } else if (req.user.role === "admin") {
      if (agent_id) {
        assignedAgentId = Number(agent_id);
        appliedFromOffice = false;
      } else {
        assignedAgentId = null;
        appliedFromOffice = true;
      }
    }

    const appId = await CreditCardModel.createApplication({
      card_type,
      bank_id: Number(bank_id),
      agent_id: assignedAgentId,
      applied_from_office: appliedFromOffice,
      full_name,
      email,
      phone,
      aadhaar_number: aadhaar_number.trim(),
      pan_number: pan_number.trim().toUpperCase(),
      pincode,
      notes,
    });

    audit(req, "create", "credit_card_application", appId, null, {
      card_type,
      bank_id: Number(bank_id),
      agent_id: assignedAgentId,
      applied_from_office: appliedFromOffice,
      full_name,
      email,
      phone,
    });

    const created = await CreditCardModel.getApplicationById(appId);

    return res.status(201).json({
      status: "success",
      message: "Credit card application recorded.",
      data: created,
    });
  } catch (error) {
    console.error("Create Credit Card Application Error:", error);
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

    const app = await CreditCardModel.getApplicationById(req.params.id);
    if (!app) {
      return res
        .status(404)
        .json({ status: "fail", message: "Application not found." });
    }

    if (req.user.role === "agent" && app.agent_id !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized." });
    }

    await CreditCardModel.updateApplicationStatus(req.params.id, status, notes);

    audit(
      req,
      "update_status",
      "credit_card_application",
      Number(req.params.id),
      { status: app.status },
      { status, notes },
    );

    return res
      .status(200)
      .json({ status: "success", message: "Status updated." });
  } catch (error) {
    console.error("Update Credit Card Status Error:", error);
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
