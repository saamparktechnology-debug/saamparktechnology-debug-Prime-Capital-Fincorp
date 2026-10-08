// src/controllers/customerController.js
const CustomerModel = require("../models/customerModel");
const audit = require("../utils/auditLog");

const createCustomer = async (req, res) => {
  try {
    let assignedAgentId;
    if (req.user.role === "agent") {
      assignedAgentId = req.user.id;
    } else if (req.user.role === "admin") {
      assignedAgentId = req.body.agent_id;
      if (!assignedAgentId) {
        return res.status(400).json({
          status: "fail",
          message: "Admin must specify an agent_id for customer creation.",
        });
      }
    }

    if (
      !req.body.first_name ||
      !req.body.last_name ||
      !req.body.primary_phone ||
      !req.body.national_id_number ||
      !req.body.tax_id_number
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Missing mandatory identification or contact fields.",
      });
    }

    const existing = await CustomerModel.findByPhoneOrNationalId(
      req.body.primary_phone,
      req.body.national_id_number,
    );
    if (existing.length > 0) {
      return res.status(400).json({
        status: "fail",
        message:
          "Customer with this phone number or National ID already exists.",
      });
    }

    const customerId = await CustomerModel.create(req.body, assignedAgentId);

    // ---- Audit ----
    audit(req, "create", "customer", customerId, null, {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      primary_phone: req.body.primary_phone,
      agent_id: assignedAgentId,
    });

    return res.status(201).json({
      status: "success",
      message: "Customer profile registered successfully with pending KYC.",
      data: { customer_id: customerId, agent_id: assignedAgentId },
    });
  } catch (error) {
    console.error("Create Customer Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while registering customer.",
    });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await CustomerModel.findAll(req.user.role, req.user.id);
    return res.status(200).json({
      status: "success",
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Get Customers Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while fetching customers.",
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await CustomerModel.findById(
      req.params.id,
      req.user.role,
      req.user.id,
    );
    if (!customer) {
      return res.status(404).json({
        status: "fail",
        message: "Customer not found or unauthorized access.",
      });
    }
    return res.status(200).json({ status: "success", data: customer });
  } catch (error) {
    console.error("Get Customer By ID Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
};
