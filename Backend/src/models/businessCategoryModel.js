// src/models/businessCategoryModel.js
const pool = require("../config/db");

const BusinessCategoryModel = {
  async list(activeOnly = false) {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    const [rows] = await pool.query(
      `SELECT * FROM business_categories ${where} ORDER BY display_order ASC, category_name ASC`,
    );
    return rows;
  },

  async getById(categoryId) {
    const [rows] = await pool.query(
      "SELECT * FROM business_categories WHERE category_id = ?",
      [categoryId],
    );
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO business_categories 
        (category_name, description, is_active, display_order)
       VALUES (?, ?, ?, ?)`,
      [
        data.category_name,
        data.description || null,
        data.is_active !== undefined ? data.is_active : 1,
        data.display_order || 0,
      ],
    );
    return result.insertId;
  },

  async update(categoryId, data) {
    const allowed = [
      "category_name",
      "description",
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

    values.push(categoryId);
    const [result] = await pool.query(
      `UPDATE business_categories SET ${updates.join(", ")} WHERE category_id = ?`,
      values,
    );
    return result.affectedRows > 0;
  },

  async delete(categoryId) {
    const [result] = await pool.query(
      "DELETE FROM business_categories WHERE category_id = ?",
      [categoryId],
    );
    return result.affectedRows > 0;
  },
};

module.exports = BusinessCategoryModel;
