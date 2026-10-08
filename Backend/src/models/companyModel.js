// src/models/companyModel.js
const pool = require("../config/db");

const CompanyModel = {
  async get() {
    const [rows] = await pool.query(
      "SELECT * FROM company_profile ORDER BY company_id ASC LIMIT 1",
    );
    return rows[0] || null;
  },

  async update(payload) {
    const allowed = [
      "company_name",
      "tagline",
      "logo_path",
      "address_line1",
      "address_line2",
      "city",
      "state",
      "pincode",
      "phone",
      "email",
      "website",
      "card_validity_years",
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

    // Ensure a row exists
    const existing = await this.get();
    if (!existing) {
      await pool.query(
        "INSERT INTO company_profile (company_name) VALUES (?)",
        [payload.company_name || "Company"],
      );
    }

    const companyId = (await this.get()).company_id;
    values.push(companyId);
    const [result] = await pool.query(
      `UPDATE company_profile SET ${updates.join(", ")} WHERE company_id = ?`,
      values,
    );
    return result.affectedRows > 0;
  },

  async updateLogo(logoPath) {
    const existing = await this.get();
    if (!existing) {
      await pool.query(
        "INSERT INTO company_profile (company_name, logo_path) VALUES (?, ?)",
        ["Company", logoPath],
      );
      return;
    }
    await pool.query(
      "UPDATE company_profile SET logo_path = ? WHERE company_id = ?",
      [logoPath, existing.company_id],
    );
  },
};

module.exports = CompanyModel;
