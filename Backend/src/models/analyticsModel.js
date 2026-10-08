// src/models/analyticsModel.js
const pool = require("../config/db");

const AnalyticsModel = {
  // 1. Agent-Specific Analytics (For Rich Charts)
  async getAgentAnalytics(agentId) {
    // Customers breakdown by KYC status
    const [customerStatus] = await pool.query(
      `SELECT kyc_status, COUNT(*) as count 
             FROM customers 
             WHERE agent_id = ? 
             GROUP BY kyc_status`,
      [agentId],
    );

    // Loans breakdown by status (Great for pie/doughnut charts)
    const [loanStatusBreakdown] = await pool.query(
      `SELECT loan_status, COUNT(*) as count, SUM(requested_amount) as total_amount 
             FROM loans 
             WHERE agent_id = ? 
             GROUP BY loan_status`,
      [agentId],
    );

    // EMI Collection status breakdown (Paid vs Pending vs Overdue)
    const [collectionBreakdown] = await pool.query(
      `SELECT e.status, COUNT(*) as count, SUM(e.emi_amount) as total_amount 
             FROM repayment_emis e
             JOIN loans l ON e.loan_id = l.loan_id
             WHERE l.agent_id = ?
             GROUP BY e.status`,
      [agentId],
    );

    return {
      customers: customerStatus,
      loans: loanStatusBreakdown,
      collections: collectionBreakdown,
    };
  },

  // 2. Admin: Agent Overview Report (List with Performance Metrics)
  async getAdminAgentOverview() {
    const [overview] = await pool.query(`
            SELECT 
                a.agent_id, 
                a.full_name, 
                a.email, 
                a.phone_number, 
                a.is_active,
                COUNT(DISTINCT c.customer_id) as total_customers,
                COUNT(DISTINCT l.loan_id) as total_loans,
                SUM(CASE WHEN l.loan_status IN ('Disbursed', 'Active') THEN l.approved_amount ELSE 0 END) as active_portfolio_value
            FROM agents a
            LEFT JOIN customers c ON a.agent_id = c.agent_id
            LEFT JOIN loans l ON a.agent_id = l.agent_id
            GROUP BY a.agent_id
            ORDER BY total_customers DESC
        `);
    return overview;
  },

  // 3. Admin: Deep-Dive Profile Summary for a Single Agent
  async getAgentProfileSummary(agentId) {
    const [agentDetails] = await pool.query(
      `SELECT agent_id, full_name, email, phone_number, is_active, created_at 
             FROM agents WHERE agent_id = ?`,
      [agentId],
    );

    if (agentDetails.length === 0) return null;

    const analytics = await this.getAgentAnalytics(agentId);

    return {
      profile: agentDetails[0],
      metrics: analytics,
    };
  },
};

module.exports = AnalyticsModel;
