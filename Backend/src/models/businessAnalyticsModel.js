// src/models/businessAnalyticsModel.js
const pool = require("../config/db");

/**
 * Helper: build a date WHERE clause based on range param
 * Returns { clause: "AND col >= ? AND col <= ?", params: [start, end] }
 */
const buildDateRange = (column, range, customStart, customEnd) => {
  const today = new Date();
  const fmt = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  let start = null;
  let end = fmt(today);

  switch (range) {
    case "today":
      start = fmt(today);
      break;
    case "this_month": {
      const s = new Date(today.getFullYear(), today.getMonth(), 1);
      start = fmt(s);
      break;
    }
    case "this_fy": {
      const y = today.getFullYear();
      const fyStartYear = today.getMonth() >= 3 ? y : y - 1;
      const s = new Date(fyStartYear, 3, 1); // Apr 1
      start = fmt(s);
      break;
    }
    case "custom":
      start = customStart || null;
      end = customEnd || end;
      break;
    default:
      start = null;
  }

  if (start) {
    // Wrap column in DATE() so time component doesn't exclude same-day rows
    return {
      clause: ` AND DATE(${column}) >= ? AND DATE(${column}) <= ?`,
      params: [start, end],
    };
  }
  return { clause: "", params: [] };
};

const BusinessAnalyticsModel = {
  // ---------- KPIs ----------
  async getKpis(role, agentId, range, customStart, customEnd) {
    const agentFilterL = role === "agent" ? "AND l.agent_id = ?" : "";
    const agentFilterC = role === "agent" ? "AND c.agent_id = ?" : "";
    const agentParams = role === "agent" ? [agentId] : [];

    const loanDate = buildDateRange(
      "l.created_at",
      range,
      customStart,
      customEnd,
    );
    const custDate = buildDateRange(
      "c.created_at",
      range,
      customStart,
      customEnd,
    );
    const emiDate = buildDateRange("e.due_date", range, customStart, customEnd);

    // ----- CUSTOMERS -----
    const [custTotals] = await pool.query(
      `SELECT 
       COUNT(*) AS total,
       COALESCE(SUM(CASE WHEN kyc_status='approved' THEN 1 ELSE 0 END), 0) AS kyc_approved,
       COALESCE(SUM(CASE WHEN kyc_status='pending' THEN 1 ELSE 0 END), 0) AS kyc_pending,
       COALESCE(SUM(CASE WHEN kyc_status='rejected' THEN 1 ELSE 0 END), 0) AS kyc_rejected
     FROM customers c WHERE 1=1 ${agentFilterC}`,
      agentParams,
    );
    const [custNew] = await pool.query(
      `SELECT COUNT(*) AS new_in_period FROM customers c 
     WHERE 1=1 ${agentFilterC} ${custDate.clause}`,
      [...agentParams, ...custDate.params],
    );

    // ----- LOANS -----
    const [loanTotals] = await pool.query(
      `SELECT 
       COUNT(*) AS total,
       COALESCE(SUM(CASE WHEN loan_status IN ('Disbursed','Active','Completed') THEN approved_amount ELSE 0 END), 0) AS total_disbursed,
       COALESCE(SUM(CASE WHEN loan_status IN ('Active','Disbursed','Overdue') THEN approved_amount ELSE 0 END), 0) AS active_portfolio,
       COALESCE(SUM(CASE WHEN loan_status='Applied' THEN 1 ELSE 0 END), 0) AS pending_applications,
       COALESCE(SUM(CASE WHEN loan_status='Approved' THEN 1 ELSE 0 END), 0) AS approved_awaiting_disb
     FROM loans l WHERE 1=1 ${agentFilterL}`,
      agentParams,
    );
    const [loanNew] = await pool.query(
      `SELECT COUNT(*) AS new_in_period FROM loans l 
     WHERE 1=1 ${agentFilterL} ${loanDate.clause}`,
      [...agentParams, ...loanDate.params],
    );

    // ----- EMIS -----
    const [emiPeriod] = await pool.query(
      `SELECT 
       COALESCE(SUM(CASE WHEN e.status='Paid' THEN e.emi_amount ELSE 0 END), 0) AS collected_in_period,
       COALESCE(SUM(CASE WHEN e.status='Pending' THEN e.emi_amount ELSE 0 END), 0) AS pending_in_period,
       COALESCE(SUM(CASE WHEN e.status='Overdue' THEN e.emi_amount ELSE 0 END), 0) AS overdue_in_period,
       COALESCE(COUNT(CASE WHEN e.status='Overdue' THEN 1 END), 0) AS overdue_count_in_period
     FROM repayment_emis e
     JOIN loans l ON e.loan_id = l.loan_id
     WHERE 1=1 ${agentFilterL} ${emiDate.clause}`,
      [...agentParams, ...emiDate.params],
    );
    const [emiAllTime] = await pool.query(
      `SELECT 
       COALESCE(SUM(CASE WHEN e.status='Paid' THEN e.emi_amount ELSE 0 END), 0) AS total_collected,
       COALESCE(SUM(CASE WHEN e.status IN ('Pending','Overdue') THEN e.emi_amount ELSE 0 END), 0) AS total_outstanding,
       COALESCE(SUM(CASE WHEN e.status='Overdue' THEN e.emi_amount ELSE 0 END), 0) AS total_overdue
     FROM repayment_emis e
     JOIN loans l ON e.loan_id = l.loan_id
     WHERE 1=1 ${agentFilterL}`,
      agentParams,
    );

    return {
      customers: {
        total: Number(custTotals[0].total ?? 0),
        new_in_period: Number(custNew[0].new_in_period ?? 0),
        kyc_approved: Number(custTotals[0].kyc_approved ?? 0),
        kyc_pending: Number(custTotals[0].kyc_pending ?? 0),
        kyc_rejected: Number(custTotals[0].kyc_rejected ?? 0),
      },
      loans: {
        total: Number(loanTotals[0].total ?? 0),
        new_in_period: Number(loanNew[0].new_in_period ?? 0),
        total_disbursed: Number(loanTotals[0].total_disbursed ?? 0),
        active_portfolio: Number(loanTotals[0].active_portfolio ?? 0),
        pending_applications: Number(loanTotals[0].pending_applications ?? 0),
        approved_awaiting_disb: Number(
          loanTotals[0].approved_awaiting_disb ?? 0,
        ),
      },
      emis: {
        // All-time
        total_collected: Number(emiAllTime[0].total_collected ?? 0),
        total_outstanding: Number(emiAllTime[0].total_outstanding ?? 0),
        total_overdue: Number(emiAllTime[0].total_overdue ?? 0),
        // Period
        collected_in_period: Number(emiPeriod[0].collected_in_period ?? 0),
        pending_in_period: Number(emiPeriod[0].pending_in_period ?? 0),
        overdue_in_period: Number(emiPeriod[0].overdue_in_period ?? 0),
        overdue_count_in_period: Number(
          emiPeriod[0].overdue_count_in_period ?? 0,
        ),
      },
    };
  },

  // ---------- Loan Funnel (status breakdown) ----------
  async getLoanFunnel(role, agentId) {
    const agentFilter = role === "agent" ? "WHERE agent_id = ?" : "";
    const params = role === "agent" ? [agentId] : [];

    const [rows] = await pool.query(
      `SELECT 
         loan_status,
         COUNT(*) AS count,
         SUM(COALESCE(approved_amount, requested_amount)) AS amount
       FROM loans
       ${agentFilter}
       GROUP BY loan_status
       ORDER BY FIELD(loan_status, 'Draft','Applied','Under Review','Approved','Disbursed','Active','Completed','Overdue','Rejected','Cancelled')`,
      params,
    );
    return rows;
  },

  // ---------- Collections Trend (monthly) ----------
  async getCollectionsTrend(role, agentId, months = 6) {
    const agentFilter = role === "agent" ? "AND l.agent_id = ?" : "";
    const params = role === "agent" ? [agentId, months] : [months];

    const [rows] = await pool.query(
      `SELECT 
         DATE_FORMAT(e.due_date, '%Y-%m') AS month,
         SUM(CASE WHEN e.status = 'Paid' THEN e.emi_amount ELSE 0 END) AS collected,
         SUM(CASE WHEN e.status = 'Pending' THEN e.emi_amount ELSE 0 END) AS pending,
         SUM(CASE WHEN e.status = 'Overdue' THEN e.emi_amount ELSE 0 END) AS overdue
       FROM repayment_emis e
       JOIN loans l ON e.loan_id = l.loan_id
       WHERE e.due_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) ${agentFilter}
       GROUP BY month
       ORDER BY month ASC`,
      params,
    );
    return rows;
  },

  // ---------- Customer Acquisition Trend ----------
  async getCustomerTrend(role, agentId, months = 6) {
    const agentFilter = role === "agent" ? "AND agent_id = ?" : "";
    const params = role === "agent" ? [agentId, months] : [months];

    const [rows] = await pool.query(
      `SELECT 
         DATE_FORMAT(created_at, '%Y-%m') AS month,
         COUNT(*) AS count
       FROM customers
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) ${agentFilter}
       GROUP BY month
       ORDER BY month ASC`,
      params,
    );
    return rows;
  },

  // ---------- Bank Distribution (admin only) ----------
  async getBankDistribution() {
    const [rows] = await pool.query(
      `SELECT 
         b.bank_id,
         b.bank_name,
         b.short_code,
         COUNT(l.loan_id) AS loan_count,
         SUM(COALESCE(l.approved_amount, 0)) AS total_amount
       FROM banks b
       LEFT JOIN loans l 
         ON b.bank_id = l.bank_id 
         AND l.loan_status IN ('Disbursed','Active','Completed')
       GROUP BY b.bank_id
       ORDER BY total_amount DESC`,
    );
    return rows;
  },

  // ---------- Overdue Aging (30/60/90+) ----------
  async getOverdueAging(role, agentId) {
    const agentFilter = role === "agent" ? "AND l.agent_id = ?" : "";
    const params = role === "agent" ? [agentId] : [];

    const [rows] = await pool.query(
      `SELECT 
         CASE 
           WHEN DATEDIFF(CURDATE(), e.due_date) <= 30 THEN '0-30 days'
           WHEN DATEDIFF(CURDATE(), e.due_date) <= 60 THEN '31-60 days'
           WHEN DATEDIFF(CURDATE(), e.due_date) <= 90 THEN '61-90 days'
           ELSE '90+ days'
         END AS bucket,
         COUNT(*) AS count,
         SUM(e.emi_amount) AS amount
       FROM repayment_emis e
       JOIN loans l ON e.loan_id = l.loan_id
       WHERE e.status IN ('Pending','Overdue') 
         AND e.due_date < CURDATE()
         ${agentFilter}
       GROUP BY bucket
       ORDER BY FIELD(bucket, '0-30 days','31-60 days','61-90 days','90+ days')`,
      params,
    );
    return rows;
  },

  // ---------- Recent Activity ----------
  async getRecentActivity(role, agentId, limit = 10) {
    const agentFilter = role === "agent" ? "AND l.agent_id = ?" : "";
    const params = role === "agent" ? [agentId, limit] : [limit];

    // Recent loans
    const [loans] = await pool.query(
      `SELECT l.loan_id, l.loan_type, l.requested_amount, l.loan_status,
              l.created_at, c.first_name, c.last_name, c.customer_id
       FROM loans l
       JOIN customers c ON l.customer_id = c.customer_id
       WHERE 1=1 ${agentFilter}
       ORDER BY l.created_at DESC
       LIMIT ?`,
      params,
    );

    // Recent collections (paid EMIs)
    const collectionParams = role === "agent" ? [agentId, limit] : [limit];
    const [collections] = await pool.query(
      `SELECT e.emi_id, e.emi_amount, e.paid_date, e.status,
              c.first_name, c.last_name, c.customer_id, e.loan_id
       FROM repayment_emis e
       JOIN customers c ON e.customer_id = c.customer_id
       JOIN loans l ON e.loan_id = l.loan_id
       WHERE e.status = 'Paid' 
       ${role === "agent" ? "AND l.agent_id = ?" : ""}
       ORDER BY e.paid_date DESC
       LIMIT ?`,
      collectionParams,
    );

    return { loans, collections };
  },

  // ---------- Top Customers (highest loan amounts) ----------
  async getTopCustomers(role, agentId, limit = 10) {
    const agentFilter = role === "agent" ? "AND l.agent_id = ?" : "";
    const params = role === "agent" ? [agentId, limit] : [limit];

    const [rows] = await pool.query(
      `SELECT 
         c.customer_id, c.first_name, c.last_name, c.primary_phone, c.kyc_status,
         COUNT(l.loan_id) AS loan_count,
         SUM(COALESCE(l.approved_amount, l.requested_amount)) AS total_amount
       FROM customers c
       JOIN loans l ON c.customer_id = l.customer_id
       WHERE 1=1 ${agentFilter}
       GROUP BY c.customer_id
       ORDER BY total_amount DESC
       LIMIT ?`,
      params,
    );
    return rows;
  },

  // ---------- Product Mix (loans + demat + cc + savings) ----------
  async getProductMix(role, agentId) {
    const agentFilter = role === "agent" ? "WHERE agent_id = ?" : "";
    const params = role === "agent" ? [agentId] : [];

    const [loans] = await pool.query(
      `SELECT COUNT(*) AS count FROM loans ${agentFilter}`,
      params,
    );
    const [demat] = await pool.query(
      `SELECT COUNT(*) AS count FROM demat_applications ${agentFilter}`,
      params,
    );
    const [cc] = await pool.query(
      `SELECT COUNT(*) AS count FROM credit_card_applications ${agentFilter}`,
      params,
    );
    const [savings] = await pool.query(
      `SELECT COUNT(*) AS count FROM savings_applications ${agentFilter}`,
      params,
    );

    return [
      {
        product: "Loans",
        count: Number(loans[0].count ?? 0),
        color: "#3b82f6",
      },
      {
        product: "Demat",
        count: Number(demat[0].count ?? 0),
        color: "#8b5cf6",
      },
      {
        product: "Credit Cards",
        count: Number(cc[0].count ?? 0),
        color: "#f59e0b",
      },
      {
        product: "Savings",
        count: Number(savings[0].count ?? 0),
        color: "#10b981",
      },
    ];
  },

  // ---------- Disbursement Trend (monthly ₹) ----------
  async getDisbursementTrend(role, agentId, months = 6) {
    const agentFilter = role === "agent" ? "AND l.agent_id = ?" : "";
    const params = role === "agent" ? [agentId, months] : [months];

    const [rows] = await pool.query(
      `SELECT 
         DATE_FORMAT(l.created_at, '%Y-%m') AS month,
         COUNT(*) AS count,
         COALESCE(SUM(CASE WHEN l.loan_status IN ('Disbursed','Active','Completed') 
                          THEN l.approved_amount ELSE 0 END), 0) AS disbursed
       FROM loans l
       WHERE l.created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) ${agentFilter}
       GROUP BY month
       ORDER BY month ASC`,
      params,
    );
    return rows;
  },

  // ---------- Loan Type Distribution (pie) ----------
  async getLoanTypeDistribution(role, agentId) {
    const agentFilter = role === "agent" ? "WHERE agent_id = ?" : "";
    const params = role === "agent" ? [agentId] : [];

    const [rows] = await pool.query(
      `SELECT 
         loan_type,
         COUNT(*) AS count,
         COALESCE(SUM(COALESCE(approved_amount, requested_amount)), 0) AS total_amount
       FROM loans
       ${agentFilter}
       GROUP BY loan_type
       ORDER BY count DESC`,
      params,
    );
    return rows;
  },

  // ---------- Customer by City (top N) ----------
  async getCustomersByCity(role, agentId, limit = 10) {
    const agentFilter = role === "agent" ? "AND agent_id = ?" : "";
    const params = role === "agent" ? [agentId, limit] : [limit];

    const [rows] = await pool.query(
      `SELECT 
         COALESCE(current_city, 'Unknown') AS city,
         COUNT(*) AS count
       FROM customers
       WHERE 1=1 ${agentFilter}
       GROUP BY city
       ORDER BY count DESC
       LIMIT ?`,
      params,
    );
    return rows;
  },

  // ---------- Collection Efficiency ----------
  async getCollectionEfficiency(role, agentId) {
    const agentFilter = role === "agent" ? "AND l.agent_id = ?" : "";
    const params = role === "agent" ? [agentId] : [];

    const [rows] = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN e.status='Paid' THEN e.emi_amount ELSE 0 END), 0) AS collected,
         COALESCE(SUM(CASE WHEN e.status IN ('Pending','Overdue') THEN e.emi_amount ELSE 0 END), 0) AS outstanding,
         COALESCE(SUM(CASE WHEN e.status='Overdue' THEN e.emi_amount ELSE 0 END), 0) AS overdue
       FROM repayment_emis e
       JOIN loans l ON e.loan_id = l.loan_id
       WHERE 1=1 ${agentFilter}`,
      params,
    );

    const collected = Number(rows[0].collected ?? 0);
    const outstanding = Number(rows[0].outstanding ?? 0);
    const overdue = Number(rows[0].overdue ?? 0);
    const totalDue = collected + outstanding;

    return {
      collected,
      outstanding,
      overdue,
      efficiency: totalDue > 0 ? Math.round((collected / totalDue) * 100) : 0,
      overdueRate:
        collected + outstanding > 0
          ? Math.round((overdue / (collected + outstanding)) * 100)
          : 0,
    };
  },

  // ---------- Interest Type Split ----------
  async getInterestTypeSplit(role, agentId) {
    const agentFilter = role === "agent" ? "WHERE agent_id = ?" : "";
    const params = role === "agent" ? [agentId] : [];

    const [rows] = await pool.query(
      `SELECT 
         COALESCE(interest_type, 'flat') AS interest_type,
         COUNT(*) AS count,
         COALESCE(SUM(COALESCE(approved_amount, requested_amount)), 0) AS total_amount
       FROM loans
       ${agentFilter}
       GROUP BY interest_type`,
      params,
    );
    return rows;
  },

  // ---------- Agent Leaderboard (admin) ----------
  async getAgentLeaderboard(limit = 10) {
    const [rows] = await pool.query(
      `SELECT 
         a.agent_id,
         a.full_name,
         a.email,
         a.is_active,
         COUNT(DISTINCT c.customer_id) AS total_customers,
         COUNT(DISTINCT l.loan_id) AS total_loans,
         COALESCE(SUM(CASE WHEN l.loan_status IN ('Disbursed','Active') 
                          THEN l.approved_amount ELSE 0 END), 0) AS portfolio_value,
         COALESCE(SUM(CASE WHEN e.status='Paid' THEN e.emi_amount ELSE 0 END), 0) AS total_collected
       FROM agents a
       LEFT JOIN customers c ON a.agent_id = c.agent_id
       LEFT JOIN loans l ON a.agent_id = l.agent_id
       LEFT JOIN repayment_emis e ON l.loan_id = e.loan_id
       GROUP BY a.agent_id
       ORDER BY portfolio_value DESC
       LIMIT ?`,
      [limit],
    );
    return rows;
  },

  // ---------- KYC Conversion Funnel ----------
  async getKycFunnel(role, agentId) {
    const agentFilter = role === "agent" ? "WHERE agent_id = ?" : "";
    const params = role === "agent" ? [agentId] : [];

    const [rows] = await pool.query(
      `SELECT 
         COUNT(*) AS total,
         COALESCE(SUM(CASE WHEN kyc_status='pending' THEN 1 ELSE 0 END), 0) AS pending,
         COALESCE(SUM(CASE WHEN kyc_status='approved' THEN 1 ELSE 0 END), 0) AS approved,
         COALESCE(SUM(CASE WHEN kyc_status='rejected' THEN 1 ELSE 0 END), 0) AS rejected
       FROM customers
       ${agentFilter}`,
      params,
    );
    return rows[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };
  },
};

module.exports = BusinessAnalyticsModel;
