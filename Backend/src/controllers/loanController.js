// src/controllers/loanController.js
const LoanModel = require("../models/loanModel");
const EMIModel = require("../models/emiModel");
const audit = require("../utils/auditLog");

/**
 * Agent / Admin: Create a Loan Application
 */
const createLoan = async (req, res) => {
  const {
    full_name,
    phone,
    loan_type,
    bank_id,
    requested_amount,
    tenure_months,
    interest_rate,
    interest_type,
    purpose,
    aadhaar_number,
    pan_number,
    // Business
    business_name,
    business_type_id,
    business_category_id,
    business_age_years,
    annual_turnover,
    ownership_type,
    business_address,
    business_landmark,
    business_city,
    business_state,
    business_pincode,
    // Client
    client_dob,
    client_marital_status,
    client_spouse_name,
    client_mother_name,
    client_alternate_phone,
    client_address,
    client_landmark,
    client_city,
    client_state,
    client_pincode,
    // Nominee
    nominee_name,
    nominee_relationship,
    nominee_phone,
  } = req.body;

  if (
    !full_name ||
    !phone ||
    !loan_type ||
    !requested_amount ||
    !tenure_months ||
    !interest_rate ||
    !purpose ||
    !aadhaar_number ||
    !pan_number
  ) {
    return res.status(400).json({
      status: "fail",
      message:
        "full_name, phone, loan_type, requested_amount, tenure_months, interest_rate, purpose, aadhaar_number, pan_number are required.",
    });
  }

  if (!/^\d{4}\s?\d{4}\s?\d{4}$/.test(aadhaar_number)) {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid Aadhaar number." });
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan_number.toUpperCase())) {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid PAN number." });
  }

  const isBusiness = loan_type === "Business" || loan_type === "Business Loan";

  if (isBusiness) {
    const requiredBusiness = [
      ["business_name", business_name],
      ["business_type_id", business_type_id],
      ["business_category_id", business_category_id],
      ["business_age_years", business_age_years],
      ["annual_turnover", annual_turnover],
      ["ownership_type", ownership_type],
      ["business_address", business_address],
      ["business_city", business_city],
      ["business_state", business_state],
      ["business_pincode", business_pincode],
      ["client_dob", client_dob],
      ["client_marital_status", client_marital_status],
      ["client_alternate_phone", client_alternate_phone],
      ["client_address", client_address],
      ["client_city", client_city],
      ["client_state", client_state],
      ["client_pincode", client_pincode],
      // Nominee — text fields required
      ["nominee_name", nominee_name],
      ["nominee_relationship", nominee_relationship],
      ["nominee_phone", nominee_phone],
    ];
    const missing = requiredBusiness
      .filter(([, v]) => v === undefined || v === null || v === "")
      .map(([k]) => k);
    if (missing.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: `Missing business loan fields: ${missing.join(", ")}`,
      });
    }
  }

  try {
    let agentId;
    if (req.user.role === "agent") {
      agentId = req.user.id;
    } else if (req.user.role === "admin") {
      agentId = req.body.agent_id ?? null;
    } else {
      return res
        .status(403)
        .json({ status: "fail", message: "Unauthorized role." });
    }

    const loanId = await LoanModel.create(
      {
        customer_full_name: full_name,
        customer_phone: phone,
        loan_type,
        bank_id: bank_id || null,
        requested_amount,
        tenure_months,
        interest_rate,
        interest_type: interest_type || "flat",
        purpose,
        aadhaar_number: aadhaar_number.trim(),
        pan_number: pan_number.trim().toUpperCase(),
        business_name: isBusiness ? business_name : null,
        business_type_id: isBusiness ? business_type_id : null,
        business_category_id: isBusiness ? business_category_id : null,
        business_age_years: isBusiness ? business_age_years : null,
        annual_turnover: isBusiness ? annual_turnover : null,
        ownership_type: isBusiness ? ownership_type : null,
        business_address: isBusiness ? business_address : null,
        business_landmark: isBusiness ? business_landmark : null,
        business_city: isBusiness ? business_city : null,
        business_state: isBusiness ? business_state : null,
        business_pincode: isBusiness ? business_pincode : null,
        client_dob: isBusiness ? client_dob : null,
        client_marital_status: isBusiness ? client_marital_status : null,
        client_spouse_name: isBusiness ? client_spouse_name : null,
        client_mother_name: isBusiness ? client_mother_name : null,
        client_alternate_phone: isBusiness ? client_alternate_phone : null,
        client_address: isBusiness ? client_address : null,
        client_landmark: isBusiness ? client_landmark : null,
        client_city: isBusiness ? client_city : null,
        client_state: isBusiness ? client_state : null,
        client_pincode: isBusiness ? client_pincode : null,
        nominee_name: isBusiness ? nominee_name : null,
        nominee_relationship: isBusiness ? nominee_relationship : null,
        nominee_phone: isBusiness ? nominee_phone : null,
      },
      agentId,
    );

    audit(req, "create", "loan", loanId, null, {
      customer_full_name: full_name,
      customer_phone: phone,
      loan_type,
      requested_amount,
      agent_id: agentId,
    });

    return res.status(201).json({
      status: "success",
      message: "Loan application submitted successfully.",
      data: { loan_id: loanId, loan_status: "Applied" },
    });
  } catch (error) {
    console.error("Create Loan Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

/**
 * Agent / Admin: Update Loan Application
 */
const updateLoan = async (req, res) => {
  const { loanId } = req.params;

  try {
    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ status: "fail", message: "Loan application not found." });
    }

    if (req.user.role === "agent") {
      if (loan.agent_id !== req.user.id) {
        return res.status(403).json({
          status: "fail",
          message: "Unauthorized access to this loan record.",
        });
      }
      const allowed = ["Draft", "Applied", "Under Review"];
      if (!allowed.includes(loan.loan_status)) {
        return res.status(400).json({
          status: "fail",
          message: `Loan cannot be modified. Current status is '${loan.loan_status}'.`,
        });
      }
    }

    const b = req.body;
    const success = await LoanModel.updateLoanByAgent(loanId, {
      loan_type: b.loan_type || loan.loan_type,
      requested_amount: b.requested_amount || loan.requested_amount,
      tenure_months: b.tenure_months || loan.tenure_months,
      interest_rate: b.interest_rate || loan.interest_rate,
      interest_type: b.interest_type || loan.interest_type,
      purpose: b.purpose || loan.purpose,
      bank_id: b.bank_id !== undefined ? b.bank_id : loan.bank_id,
      aadhaar_number:
        b.aadhaar_number !== undefined ? b.aadhaar_number : loan.aadhaar_number,
      pan_number:
        b.pan_number !== undefined
          ? b.pan_number.toUpperCase()
          : loan.pan_number,
      business_name: b.business_name ?? loan.business_name,
      business_type_id: b.business_type_id ?? loan.business_type_id,
      business_category_id: b.business_category_id ?? loan.business_category_id,
      business_age_years: b.business_age_years ?? loan.business_age_years,
      annual_turnover: b.annual_turnover ?? loan.annual_turnover,
      ownership_type: b.ownership_type ?? loan.ownership_type,
      business_address: b.business_address ?? loan.business_address,
      business_landmark: b.business_landmark ?? loan.business_landmark,
      business_city: b.business_city ?? loan.business_city,
      business_state: b.business_state ?? loan.business_state,
      business_pincode: b.business_pincode ?? loan.business_pincode,
      client_dob: b.client_dob ?? loan.client_dob,
      client_marital_status:
        b.client_marital_status ?? loan.client_marital_status,
      client_spouse_name: b.client_spouse_name ?? loan.client_spouse_name,
      client_mother_name: b.client_mother_name ?? loan.client_mother_name,
      client_alternate_phone:
        b.client_alternate_phone ?? loan.client_alternate_phone,
      client_address: b.client_address ?? loan.client_address,
      client_landmark: b.client_landmark ?? loan.client_landmark,
      client_city: b.client_city ?? loan.client_city,
      client_state: b.client_state ?? loan.client_state,
      client_pincode: b.client_pincode ?? loan.client_pincode,
      nominee_name: b.nominee_name ?? loan.nominee_name,
      nominee_relationship: b.nominee_relationship ?? loan.nominee_relationship,
      nominee_phone: b.nominee_phone ?? loan.nominee_phone,
    });

    if (!success) {
      return res
        .status(400)
        .json({ status: "fail", message: "Failed to update." });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Loan updated." });
  } catch (error) {
    console.error("Update Loan Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

/**
 * Admin: Update Loan Status
 */
const updateLoanStatusByAdmin = async (req, res) => {
  const { loanId } = req.params;
  const {
    loan_status,
    approved_amount,
    bank_reference_number,
    rejection_reason,
    bank_id,
  } = req.body;

  const validStatuses = [
    "Draft",
    "Applied",
    "Under Review",
    "Approved",
    "Rejected",
    "Disbursed",
    "Active",
    "Completed",
    "Overdue",
    "Cancelled",
  ];
  if (!validStatuses.includes(loan_status)) {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid loan status." });
  }

  if (loan_status === "Rejected" && !rejection_reason) {
    return res
      .status(400)
      .json({ status: "fail", message: "Rejection reason required." });
  }

  if (
    (loan_status === "Approved" || loan_status === "Disbursed") &&
    !bank_reference_number
  ) {
    return res
      .status(400)
      .json({ status: "fail", message: "Bank reference required." });
  }

  try {
    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ status: "fail", message: "Loan not found." });
    }

    const success = await LoanModel.updateLoanStatusByAdmin(
      loanId,
      loan_status,
      approved_amount || loan.approved_amount,
      bank_reference_number || loan.bank_reference_number,
      rejection_reason || loan.rejection_reason,
      bank_id || loan.bank_id,
    );

    if (!success) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to update." });
    }

    audit(
      req,
      "update_status",
      "loan",
      Number(loanId),
      {
        loan_status: loan.loan_status,
      },
      { loan_status },
    );

    // Auto-generate EMI schedule on disbursement
    let emisGenerated = 0;
    if (loan_status === "Disbursed") {
      try {
        const existing = await EMIModel.findByLoanId(loanId);
        if (existing.length === 0) {
          const totalAmount =
            approved_amount || loan.approved_amount || loan.requested_amount;
          const startDate = new Date().toISOString().split("T")[0];

          await EMIModel.generateSchedule(
            loanId,
            null, // customer_id no longer required for standalone leads
            loan.tenure_months,
            Number(totalAmount),
            startDate,
            Number(loan.interest_rate),
            loan.interest_type || "flat",
          );
          emisGenerated = loan.tenure_months;

          audit(req, "generate_emis", "loan", Number(loanId), null, {
            installments: loan.tenure_months,
          });
        }
      } catch (emiErr) {
        console.error("EMI generation failed:", emiErr.message);
      }
    }

    return res.status(200).json({
      status: "success",
      message: `Status updated to '${loan_status}'.`,
      data: { loan_id: loanId, loan_status, emis_generated: emisGenerated },
    });
  } catch (error) {
    console.error("Update Loan Status Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getLoans = async (req, res) => {
  try {
    const loans = await LoanModel.findAll(req.user.role, req.user.id);
    return res
      .status(200)
      .json({ status: "success", count: loans.length, data: loans });
  } catch (error) {
    console.error("Get Loans Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const generateEMISchedule = async (req, res) => {
  const { loanId } = req.params;
  try {
    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ status: "fail", message: "Loan not found." });
    }

    if (!["Disbursed", "Active"].includes(loan.loan_status)) {
      return res.status(400).json({
        status: "fail",
        message:
          "EMI schedule can only be generated for Disbursed or Active loans.",
      });
    }

    const existing = await EMIModel.findByLoanId(loanId);
    if (existing.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: "EMI schedule already exists.",
      });
    }

    const totalAmount = loan.approved_amount || loan.requested_amount;
    const startDate = new Date().toISOString().split("T")[0];

    await EMIModel.generateSchedule(
      loanId,
      null,
      loan.tenure_months,
      Number(totalAmount),
      startDate,
      Number(loan.interest_rate),
      loan.interest_type || "flat",
    );

    audit(req, "generate_emis", "loan", Number(loanId), null, {
      installments: loan.tenure_months,
      total_amount: totalAmount,
    });

    return res.status(201).json({
      status: "success",
      message: `EMI schedule generated: ${loan.tenure_months} installments.`,
    });
  } catch (error) {
    console.error("Generate EMI Schedule Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  createLoan,
  updateLoan,
  updateLoanStatusByAdmin,
  getLoans,
  generateEMISchedule,
};
