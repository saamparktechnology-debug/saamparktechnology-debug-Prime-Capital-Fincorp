// src/models/agentModel.js
const pool = require("../config/db");

const AgentModel = {
  async findById(agentId) {
    const [rows] = await pool.query(
      "SELECT agent_id, email, full_name, phone_number, is_active, created_at, updated_at FROM agents WHERE agent_id = ?",
      [agentId],
    );
    return rows[0] || null;
  },

  async getPermissions(agentId) {
    const [rows] = await pool.query(
      `SELECT module_name, can_create, can_read, can_update, can_delete
       FROM agent_permissions
       WHERE agent_id = ?
       ORDER BY module_name ASC`,
      [agentId],
    );
    return rows.map((r) => ({
      module_name: r.module_name,
      can_create: Boolean(r.can_create),
      can_read: Boolean(r.can_read),
      can_update: Boolean(r.can_update),
      can_delete: Boolean(r.can_delete),
    }));
  },
};

module.exports = AgentModel;
