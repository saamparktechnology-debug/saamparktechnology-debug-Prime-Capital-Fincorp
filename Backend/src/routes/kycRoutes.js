// src/routes/kycRoutes.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { reviewKYC, resubmitKYC } = require("../controllers/kycController");
const DocumentModel = require("../models/documentModel");
const CustomerModel = require("../models/customerModel");
const audit = require("../utils/auditLog");
const { toRelativeUploadPath, toAbsolutePath } = require("../utils/filePaths");

router.use(authenticateToken);

// ---------- Admin: Review KYC ----------
router.patch("/:customerId/review", requireAdmin, reviewKYC);

// ---------- Agent: Resubmit rejected KYC ----------
router.post("/:customerId/resubmit", resubmitKYC);

// ---------- Upload KYC Document ----------
router.post(
  "/:customerId/documents",
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "fail",
          message: "No file uploaded or file type is invalid.",
        });
      }

      const { document_type } = req.body;
      if (!document_type) {
        return res.status(400).json({
          status: "fail",
          message: "document_type field is required.",
        });
      }

      const docId = await DocumentModel.create({
        customer_id: req.params.customerId,
        document_type,
        file_name: req.file.originalname,
        file_path: toRelativeUploadPath(req.file.path),
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_by_role: req.user.role,
      });

      audit(req, "upload", "document", docId, null, {
        customer_id: Number(req.params.customerId),
        document_type,
        file_name: req.file.originalname,
      });

      return res.status(201).json({
        status: "success",
        message: "Document uploaded successfully.",
        data: { document_id: docId, file_name: req.file.originalname },
      });
    } catch (error) {
      console.error("Upload Document Error:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error during document upload.",
      });
    }
  },
);

// ---------- List Documents ----------
router.get("/:customerId/documents", async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await CustomerModel.findById(
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

    const documents = await DocumentModel.findByCustomerIdScoped(
      customerId,
      req.user.role,
      req.user.id,
    );

    return res.status(200).json({
      status: "success",
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("Fetch Documents Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while fetching documents.",
    });
  }
});

// ---------- Delete Document ----------
router.delete("/:customerId/documents/:documentId", async (req, res) => {
  try {
    const { customerId, documentId } = req.params;

    const customer = await CustomerModel.findById(
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

    if (!["pending", "rejected"].includes(customer.kyc_status)) {
      return res.status(400).json({
        status: "fail",
        message:
          "Documents cannot be deleted once KYC is approved. Contact admin.",
      });
    }

    const doc = await DocumentModel.findById(documentId);
    if (!doc || Number(doc.customer_id) !== Number(customerId)) {
      return res.status(404).json({
        status: "fail",
        message: "Document not found for this customer.",
      });
    }

    // Delete physical file
    try {
      const absPath = toAbsolutePath(doc.file_path);
      if (absPath && fs.existsSync(absPath)) {
        fs.unlinkSync(absPath);
      }
    } catch (fileErr) {
      console.error("Delete file from disk error:", fileErr.message);
    }

    await DocumentModel.delete(documentId);

    audit(
      req,
      "delete",
      "document",
      Number(documentId),
      {
        customer_id: Number(customerId),
        document_type: doc.document_type,
        file_name: doc.file_name,
      },
      null,
    );

    return res.status(200).json({
      status: "success",
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Document Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error while deleting document.",
    });
  }
});

module.exports = router;
