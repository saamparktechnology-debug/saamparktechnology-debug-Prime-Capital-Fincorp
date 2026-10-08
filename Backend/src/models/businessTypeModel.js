// src/models/businessTypeModel.js
const pool = require("../config/db");

const BusinessTypeModel = {
  async list(activeOnly = false) {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    const [rows] = await pool.query(
      `SELECT * FROM business_types ${where} ORDER BY display_order ASC, type_name ASC`,
    );
    return rows;
  },

  async getById(typeId) {
    const [rows] = await pool.query(
      "SELECT * FROM business_types WHERE type_id = ?",
      [typeId],
    );
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO business_types 
        (type_name, description, is_active, display_order)
       VALUES (?, ?, ?, ?)`,
      [
        data.type_name,
        data.description || null,
        data.is_active !== undefined ? data.is_active : 1,
        data.display_order || 0,
      ],
    );
    return result.insertId;
  },

  async update(typeId, data) {
    const allowed = ["type_name", "description", "is_active", "display_order"];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(data[key] === "" ? null : data[key]);
      }
    }
    if (updates.length === 0) return false;

    values.push(typeId);
    const [result] = await pool.query(
      `UPDATE business_types SET ${updates.join(", ")} WHERE type_id = ?`,
      values,
    );
    return result.affectedRows > 0;
  },

  async delete(typeId) {
    const [result] = await pool.query(
      "DELETE FROM business_types WHERE type_id = ?",
      [typeId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = BusinessTypeModel;
