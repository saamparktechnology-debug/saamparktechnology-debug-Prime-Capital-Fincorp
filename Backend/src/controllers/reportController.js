// src/controllers/reportController.js
const ReportModel = require("../models/reportModel");

const fetchReport = async (req, res) => {
  const { reportType } = req.params;
  const {
    start_date,
    end_date,
    status,
    agent_id,
    loan_type,
    bank_id,
    min_amount,
    max_amount,
    kyc_status,
  } = req.query;

  try {
    let data = [];
    const filters = {
      start_date,
      end_date,
      agent_id: agent_id ? Number(agent_id) : undefined,
      status,
      loan_type,
      bank_id: bank_id ? Number(bank_id) : undefined,
      min_amount,
      max_amount,
      kyc_status,
    };

    switch (reportType) {
      case "customers":
        data = await ReportModel.getCustomerReport(
          req.user.role,
          req.user.id,
          filters,
        );
        break;

      case "loans":
      case "loan-applications":
        data = await ReportModel.getLoanReport(
          req.user.role,
          req.user.id,
          filters,
        );
        break;

      case "approved-loans":
        filters.status = "Approved";
        data = await ReportModel.getLoanReport(
          req.user.role,
          req.user.id,
          filters,
        );
        break;

      case "rejected-loans":
        filters.status = "Rejected";
        data = await ReportModel.getLoanReport(
          req.user.role,
          req.user.id,
          filters,
        );
        break;

      case "disbursements":
        filters.status = "Disbursed";
        data = await ReportModel.getLoanReport(
          req.user.role,
          req.user.id,
          filters,
        );
        break;

      case "collections":
        data = await ReportModel.getCollectionReport(
          req.user.role,
          req.user.id,
          filters,
        );
        break;

      case "overdue":
        data = await ReportModel.getOverdueReport(
          req.user.role,
          req.user.id,
          filters,
        );
        break;

      case "bank-disbursements":
        data = await ReportModel.getBankDisbursementReport();
        break;

      case "agent-performance":
        data = await ReportModel.getAgentPerformanceReport();
        break;

      case "outstanding":
        data = await ReportModel.getOutstandingReport(
          req.user.role,
          req.user.id,
          filters,
        );
        break;

      case "kyc-pending":
        data = await ReportModel.getPendingKycReport(
          req.user.role,
          req.user.id,
        );
        break;

      default:
        return res
          .status(400)
          .json({ status: "fail", message: "Invalid report type requested." });
    }

    return res.status(200).json({
      status: "success",
      report_type: reportType,
      filters_applied: filters,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Fetch Report Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while generating report.",
    });
  }
};

module.exports = { fetchReport };
