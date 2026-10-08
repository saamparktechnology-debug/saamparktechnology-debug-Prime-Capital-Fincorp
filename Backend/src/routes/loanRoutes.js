// src/routes/loanRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  createLoan,
  updateLoan,
  updateLoanStatusByAdmin,
  getLoans,
  generateEMISchedule,
} = require("../controllers/loanController");

const {
  uploadLoanDocument,
  deleteLoanDocument,
  getDocumentChecklist,
} = require("../controllers/loanDocumentController");

router.use(authenticateToken);

// ---------- Loans ----------
router.post("/", createLoan);
router.get("/", getLoans);
router.put("/:loanId", updateLoan);
router.patch("/:loanId/status", requireAdmin, updateLoanStatusByAdmin);
router.post("/:loanId/generate-emis", requireAdmin, generateEMISchedule);

// ---------- Loan Documents ----------
router.get("/:loanId/documents/status", getDocumentChecklist);
router.post(
  "/:loanId/documents/:docType",
  upload.single("document"),
  uploadLoanDocument,
);
router.delete("/:loanId/documents/:docType", deleteLoanDocument);

module.exports = router;
