// src/models/dematModel.js
const pool = require("../config/db");

const DematModel = {
  // ---------- Banks ----------
  async listBanks(activeOnly = false) {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    const [rows] = await pool.query(
      `SELECT * FROM demat_banks ${where} ORDER BY display_order ASC, bank_name ASC`,
    );
    return rows;
  },

  async getBankById(bankId) {
    const [rows] = await pool.query(
      "SELECT * FROM demat_banks WHERE bank_id = ?",
      [bankId],
    );
    return rows[0] || null;
  },

  async createBank(data) {
    const [result] = await pool.query(
      `INSERT INTO demat_banks 
        (bank_name, short_code, logo_path, apply_link, tagline, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.bank_name,
        data.short_code || null,
        data.logo_path || null,
        data.apply_link,
        data.tagline || null,
        data.is_active !== undefined ? data.is_active : 1,
        data.display_order || 0,
      ],
    );
    return result.insertId;
  },

  async updateBank(bankId, data) {
    const allowed = [
      "bank_name",
      "short_code",
      "logo_path",
      "apply_link",
      "tagline",
      "is_active",
      "display_order",
    ];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(data[key] === "" ? null : data[key]);
      }
    }
    if (updates.length === 0) return false;

    values.push(bankId);
    const [result] = await pool.query(
      `UPDATE demat_banks SET ${updates.join(", ")} WHERE bank_id = ?`,
      values,
    );
    return result.affectedRows > 0;
  },

  async deleteBank(bankId) {
    const [result] = await pool.query(
      "DELETE FROM demat_banks WHERE bank_id = ?",
      [bankId],
    );
    return result.affectedRows > 0;
  },

  async updateBankLogo(bankId, logoPath) {
    await pool.query("UPDATE demat_banks SET logo_path = ? WHERE bank_id = ?", [
      logoPath,
      bankId,
    ]);
  },

  // ---------- Applications ----------
  async listApplications(role, agentId, filters = {}) {
    let query = `
      SELECT 
        a.*,
        b.bank_name,
        b.short_code AS bank_short_code,
        b.logo_path AS bank_logo_path,
        b.apply_link AS bank_apply_link,
        ag.full_name AS agent_name
      FROM demat_applications a
      JOIN demat_banks b ON a.bank_id = b.bank_id
      LEFT JOIN agents ag ON a.agent_id = ag.agent_id
      WHERE 1=1
    `;
    const params = [];

    if (role === "agent") {
      query += " AND a.agent_id = ?";
      params.push(agentId);
    } else if (filters.agent_id) {
      query += " AND a.agent_id = ?";
      params.push(filters.agent_id);
    }

    if (filters.status) {
      query += " AND a.status = ?";
      params.push(filters.status);
    }

    if (filters.bank_id) {
      query += " AND a.bank_id = ?";
      params.push(filters.bank_id);
    }

    if (filters.search) {
      query += " AND (a.full_name LIKE ? OR a.email LIKE ? OR a.phone LIKE ?)";
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    query += " ORDER BY a.created_at DESC LIMIT 500";

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getApplicationById(appId) {
    const [rows] = await pool.query(
      `SELECT 
        a.*,
        b.bank_name, b.short_code AS bank_short_code, b.logo_path AS bank_logo_path, b.apply_link AS bank_apply_link,
        ag.full_name AS agent_name
       FROM demat_applications a
       JOIN demat_banks b ON a.bank_id = b.bank_id
       LEFT JOIN agents ag ON a.agent_id = ag.agent_id
       WHERE a.application_id = ?`,
      [appId],
    );
    return rows[0] || null;
  },

  async createApplication(data) {
    const [result] = await pool.query(
      `INSERT INTO demat_applications 
      (bank_id, agent_id, full_name, email, phone, aadhaar_number, pan_number, pincode, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'initiated', ?)`,
      [
        data.bank_id,
        data.agent_id,
        data.full_name,
        data.email,
        data.phone,
        data.aadhaar_number || null,
        data.pan_number || null,
        data.pincode,
        data.notes || null,
      ],
    );
    return result.insertId;
  },

  async updateApplicationStatus(appId, status, notes = null) {
    const [result] = await pool.query(
      `UPDATE demat_applications SET status = ?, notes = COALESCE(?, notes) WHERE application_id = ?`,
      [status, notes, appId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = DematModel;
