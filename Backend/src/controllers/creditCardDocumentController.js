// src/controllers/creditCardDocumentController.js
const fs = require("fs");
const CreditCardModel = require("../models/creditCardModel");
const audit = require("../utils/auditLog");
const { toRelativeUploadPath, toAbsolutePath } = require("../utils/filePaths");

const DOC_FIELD_MAP = {
  aadhaar: "aadhaar_doc_path",
  pan: "pan_doc_path",
};

const DOC_LABELS = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
};

// ---------- Upload ----------
const uploadDocument = async (req, res) => {
  const { applicationId, docType } = req.params;

  try {
    if (!DOC_FIELD_MAP[docType]) {
      return res.status(400).json({
        status: "fail",
        message: `Invalid docType. Allowed: ${Object.keys(DOC_FIELD_MAP).join(", ")}`,
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "No file uploaded." });
    }

    const app = await CreditCardModel.getApplicationById(applicationId);
    if (!app) {
      return res
        .status(404)
        .json({ status: "fail", message: "Application not found." });
    }

    // Agent scoping
    if (req.user.role === "agent" && app.agent_id !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized." });
    }

    // Only for FD credit cards
    if (app.card_type !== "fd") {
      return res.status(400).json({
        status: "fail",
        message: "Documents can only be uploaded for FD credit cards.",
      });
    }

    // Only before completion
    if (app.status !== "initiated") {
      return res.status(400).json({
        status: "fail",
        message: `Cannot modify documents at status '${app.status}'.`,
      });
    }

    // Delete old file if replacing
    const existingPath = app[DOC_FIELD_MAP[docType]];
    if (existingPath) {
      try {
        const abs = toAbsolutePath(existingPath);
        if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch (e) {
        console.warn("Delete old CC doc error:", e.message);
      }
    }

    const relativePath = toRelativeUploadPath(req.file.path);
    await CreditCardModel.updateDocumentPath(
      applicationId,
      DOC_FIELD_MAP[docType],
      relativePath,
    );

    audit(req, "upload", "credit_card_document", Number(applicationId), null, {
      doc_type: docType,
      label: DOC_LABELS[docType],
      file_name: req.file.originalname,
      file_path: relativePath,
    });

    return res.status(200).json({
      status: "success",
      message: `${DOC_LABELS[docType]} uploaded.`,
      data: { doc_type: docType, file_path: relativePath },
    });
  } catch (error) {
    console.error("Upload CC Document Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

// ---------- Delete ----------
const deleteDocument = async (req, res) => {
  const { applicationId, docType } = req.params;

  try {
    if (!DOC_FIELD_MAP[docType]) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid docType." });
    }

    const app = await CreditCardModel.getApplicationById(applicationId);
    if (!app) {
      return res
        .status(404)
        .json({ status: "fail", message: "Application not found." });
    }

    if (req.user.role === "agent" && app.agent_id !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized." });
    }

    if (app.status !== "initiated") {
      return res.status(400).json({
        status: "fail",
        message: `Cannot modify documents at status '${app.status}'.`,
      });
    }

    const existingPath = app[DOC_FIELD_MAP[docType]];
    if (!existingPath) {
      return res
        .status(404)
        .json({ status: "fail", message: "Document not found." });
    }

    try {
      const abs = toAbsolutePath(existingPath);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      console.warn("Delete CC doc file error:", e.message);
    }

    await CreditCardModel.updateDocumentPath(
      applicationId,
      DOC_FIELD_MAP[docType],
      null,
    );

    audit(
      req,
      "delete",
      "credit_card_document",
      Number(applicationId),
      { doc_type: docType, file_path: existingPath },
      null,
    );

    return res
      .status(200)
      .json({ status: "success", message: "Document deleted." });
  } catch (error) {
    console.error("Delete CC Document Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

// ---------- Checklist ----------
const getChecklist = async (req, res) => {
  const { applicationId } = req.params;

  try {
    const app = await CreditCardModel.getApplicationById(applicationId);
    if (!app) {
      return res
        .status(404)
        .json({ status: "fail", message: "Application not found." });
    }

    if (req.user.role === "agent" && app.agent_id !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "Unauthorized." });
    }

    const checklist = [
      {
        doc_type: "aadhaar",
        label: "Aadhaar Card",
        path: app.aadhaar_doc_path,
        uploaded: Boolean(app.aadhaar_doc_path),
      },
      {
        doc_type: "pan",
        label: "PAN Card",
        path: app.pan_doc_path,
        uploaded: Boolean(app.pan_doc_path),
      },
    ];

    const allUploaded = checklist.every((d) => d.uploaded);

    return res.status(200).json({
      status: "success",
      data: {
        application_id: app.application_id,
        card_type: app.card_type,
        status: app.status,
        checklist,
        all_uploaded: allUploaded,
        uploaded_count: checklist.filter((d) => d.uploaded).length,
        total_required: checklist.length,
      },
    });
  } catch (error) {
    console.error("Get CC Checklist Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  uploadDocument,
  deleteDocument,
  getChecklist,
};
