// src/controllers/loanDocumentController.js
const pool = require("../config/db");
const fs = require("fs");
const LoanModel = require("../models/loanModel");
const audit = require("../utils/auditLog");
const { toRelativeUploadPath, toAbsolutePath } = require("../utils/filePaths");

const DOC_FIELD_MAP = {
  aadhaar: "aadhaar_doc_path",
  aadhaar_back: "aadhaar_back_doc_path",
  pan: "pan_doc_path",
  business_reg: "business_reg_doc_path",
  bank_statement: "bank_statement_doc_path",
  nominee: "nominee_doc_path",
};

const DOC_LABELS = {
  aadhaar: "Aadhaar Card (Front)",
  aadhaar_back: "Aadhaar Card (Back)",
  pan: "PAN Card",
  business_reg: "Business Registration Proof",
  bank_statement: "Bank Statement 1 Year",
  nominee: "Nominee Document",
};

/**
 * Upload a loan document
 * POST /loans/:loanId/documents/:docType
 * Body: multipart form-data with `document` file
 */
const uploadLoanDocument = async (req, res) => {
  const { loanId, docType } = req.params;

  try {
    // 1. Validate docType
    if (!DOC_FIELD_MAP[docType]) {
      return res.status(400).json({
        status: "fail",
        message: `Invalid document type. Allowed: ${Object.keys(DOC_FIELD_MAP).join(", ")}`,
      });
    }

    // 2. Check file
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "No file uploaded or file type is invalid.",
      });
    }

    // 3. Fetch loan
    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ status: "fail", message: "Loan not found." });
    }

    // 4. Agent scoping
    if (req.user.role === "agent" && loan.agent_id !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized." });
    }

    // 5. Only allow for Business loans (accept both variants)
    const isBusiness =
      loan.loan_type === "Business" || loan.loan_type === "Business Loan";
    if (!isBusiness) {
      return res.status(400).json({
        status: "fail",
        message: "Documents can only be uploaded for Business loans.",
      });
    }

    // 6. Only allow before approval (Draft / Applied / Under Review)
    const allowed = ["Draft", "Applied", "Under Review"];
    if (!allowed.includes(loan.loan_status)) {
      return res.status(400).json({
        status: "fail",
        message: `Cannot modify documents at status '${loan.loan_status}'.`,
      });
    }

    // 7. Delete existing file if replacing
    const existingPath = loan[DOC_FIELD_MAP[docType]];
    if (existingPath) {
      try {
        const abs = toAbsolutePath(existingPath);
        if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch (e) {
        console.warn("Delete old loan doc error:", e.message);
      }
    }

    // 8. Save new file
    const relativePath = toRelativeUploadPath(req.file.path);
    const updated = await LoanModel.updateDocumentPath(
      loanId,
      DOC_FIELD_MAP[docType],
      relativePath,
    );

    if (!updated) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to update loan." });
    }

    audit(req, "upload", "loan_document", Number(loanId), null, {
      doc_type: docType,
      label: DOC_LABELS[docType],
      file_name: req.file.originalname,
      file_path: relativePath,
    });

    return res.status(200).json({
      status: "success",
      message: `${DOC_LABELS[docType]} uploaded successfully.`,
      data: { doc_type: docType, file_path: relativePath },
    });
  } catch (error) {
    console.error("Upload Loan Document Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

/**
 * Delete a loan document
 * DELETE /loans/:loanId/documents/:docType
 */
const deleteLoanDocument = async (req, res) => {
  const { loanId, docType } = req.params;

  try {
    if (!DOC_FIELD_MAP[docType]) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid document type." });
    }

    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ status: "fail", message: "Loan not found." });
    }

    if (req.user.role === "agent" && loan.agent_id !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized." });
    }

    const allowed = ["Draft", "Applied", "Under Review"];
    if (!allowed.includes(loan.loan_status)) {
      return res.status(400).json({
        status: "fail",
        message: `Cannot modify documents at status '${loan.loan_status}'.`,
      });
    }

    const existingPath = loan[DOC_FIELD_MAP[docType]];
    if (!existingPath) {
      return res
        .status(404)
        .json({ status: "fail", message: "Document not found." });
    }

    // Delete file
    try {
      const abs = toAbsolutePath(existingPath);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      console.warn("Delete loan doc file error:", e.message);
    }

    // Clear column
    await LoanModel.updateDocumentPath(loanId, DOC_FIELD_MAP[docType], null);

    audit(
      req,
      "delete",
      "loan_document",
      Number(loanId),
      {
        doc_type: docType,
        label: DOC_LABELS[docType],
        file_path: existingPath,
      },
      null,
    );

    return res
      .status(200)
      .json({ status: "success", message: "Document deleted." });
  } catch (error) {
    console.error("Delete Loan Document Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

/**
 * Get loan document status checklist
 * GET /loans/:loanId/documents/status
 */
const getDocumentChecklist = async (req, res) => {
  const { loanId } = req.params;

  try {
    const loan = await LoanModel.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ status: "fail", message: "Loan not found." });
    }

    if (req.user.role === "agent" && loan.agent_id !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized." });
    }

    const checklist = [
      {
        doc_type: "aadhaar",
        label: "Aadhaar Card (Front)",
        path: loan.aadhaar_doc_path,
        uploaded: Boolean(loan.aadhaar_doc_path),
      },
      {
        doc_type: "aadhaar_back",
        label: "Aadhaar Card (Back)",
        path: loan.aadhaar_back_doc_path,
        uploaded: Boolean(loan.aadhaar_back_doc_path),
      },
      {
        doc_type: "pan",
        label: "PAN Card",
        path: loan.pan_doc_path,
        uploaded: Boolean(loan.pan_doc_path),
      },
      {
        doc_type: "business_reg",
        label: "Business Registration Proof",
        path: loan.business_reg_doc_path,
        uploaded: Boolean(loan.business_reg_doc_path),
      },
      {
        doc_type: "bank_statement",
        label: "Bank Statement 1 Year",
        path: loan.bank_statement_doc_path,
        uploaded: Boolean(loan.bank_statement_doc_path),
      },
      {
        doc_type: "nominee",
        label: "Nominee Document",
        path: loan.nominee_doc_path,
        uploaded: Boolean(loan.nominee_doc_path),
      },
    ];

    const allUploaded = checklist.every((d) => d.uploaded);

    return res.status(200).json({
      status: "success",
      data: {
        loan_id: loan.loan_id,
        loan_type: loan.loan_type,
        loan_status: loan.loan_status,
        checklist,
        all_uploaded: allUploaded,
        uploaded_count: checklist.filter((d) => d.uploaded).length,
        total_required: checklist.length,
      },
    });
  } catch (error) {
    console.error("Get Document Checklist Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  uploadLoanDocument,
  deleteLoanDocument,
  getDocumentChecklist,
};
