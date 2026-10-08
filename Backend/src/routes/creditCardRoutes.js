// src/routes/creditCardRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  listApplications,
  getApplication,
  createApplication,
  updateStatus,
} = require("../controllers/creditCardController");

const {
  uploadDocument,
  deleteDocument,
  getChecklist,
} = require("../controllers/creditCardDocumentController");

router.use(authenticateToken);

// ---------- Applications ----------
router.get("/applications", listApplications);
router.get("/applications/:id", getApplication);
router.post("/applications", createApplication);
router.patch("/applications/:id/status", updateStatus);

// ---------- FD Credit Card Documents ----------
router.get("/applications/:applicationId/documents/status", getChecklist);
router.post(
  "/applications/:applicationId/documents/:docType",
  upload.single("document"),
  uploadDocument,
);
router.delete(
  "/applications/:applicationId/documents/:docType",
  deleteDocument,
);

module.exports = router;
