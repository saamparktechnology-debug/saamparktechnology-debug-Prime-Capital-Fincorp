// src/models/kycModel.js
const pool = require("../config/db");

const KYCModel = {
  async updateKycStatus(customerId, status, rejectionReason = null) {
    const query = `
            UPDATE customers 
            SET kyc_status = ?, kyc_rejection_reason = ? 
            WHERE customer_id = ?
        `;
    const [result] = await pool.query(query, [
      status,
      rejectionReason,
      customerId,
    ]);
    return result.affectedRows > 0;
  },

  async getKycDetails(customerId, role, agentId) {
    let query = `
            SELECT customer_id, first_name, last_name, national_id_number, tax_id_number, 
                   kyc_status, kyc_rejection_reason, agent_id 
            FROM customers 
            WHERE customer_id = ?
        `;
    let params = [customerId];

    if (role === "agent") {
      query += " AND agent_id = ?";
      params.push(agentId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  },

  async findById(documentId) {
    const [rows] = await pool.query(
      "SELECT * FROM documents WHERE document_id = ?",
      [documentId],
    );
    return rows[0] || null;
  },

  async delete(documentId) {
    const [result] = await pool.query(
      "DELETE FROM documents WHERE document_id = ?",
      [documentId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = KYCModel;
