// src/models/auditModel.js
const pool = require("../config/db");

const AuditModel = {
  async logAction(
    actorType,
    actorId,
    action,
    targetEntity,
    targetId,
    oldValue = null,
    newValue = null,
    ipAddress = null,
  ) {
    try {
      const query = `
        INSERT INTO audit_logs
          (actor_type, actor_id, action, target_entity, target_id, old_value, new_value, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.query(query, [
        actorType,
        actorId,
        action,
        targetEntity,
        targetId ?? 0,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress || null,
      ]);
    } catch (error) {
      console.error("[AUDIT] Log Error:", error.message);
    }
  },

  async getLogs(role, actorId) {
    // LEFT JOIN both agents and admins by actor_id, picking whichever matches.
    // Using CASE to select the correct name based on actor_type.
    let query = `
      SELECT 
        al.*,
        CASE
          WHEN al.actor_type = 'admin' THEN a.full_name
          WHEN al.actor_type = 'agent' THEN ag.full_name
          ELSE 'System'
        END AS actor_name,
        CASE
          WHEN al.actor_type = 'admin' THEN a.email
          WHEN al.actor_type = 'agent' THEN ag.email
          ELSE NULL
        END AS actor_email
      FROM audit_logs al
      LEFT JOIN admins a 
        ON al.actor_type = 'admin' AND al.actor_id = a.admin_id
      LEFT JOIN agents ag 
        ON al.actor_type = 'agent' AND al.actor_id = ag.agent_id
    `;
    const params = [];

    if (role === "agent") {
      query += " WHERE al.actor_type = 'agent' AND al.actor_id = ?";
      params.push(actorId);
    }

    query += " ORDER BY al.audit_id DESC LIMIT 500";

    const [logs] = await pool.query(query, params);
    return logs;
  },
};

module.exports = AuditModel;
