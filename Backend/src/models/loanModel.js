// src/models/loanModel.js
const pool = require("../config/db");

const LoanModel = {
  async checkCustomerKycApproved(customerId) {
    const [rows] = await pool.query(
      "SELECT kyc_status FROM customers WHERE customer_id = ?",
      [customerId],
    );
    return rows[0] && rows[0].kyc_status === "approved";
  },

  async create(loanData, agentId) {
    const query = `
      INSERT INTO loans (
        customer_id, customer_full_name, customer_phone,
        loan_type, agent_id, bank_id,
        requested_amount, tenure_months, interest_rate, interest_type, purpose,
        aadhaar_number, pan_number,
        business_name, business_type_id, business_category_id,
        business_age_years, annual_turnover, ownership_type,
        business_address, business_landmark, business_city, business_state, business_pincode,
        client_dob, client_marital_status, client_spouse_name, client_mother_name,
        client_alternate_phone, client_address, client_landmark, client_city, client_state, client_pincode,
        loan_status
      )
      VALUES (
        NULL, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?
      )
    `;
    const values = [
      loanData.customer_full_name,
      loanData.customer_phone,
      loanData.loan_type,
      agentId,
      loanData.bank_id || null,
      loanData.requested_amount,
      loanData.tenure_months,
      loanData.interest_rate,
      loanData.interest_type || "flat",
      loanData.purpose,
      loanData.aadhaar_number || null,
      loanData.pan_number || null,
      loanData.business_name || null,
      loanData.business_type_id || null,
      loanData.business_category_id || null,
      loanData.business_age_years || null,
      loanData.annual_turnover || null,
      loanData.ownership_type || null,
      loanData.business_address || null,
      loanData.business_landmark || null,
      loanData.business_city || null,
      loanData.business_state || null,
      loanData.business_pincode || null,
      loanData.client_dob || null,
      loanData.client_marital_status || null,
      loanData.client_spouse_name || null,
      loanData.client_mother_name || null,
      loanData.client_alternate_phone || null,
      loanData.client_address || null,
      loanData.client_landmark || null,
      loanData.client_city || null,
      loanData.client_state || null,
      loanData.client_pincode || null,
      "Applied",
    ];

    const [result] = await pool.query(query, values);
    return result.insertId;
  },

  async findById(loanId) {
    const [rows] = await pool.query(
      `SELECT l.*, b.bank_name, b.short_code AS bank_short_code, b.apply_link AS bank_apply_link,
              bt.type_name AS business_type_name,
              bc.category_name AS business_category_name
       FROM loans l
       LEFT JOIN banks b ON l.bank_id = b.bank_id
       LEFT JOIN business_types bt ON l.business_type_id = bt.type_id
       LEFT JOIN business_categories bc ON l.business_category_id = bc.category_id
       WHERE l.loan_id = ?`,
      [loanId],
    );
    return rows[0] || null;
  },

  async updateLoanByAgent(loanId, loanData) {
    const query = `
      UPDATE loans
      SET loan_type = ?,
          requested_amount = ?,
          tenure_months = ?,
          interest_rate = ?,
          interest_type = COALESCE(?, interest_type),
          purpose = ?,
          bank_id = COALESCE(?, bank_id),
          aadhaar_number = COALESCE(?, aadhaar_number),
          pan_number = COALESCE(?, pan_number),
          business_name = COALESCE(?, business_name),
          business_type_id = COALESCE(?, business_type_id),
          business_category_id = COALESCE(?, business_category_id),
          business_age_years = COALESCE(?, business_age_years),
          annual_turnover = COALESCE(?, annual_turnover),
          ownership_type = COALESCE(?, ownership_type),
          business_address = COALESCE(?, business_address),
          business_landmark = COALESCE(?, business_landmark),
          business_city = COALESCE(?, business_city),
          business_state = COALESCE(?, business_state),
          business_pincode = COALESCE(?, business_pincode),
          client_dob = COALESCE(?, client_dob),
          client_marital_status = COALESCE(?, client_marital_status),
          client_spouse_name = COALESCE(?, client_spouse_name),
          client_mother_name = COALESCE(?, client_mother_name),
          client_alternate_phone = COALESCE(?, client_alternate_phone),
          client_address = COALESCE(?, client_address),
          client_landmark = COALESCE(?, client_landmark),
          client_city = COALESCE(?, client_city),
          client_state = COALESCE(?, client_state),
          client_pincode = COALESCE(?, client_pincode)
      WHERE loan_id = ? AND loan_status IN ('Draft', 'Applied', 'Under Review')
    `;
    const [result] = await pool.query(query, [
      loanData.loan_type,
      loanData.requested_amount,
      loanData.tenure_months,
      loanData.interest_rate,
      loanData.interest_type ?? null,
      loanData.purpose,
      loanData.bank_id ?? null,
      loanData.aadhaar_number ?? null,
      loanData.pan_number ?? null,
      loanData.business_name ?? null,
      loanData.business_type_id ?? null,
      loanData.business_category_id ?? null,
      loanData.business_age_years ?? null,
      loanData.annual_turnover ?? null,
      loanData.ownership_type ?? null,
      loanData.business_address ?? null,
      loanData.business_landmark ?? null,
      loanData.business_city ?? null,
      loanData.business_state ?? null,
      loanData.business_pincode ?? null,
      loanData.client_dob ?? null,
      loanData.client_marital_status ?? null,
      loanData.client_spouse_name ?? null,
      loanData.client_mother_name ?? null,
      loanData.client_alternate_phone ?? null,
      loanData.client_address ?? null,
      loanData.client_landmark ?? null,
      loanData.client_city ?? null,
      loanData.client_state ?? null,
      loanData.client_pincode ?? null,
      loanId,
    ]);
    return result.affectedRows > 0;
  },

  async updateLoanStatusByAdmin(
    loanId,
    status,
    approvedAmount = null,
    bankRef = null,
    rejectionReason = null,
    bankId = null,
  ) {
    const query = `
      UPDATE loans
      SET loan_status = ?,
          approved_amount = ?,
          bank_reference_number = ?,
          rejection_reason = ?,
          bank_id = COALESCE(?, bank_id)
      WHERE loan_id = ?
    `;
    const [result] = await pool.query(query, [
      status,
      approvedAmount,
      bankRef,
      rejectionReason,
      bankId,
      loanId,
    ]);
    return result.affectedRows > 0;
  },

  /**
   * Update a specific business document path on the loan
   */
  async updateDocumentPath(loanId, docField, path) {
    const allowed = [
      "aadhaar_doc_path",
      "pan_doc_path",
      "business_reg_doc_path",
      "bank_statement_doc_path",
    ];
    if (!allowed.includes(docField)) return false;

    const [result] = await pool.query(
      `UPDATE loans SET ${docField} = ? WHERE loan_id = ?`,
      [path, loanId],
    );
    return result.affectedRows > 0;
  },

  async findAll(role, agentId) {
    let query = `
      SELECT 
        l.*,
        b.bank_name, 
        b.short_code AS bank_short_code,
        b.apply_link AS bank_apply_link,
        a.full_name AS agent_name
      FROM loans l
      LEFT JOIN banks b ON l.bank_id = b.bank_id
      LEFT JOIN agents a ON l.agent_id = a.agent_id
    `;
    const params = [];

    if (role === "agent") {
      query += " WHERE l.agent_id = ?";
      params.push(agentId);
    }
    query += " ORDER BY l.created_at DESC";

    const [loans] = await pool.query(query, params);
    return loans;
  },
};

module.exports = LoanModel;
