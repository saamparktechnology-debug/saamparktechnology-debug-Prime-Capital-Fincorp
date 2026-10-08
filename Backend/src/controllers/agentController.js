// src/controllers/agentController.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const AgentModel = require("../models/agentModel");
const audit = require("../utils/auditLog");

/**
 * Admin: Create a new Agent
 */
const createAgent = async (req, res) => {
  const { email, password, full_name, phone_number } = req.body;

  if (!email || !password || !full_name || !phone_number) {
    return res
      .status(400)
      .json({ status: "fail", message: "All agent fields are required." });
  }

  try {
    const [existing] = await pool.query(
      "SELECT agent_id FROM agents WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: "An agent with this email already exists.",
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      "INSERT INTO agents (email, password_hash, full_name, phone_number, is_active) VALUES (?, ?, ?, ?, TRUE)",
      [email, passwordHash, full_name, phone_number],
    );

    const agentId = result.insertId;

    const defaultModules = ["customers", "kyc", "loans", "reports"];
    for (const mod of defaultModules) {
      await pool.query(
        "INSERT INTO agent_permissions (agent_id, module_name, can_create, can_read, can_update, can_delete) VALUES (?, ?, ?, ?, ?, ?)",
        [agentId, mod, true, true, true, false],
      );
    }

    // ---- Audit ----
    audit(req, "create", "agent", agentId, null, {
      email,
      full_name,
      phone_number,
    });

    return res.status(201).json({
      status: "success",
      message: "Agent created successfully with default permissions.",
      data: { agent_id: agentId, email, full_name, phone_number },
    });
  } catch (error) {
    console.error("Create Agent Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while creating agent.",
    });
  }
};

/**
 * Admin: Get all Agents
 */
const getAllAgents = async (req, res) => {
  try {
    const [agents] = await pool.query(
      "SELECT agent_id, email, full_name, phone_number, is_active, created_at, updated_at FROM agents ORDER BY created_at DESC",
    );
    return res
      .status(200)
      .json({ status: "success", count: agents.length, data: agents });
  } catch (error) {
    console.error("Get Agents Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while fetching agents.",
    });
  }
};

/**
 * Admin: Get a single Agent by ID
 */
const getAgentById = async (req, res) => {
  const { id } = req.params;
  try {
    const agent = await AgentModel.findById(id);
    if (!agent) {
      return res
        .status(404)
        .json({ status: "fail", message: "Agent not found." });
    }
    return res.status(200).json({ status: "success", data: agent });
  } catch (error) {
    console.error("Get Agent By ID Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

/**
 * Admin: Get agent's permission matrix
 */
const getAgentPermissions = async (req, res) => {
  const { id } = req.params;
  try {
    const agent = await AgentModel.findById(id);
    if (!agent) {
      return res
        .status(404)
        .json({ status: "fail", message: "Agent not found." });
    }

    const permissions = await AgentModel.getPermissions(id);
    return res.status(200).json({
      status: "success",
      count: permissions.length,
      data: permissions,
    });
  } catch (error) {
    console.error("Get Agent Permissions Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

/**
 * Admin: Enable or Disable an Agent
 */
const toggleAgentStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    return res.status(400).json({
      status: "fail",
      message: "is_active boolean status is required.",
    });
  }

  try {
    const [existing] = await pool.query(
      "SELECT is_active FROM agents WHERE agent_id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "Agent not found." });
    }

    const [result] = await pool.query(
      "UPDATE agents SET is_active = ? WHERE agent_id = ?",
      [is_active, id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "Agent not found." });
    }

    // ---- Audit ----
    audit(
      req,
      "update",
      "agent",
      Number(id),
      { is_active: existing[0].is_active },
      { is_active },
    );

    return res.status(200).json({
      status: "success",
      message: `Agent status successfully updated to ${is_active ? "Active" : "Disabled"}.`,
    });
  } catch (error) {
    console.error("Toggle Agent Status Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

/**
 * Admin: Update Agent Permissions Matrix
 */
const updateAgentPermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  if (!Array.isArray(permissions)) {
    return res.status(400).json({
      status: "fail",
      message: "Permissions payload must be an array.",
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Capture old permissions before overwrite
    const [oldPerms] = await pool.query(
      "SELECT module_name, can_create, can_read, can_update, can_delete FROM agent_permissions WHERE agent_id = ?",
      [id],
    );

    for (const perm of permissions) {
      const { module_name, can_create, can_read, can_update, can_delete } =
        perm;
      await connection.query(
        `INSERT INTO agent_permissions (agent_id, module_name, can_create, can_read, can_update, can_delete)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         can_create = VALUES(can_create),
         can_read = VALUES(can_read),
         can_update = VALUES(can_update),
         can_delete = VALUES(can_delete)`,
        [id, module_name, !!can_create, !!can_read, !!can_update, !!can_delete],
      );
    }

    await connection.commit();
    connection.release();

    // ---- Audit ----
    audit(
      req,
      "update",
      "agent_permissions",
      Number(id),
      { permissions: oldPerms },
      { permissions },
    );

    return res.status(200).json({
      status: "success",
      message: "Agent permissions updated successfully.",
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Update Permissions Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error updating permissions.",
    });
  }
};

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  getAgentPermissions,
  toggleAgentStatus,
  updateAgentPermissions,
};
