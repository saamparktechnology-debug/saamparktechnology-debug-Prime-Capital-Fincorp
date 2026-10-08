// src/models/agentKycModel.js
const pool = require("../config/db");

const AgentKycModel = {
  /**
   * Fetch a KYC row by agent_id
   */
  async findByAgentId(agentId) {
    const [rows] = await pool.query(
      "SELECT * FROM agent_kyc WHERE agent_id = ?",
      [agentId],
    );
    return rows[0] || null;
  },

  /**
   * Create a KYC row (auto-init when agent is created)
   */
  async create(agentId, defaults = {}) {
    // Format: PCF205 + agent_id padded to 3 digits (e.g., PCF205001, PCF205002)
    const code = `PCF205${String(agentId).padStart(3, "0")}`;
    const [result] = await pool.query(
      `INSERT INTO agent_kyc 
      (agent_id, agent_code, full_name, email, primary_phone, kyc_status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        agentId,
        code,
        defaults.full_name || null,
        defaults.email || null,
        defaults.primary_phone || null,
      ],
    );
    return result.insertId;
  },

  /**
   * Ensure a KYC row exists (idempotent)
   */
  async ensureExists(agentId, defaults = {}) {
    const existing = await this.findByAgentId(agentId);
    if (existing) return existing.kyc_id;
    return await this.create(agentId, defaults);
  },

  /**
   * Update KYC fields (dynamic — only provided keys)
   */
  async update(agentId, payload) {
    const allowed = [
      "agent_code",
      "issue_date",
      "valid_till",
      "full_name",
      "date_of_birth",
      "gender",
      "marital_status",
      "father_name",
      "mother_name",
      "primary_phone",
      "alternate_phone",
      "email",
      "current_address",
      "current_city",
      "current_state",
      "current_pincode",
      "same_as_current",
      "permanent_address",
      "permanent_city",
      "permanent_state",
      "permanent_pincode",
      "national_id_number",
      "pan_number",
      "voter_id_number",
      "bank_name",
      "branch_name",
      "account_holder_name",
      "account_number",
      "ifsc_code",
      "occupation_type",
      "employer_or_business_name",
      "work_experience_years",
      "monthly_income",
      "primary_income_source",
      "emergency_contact_name",
      "emergency_contact_relationship",
      "emergency_contact_phone",
      "nominee_full_name",
      "nominee_relationship",
      "nominee_phone",
      "nominee_dob",
    ];

    const updates = [];
    const values = [];

    for (const key of allowed) {
      if (payload[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(payload[key] === "" ? null : payload[key]);
      }
    }

    if (updates.length === 0) return false;

    values.push(agentId);
    const [result] = await pool.query(
      `UPDATE agent_kyc SET ${updates.join(", ")} WHERE agent_id = ?`,
      values,
    );
    return result.affectedRows > 0;
  },

  /**
   * Admin: approve/reject KYC
   */
  async review(
    agentId,
    status,
    rejectionReason,
    adminId,
    issueDate = null,
    validTill = null,
  ) {
    const [result] = await pool.query(
      `UPDATE agent_kyc 
     SET kyc_status = ?, 
         kyc_rejection_reason = ?, 
         reviewed_by = ?, 
         reviewed_at = NOW(),
         issue_date = COALESCE(?, issue_date),
         valid_till = COALESCE(?, valid_till)
     WHERE agent_id = ?`,
      [
        status,
        status === "rejected" ? rejectionReason : null,
        adminId,
        issueDate,
        validTill,
        agentId,
      ],
    );
    return result.affectedRows > 0;
  },

  /**
   * Documents
   */
  async addDocument(doc) {
    const [result] = await pool.query(
      `INSERT INTO agent_documents 
        (agent_id, document_type, file_name, file_path, file_size, mime_type, uploaded_by_role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        doc.agent_id,
        doc.document_type,
        doc.file_name,
        doc.file_path,
        doc.file_size,
        doc.mime_type,
        doc.uploaded_by_role,
      ],
    );
    return result.insertId;
  },

  async listDocuments(agentId) {
    const [rows] = await pool.query(
      "SELECT * FROM agent_documents WHERE agent_id = ? ORDER BY created_at DESC",
      [agentId],
    );
    return rows;
  },

  async findDocumentById(documentId) {
    const [rows] = await pool.query(
      "SELECT * FROM agent_documents WHERE document_id = ?",
      [documentId],
    );
    return rows[0] || null;
  },

  async deleteDocument(documentId) {
    const [result] = await pool.query(
      "DELETE FROM agent_documents WHERE document_id = ?",
      [documentId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = AgentKycModel;
