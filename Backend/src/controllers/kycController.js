// src/controllers/kycController.js
const KYCModel = require("../models/kycModel");
const audit = require("../utils/auditLog");

/**
 * Admin: Review and Approve or Reject KYC
 */
const reviewKYC = async (req, res) => {
  const { customerId } = req.params;
  const { status, rejection_reason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid KYC status. Must be approved or rejected.",
    });
  }

  if (status === "rejected" && !rejection_reason) {
    return res.status(400).json({
      status: "fail",
      message: "A rejection reason is mandatory when rejecting KYC.",
    });
  }

  try {
    const customer = await KYCModel.getKycDetails(customerId, "admin");
    if (!customer) {
      return res
        .status(404)
        .json({ status: "fail", message: "Customer not found." });
    }

    const success = await KYCModel.updateKycStatus(
      customerId,
      status,
      status === "rejected" ? rejection_reason : null,
    );

    if (!success) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to update KYC status." });
    }

    // ---- Audit ----
    audit(
      req,
      status === "approved" ? "approve" : "reject",
      "kyc",
      Number(customerId),
      {
        kyc_status: customer.kyc_status,
        kyc_rejection_reason: customer.kyc_rejection_reason || null,
      },
      {
        kyc_status: status,
        kyc_rejection_reason: status === "rejected" ? rejection_reason : null,
      },
    );

    return res.status(200).json({
      status: "success",
      message: `KYC has been successfully ${status}.`,
      data: { customer_id: customerId, kyc_status: status },
    });
  } catch (error) {
    console.error("Review KYC Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error during KYC review.",
    });
  }
};

/**
 * Agent: Resubmit KYC after fixing a rejection
 */
const resubmitKYC = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customer = await KYCModel.getKycDetails(
      customerId,
      req.user.role,
      req.user.id,
    );
    if (!customer) {
      return res.status(404).json({
        status: "fail",
        message: "Customer not found or unauthorized access.",
      });
    }

    if (customer.kyc_status !== "rejected") {
      return res.status(400).json({
        status: "fail",
        message: "Only rejected KYC applications can be resubmitted.",
      });
    }

    await KYCModel.updateKycStatus(customerId, "pending", null);

    // ---- Audit ----
    audit(
      req,
      "resubmit",
      "kyc",
      Number(customerId),
      {
        kyc_status: "rejected",
        kyc_rejection_reason: customer.kyc_rejection_reason,
      },
      { kyc_status: "pending", kyc_rejection_reason: null },
    );

    return res.status(200).json({
      status: "success",
      message:
        "KYC resubmitted successfully. Status is now pending admin review.",
      data: { customer_id: customerId, kyc_status: "pending" },
    });
  } catch (error) {
    console.error("Resubmit KYC Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error during KYC resubmission.",
    });
  }
};

module.exports = {
  reviewKYC,
  resubmitKYC,
};
