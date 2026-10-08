// src/models/reportModel.js
const pool = require("../config/db");

// ---------- Helpers ----------
const agentScope = (role, agentId, alias = "") => {
  if (role === "agent") {
    const col = alias ? `${alias}.agent_id` : "agent_id";
    return { clause: ` AND ${col} = ?`, params: [agentId] };
  }
  return { clause: "", params: [] };
};

const dateRange = (column, start, end) => {
  if (start && end) {
    return { clause: ` AND ${column} BETWEEN ? AND ?`, params: [start, end] };
  }
  return { clause: "", params: [] };
};

const ReportModel = {
  // ---------- Existing ----------
  async getCustomerReport(role, agentId, filters = {}) {
    const scope = agentScope(role, filters.agent_id || agentId, "c");
    const range = dateRange(
      "c.created_at",
      filters.start_date,
      filters.end_date,
    );

    let query = `
      SELECT c.customer_id, c.first_name, c.last_name, c.primary_phone, 
             c.email_address, c.kyc_status, c.national_id_number, 
             c.current_city, c.created_at,
             a.full_name AS agent_name
      FROM customers c
      LEFT JOIN agents a ON c.agent_id = a.agent_id
      WHERE 1=1 ${scope.clause} ${range.clause}
    `;
    const params = [...scope.params, ...range.params];

    if (filters.kyc_status) {
      query += " AND c.kyc_status = ?";
      params.push(filters.kyc_status);
    }

    query += " ORDER BY c.created_at DESC LIMIT 1000";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getLoanReport(role, agentId, filters = {}) {
    const scope = agentScope(role, filters.agent_id || agentId, "l");
    const range = dateRange(
      "l.created_at",
      filters.start_date,
      filters.end_date,
    );

    let query = `
      SELECT l.loan_id, l.customer_id, l.loan_type, l.requested_amount, 
             l.approved_amount, l.loan_status, l.tenure_months, l.interest_rate, 
             l.interest_type, l.purpose, l.bank_reference_number, l.created_at,
             c.first_name, c.last_name, c.primary_phone,
             b.bank_name, b.short_code AS bank_short_code,
             a.full_name AS agent_name
      FROM loans l
      JOIN customers c ON l.customer_id = c.customer_id
      LEFT JOIN banks b ON l.bank_id = b.bank_id
      LEFT JOIN agents a ON l.agent_id = a.agent_id
      WHERE 1=1 ${scope.clause} ${range.clause}
    `;
    const params = [...scope.params, ...range.params];

    if (filters.status) {
      query += " AND l.loan_status = ?";
      params.push(filters.status);
    }
    if (filters.loan_type) {
      query += " AND l.loan_type = ?";
      params.push(filters.loan_type);
    }
    if (filters.bank_id) {
      query += " AND l.bank_id = ?";
      params.push(filters.bank_id);
    }
    if (filters.min_amount) {
      query += " AND l.requested_amount >= ?";
      params.push(filters.min_amount);
    }
    if (filters.max_amount) {
      query += " AND l.requested_amount <= ?";
      params.push(filters.max_amount);
    }

    query += " ORDER BY l.created_at DESC LIMIT 1000";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getCollectionReport(role, agentId, filters = {}) {
    const scope = agentScope(role, filters.agent_id || agentId, "l");
    const range = dateRange("e.due_date", filters.start_date, filters.end_date);

    let query = `
      SELECT e.emi_id, e.loan_id, e.customer_id, e.installment_number,
             e.emi_amount, e.due_date, e.status, e.paid_date,
             c.first_name, c.last_name, c.primary_phone, 
             l.loan_type,
             b.bank_name
      FROM repayment_emis e
      JOIN customers c ON e.customer_id = c.customer_id
      JOIN loans l ON e.loan_id = l.loan_id
      LEFT JOIN banks b ON l.bank_id = b.bank_id
      WHERE 1=1 ${scope.clause} ${range.clause}
    `;
    const params = [...scope.params, ...range.params];

    if (filters.status) {
      query += " AND e.status = ?";
      params.push(filters.status);
    }

    query += " ORDER BY e.due_date ASC LIMIT 1000";
    const [rows] = await pool.query(query, params);
    return rows;
  },

  // ---------- NEW: Overdue report ----------
  async getOverdueReport(role, agentId, filters = {}) {
    const scope = agentScope(role, filters.agent_id || agentId, "l");

    let query = `
      SELECT 
        e.emi_id, e.loan_id, e.customer_id, e.installment_number,
        e.emi_amount, e.due_date, e.status,
        DATEDIFF(CURDATE(), e.due_date) AS days_overdue,
        CASE 
          WHEN DATEDIFF(CURDATE(), e.due_date) <= 30 THEN '0-30 days'
          WHEN DATEDIFF(CURDATE(), e.due_date) <= 60 THEN '31-60 days'
          WHEN DATEDIFF(CURDATE(), e.due_date) <= 90 THEN '61-90 days'
          ELSE '90+ days'
        END AS aging_bucket,
        c.first_name, c.last_name, c.primary_phone,
        l.loan_type, l.approved_amount,
        b.bank_name
      FROM repayment_emis e
      JOIN customers c ON e.customer_id = c.customer_id
      JOIN loans l ON e.loan_id = l.loan_id
      LEFT JOIN banks b ON l.bank_id = b.bank_id
      WHERE e.status IN ('Pending','Overdue') 
        AND e.due_date < CURDATE()
        ${scope.clause}
    `;
    const params = [...scope.params];

    if (filters.status) {
      query += " AND e.status = ?";
      params.push(filters.status);
    }
    query += " ORDER BY days_overdue DESC LIMIT 1000";

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // ---------- NEW: Bank-wise disbursements ----------
  async getBankDisbursementReport() {
    const [rows] = await pool.query(`
      SELECT 
        b.bank_id, b.bank_name, b.short_code,
        COUNT(l.loan_id) AS loan_count,
        SUM(CASE WHEN l.loan_status IN ('Disbursed','Active','Completed') 
                 THEN l.approved_amount ELSE 0 END) AS total_disbursed,
        SUM(CASE WHEN l.loan_status IN ('Active','Disbursed') 
                 THEN l.approved_amount ELSE 0 END) AS active_outstanding,
        SUM(CASE WHEN l.loan_status = 'Approved' 
                 THEN l.approved_amount ELSE 0 END) AS pending_disbursement
      FROM banks b
      LEFT JOIN loans l ON b.bank_id = l.bank_id
      GROUP BY b.bank_id
      ORDER BY total_disbursed DESC
    `);
    return rows;
  },

  // ---------- NEW: Agent performance report ----------
  async getAgentPerformanceReport() {
    const [rows] = await pool.query(`
      SELECT 
        a.agent_id, a.full_name, a.email, a.phone_number, a.is_active,
        COUNT(DISTINCT c.customer_id) AS total_customers,
        SUM(CASE WHEN c.kyc_status = 'approved' THEN 1 ELSE 0 END) AS kyc_approved,
        SUM(CASE WHEN c.kyc_status = 'pending' THEN 1 ELSE 0 END) AS kyc_pending,
        COUNT(DISTINCT l.loan_id) AS total_loans,
        SUM(CASE WHEN l.loan_status IN ('Disbursed','Active') 
                 THEN l.approved_amount ELSE 0 END) AS portfolio_value,
        SUM(CASE WHEN e.status = 'Paid' THEN e.emi_amount ELSE 0 END) AS total_collected
      FROM agents a
      LEFT JOIN customers c ON a.agent_id = c.agent_id
      LEFT JOIN loans l ON a.agent_id = l.agent_id
      LEFT JOIN repayment_emis e ON l.loan_id = e.loan_id
      GROUP BY a.agent_id
      ORDER BY portfolio_value DESC
    `);
    return rows;
  },

  // ---------- NEW: Outstanding balance report ----------
  async getOutstandingReport(role, agentId, filters = {}) {
    const scope = agentScope(role, filters.agent_id || agentId, "l");

    let query = `
      SELECT 
        l.loan_id, l.loan_type, l.approved_amount, l.loan_status,
        l.tenure_months, l.interest_rate, l.interest_type,
        c.customer_id, c.first_name, c.last_name, c.primary_phone,
        b.bank_name,
        SUM(CASE WHEN e.status IN ('Pending','Overdue') THEN e.emi_amount ELSE 0 END) AS outstanding,
        SUM(CASE WHEN e.status = 'Paid' THEN e.emi_amount ELSE 0 END) AS paid_so_far,
        COUNT(CASE WHEN e.status IN ('Pending','Overdue') THEN 1 END) AS installments_left
      FROM loans l
      JOIN customers c ON l.customer_id = c.customer_id
      LEFT JOIN banks b ON l.bank_id = b.bank_id
      LEFT JOIN repayment_emis e ON l.loan_id = e.loan_id
      WHERE l.loan_status IN ('Active','Disbursed','Overdue') ${scope.clause}
      GROUP BY l.loan_id
      HAVING outstanding > 0
      ORDER BY outstanding DESC
      LIMIT 1000
    `;
    const [rows] = await pool.query(query, scope.params);
    return rows;
  },

  // ---------- NEW: Pending KYC report ----------
  async getPendingKycReport(role, agentId) {
    const scope = agentScope(role, agentId, "c");
    const [rows] = await pool.query(
      `SELECT 
         c.customer_id, c.first_name, c.last_name, c.primary_phone, 
         c.email_address, c.national_id_number, c.kyc_status, c.created_at,
         DATEDIFF(CURDATE(), c.created_at) AS days_pending,
         a.full_name AS agent_name
       FROM customers c
       LEFT JOIN agents a ON c.agent_id = a.agent_id
       WHERE c.kyc_status = 'pending' ${scope.clause}
       ORDER BY c.created_at ASC`,
      scope.params,
    );
    return rows;
  },
};

module.exports = ReportModel;
