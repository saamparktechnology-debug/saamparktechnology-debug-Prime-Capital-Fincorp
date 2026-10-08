// src/models/emiModel.js
const pool = require("../config/db");

const EMIModel = {
  /**
   * Generate the EMI schedule for a loan.
   *
   * @param {number} loanId
   * @param {number} customerId
   * @param {number} tenureMonths
   * @param {number} totalAmount     — Principal (approved or requested)
   * @param {string} startDate       — YYYY-MM-DD
   * @param {number} interestRate    — annual % (e.g. 12 for 12%)
   * @param {'flat'|'reducing'} interestType
   */
  async generateSchedule(
    loanId,
    customerId,
    tenureMonths,
    totalAmount,
    startDate,
    interestRate = 0,
    interestType = "flat",
  ) {
    const P = Number(totalAmount);
    const n = Number(tenureMonths);
    const annualRate = Number(interestRate) || 0;

    let emiAmount;

    if (interestType === "reducing") {
      // Reducing balance (amortized)
      const r = annualRate / 12 / 100;
      if (r === 0) {
        emiAmount = P / n;
      } else {
        const pow = Math.pow(1 + r, n);
        emiAmount = (P * r * pow) / (pow - 1);
      }
    } else {
      // Flat interest on original principal
      const totalInterest = (P * annualRate * n) / (12 * 100);
      emiAmount = (P + totalInterest) / n;
    }

    emiAmount = parseFloat(emiAmount.toFixed(2));

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (let i = 1; i <= n; i++) {
        const due = new Date(startDate);
        due.setMonth(due.getMonth() + i);
        const dueDateFormatted = due.toISOString().split("T")[0];
        const installmentsLeft = n - i;

        await connection.query(
          `INSERT INTO repayment_emis
           (loan_id, customer_id, installment_number, emi_amount, due_date, installments_left, status)
           VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
          [
            loanId,
            customerId,
            i,
            emiAmount,
            dueDateFormatted,
            installmentsLeft,
          ],
        );
      }

      await connection.commit();
      connection.release();
      return true;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  },

  async updateStatus(emiId, status) {
    const paidDate =
      status === "Paid" ? new Date().toISOString().split("T")[0] : null;
    const [result] = await pool.query(
      "UPDATE repayment_emis SET status = ?, paid_date = ? WHERE emi_id = ?",
      [status, paidDate, emiId],
    );
    return result.affectedRows > 0;
  },

  async findByLoanId(loanId) {
    const [rows] = await pool.query(
      "SELECT * FROM repayment_emis WHERE loan_id = ? ORDER BY installment_number ASC",
      [loanId],
    );
    return rows;
  },
};

module.exports = EMIModel;
