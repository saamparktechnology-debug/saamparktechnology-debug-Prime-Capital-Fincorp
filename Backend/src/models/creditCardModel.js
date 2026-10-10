// src/models/creditCardModel.js
const pool = require("../config/db");

const CreditCardModel = {
  // ---------- List ----------
  async listApplications(role, agentId, filters = {}) {
    let query = `
      SELECT 
        a.*,
        b.bank_name,
        b.short_code AS bank_short_code,
        b.logo_path AS bank_logo_path,
        b.apply_link AS bank_apply_link,
        b.tagline AS bank_tagline,
        b.target_audience AS bank_target_audience,
        b.documents_required AS bank_documents_required,
        ag.full_name AS agent_name,
        ag.email AS agent_email
      FROM credit_card_applications a
      LEFT JOIN credit_card_banks b ON a.bank_id = b.bank_id
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

    if (filters.card_type) {
      query += " AND a.card_type = ?";
      params.push(filters.card_type);
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

  // ---------- Get one ----------
  async getApplicationById(appId) {
    const [rows] = await pool.query(
      `SELECT 
        a.*,
        b.bank_name,
        b.short_code AS bank_short_code,
        b.logo_path AS bank_logo_path,
        b.apply_link AS bank_apply_link,
        b.tagline AS bank_tagline,
        b.target_audience AS bank_target_audience,
        b.documents_required AS bank_documents_required,
        ag.full_name AS agent_name,
        ag.email AS agent_email
       FROM credit_card_applications a
       LEFT JOIN credit_card_banks b ON a.bank_id = b.bank_id
       LEFT JOIN agents ag ON a.agent_id = ag.agent_id
       WHERE a.application_id = ?`,
      [appId],
    );
    return rows[0] || null;
  },

  // ---------- Create ----------
  async createApplication(data) {
    const [result] = await pool.query(
      `INSERT INTO credit_card_applications 
        (card_type, fd_amount, bank_id, agent_id, applied_from_office,
         full_name, email, phone,
         aadhaar_number, pan_number, pincode,
         status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'initiated', ?)`,
      [
        data.card_type,
        data.fd_amount || null,
        data.bank_id,
        data.agent_id || null,
        data.applied_from_office ? 1 : 0,
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

  // ---------- Update status ----------
  async updateApplicationStatus(appId, status, notes = null) {
    const [result] = await pool.query(
      `UPDATE credit_card_applications 
       SET status = ?, notes = COALESCE(?, notes) 
       WHERE application_id = ?`,
      [status, notes, appId],
    );
    return result.affectedRows > 0;
  },

  // ---------- Update FD document path ----------
  async updateDocumentPath(appId, docField, path) {
    const allowed = ["aadhaar_doc_path", "pan_doc_path"];
    if (!allowed.includes(docField)) return false;

    const [result] = await pool.query(
      `UPDATE credit_card_applications SET ${docField} = ? WHERE application_id = ?`,
      [path, appId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = CreditCardModel;
