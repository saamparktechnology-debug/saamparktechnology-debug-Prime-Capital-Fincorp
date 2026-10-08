// src/models/bankModel.js
const pool = require("../config/db");

const BankModel = {
  async list() {
    const [rows] = await pool.query(
      "SELECT * FROM banks ORDER BY display_order ASC, bank_name ASC",
    );
    return rows;
  },

  async listActive() {
    const [rows] = await pool.query(
      "SELECT * FROM banks WHERE is_active = 1 ORDER BY display_order ASC, bank_name ASC",
    );
    return rows;
  },

  async getById(bankId) {
    const [rows] = await pool.query("SELECT * FROM banks WHERE bank_id = ?", [
      bankId,
    ]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO banks 
        (bank_name, short_code, tagline, logo_path, apply_link, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.bank_name,
        data.short_code || null,
        data.tagline || null,
        data.logo_path || null,
        data.apply_link || null,
        data.is_active !== undefined ? data.is_active : 1,
        data.display_order || 0,
      ],
    );
    return result.insertId;
  },

  async update(bankId, data) {
    const allowed = [
      "bank_name",
      "short_code",
      "tagline",
      "logo_path",
      "apply_link",
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
      `UPDATE banks SET ${updates.join(", ")} WHERE bank_id = ?`,
      values,
    );
    return result.affectedRows > 0;
  },

  async updateLogo(bankId, logoPath) {
    await pool.query("UPDATE banks SET logo_path = ? WHERE bank_id = ?", [
      logoPath,
      bankId,
    ]);
  },

  async delete(bankId) {
    const [result] = await pool.query("DELETE FROM banks WHERE bank_id = ?", [
      bankId,
    ]);
    return result.affectedRows > 0;
  },
};

module.exports = BankModel;
