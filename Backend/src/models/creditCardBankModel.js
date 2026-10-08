const pool = require("../config/db");
const CreditCardBankModel = {
  async list(activeOnly = false) {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    const [rows] = await pool.query(
      `SELECT * FROM credit_card_banks ${where} ORDER BY display_order ASC, bank_name ASC`,
    );
    return rows;
  },
  async getById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM credit_card_banks WHERE bank_id = ?",
      [id],
    );
    return rows[0] || null;
  },
  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO credit_card_banks (bank_name, short_code, logo_path, apply_link, tagline, target_audience, documents_required, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.bank_name,
        data.short_code || null,
        data.logo_path || null,
        data.apply_link,
        data.tagline || null,
        data.target_audience,
        data.documents_required,
        data.is_active !== undefined ? data.is_active : 1,
        data.display_order || 0,
      ],
    );
    return result.insertId;
  },
  async update(id, data) {
    const allowed = [
      "bank_name",
      "short_code",
      "logo_path",
      "apply_link",
      "tagline",
      "target_audience",
      "documents_required",
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
    values.push(id);
    const [result] = await pool.query(
      `UPDATE credit_card_banks SET ${updates.join(", ")} WHERE bank_id = ?`,
      values,
    );
    return result.affectedRows > 0;
  },
  async delete(id) {
    const [r] = await pool.query(
      "DELETE FROM credit_card_banks WHERE bank_id = ?",
      [id],
    );
    return r.affectedRows > 0;
  },
  async updateLogo(id, path) {
    await pool.query(
      "UPDATE credit_card_banks SET logo_path = ? WHERE bank_id = ?",
      [path, id],
    );
  },
};
module.exports = CreditCardBankModel;
