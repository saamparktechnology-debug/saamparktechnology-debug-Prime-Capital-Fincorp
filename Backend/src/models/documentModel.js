// src/models/documentModel.js
const pool = require("../config/db");

const DocumentModel = {
  async create(docData) {
    const query = `
      INSERT INTO documents (customer_id, document_type, file_name, file_path, file_size, mime_type, uploaded_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      docData.customer_id,
      docData.document_type,
      docData.file_name,
      docData.file_path,
      docData.file_size,
      docData.mime_type,
      docData.uploaded_by_role,
    ];
    const [result] = await pool.query(query, values);
    return result.insertId;
  },

  async findById(documentId) {
    const [rows] = await pool.query(
      "SELECT * FROM documents WHERE document_id = ?",
      [documentId],
    );
    return rows[0] || null;
  },

  async findByCustomerId(customerId) {
    const [rows] = await pool.query(
      "SELECT * FROM documents WHERE customer_id = ?",
      [customerId],
    );
    return rows;
  },

  async findByCustomerIdScoped(customerId, role, agentId) {
    // If agent, verify ownership via customers table join
    if (role === "agent") {
      const [rows] = await pool.query(
        `SELECT d.* FROM documents d
         JOIN customers c ON d.customer_id = c.customer_id
         WHERE d.customer_id = ? AND c.agent_id = ?`,
        [customerId, agentId],
      );
      return rows;
    }

    // Admin sees all documents for the customer
    const [rows] = await pool.query(
      "SELECT * FROM documents WHERE customer_id = ?",
      [customerId],
    );
    return rows;
  },

  async delete(documentId) {
    const [result] = await pool.query(
      "DELETE FROM documents WHERE document_id = ?",
      [documentId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = DocumentModel;
