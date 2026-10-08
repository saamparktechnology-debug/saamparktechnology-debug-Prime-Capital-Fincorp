// src/routes/dematRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const uploadLogo = require("../middlewares/logoUploadMiddleware");

const {
  listBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
  uploadLogo: uploadBankLogo,
} = require("../controllers/dematBankController");

const {
  listApplications,
  getApplication,
  createApplication,
  updateStatus,
} = require("../controllers/dematApplicationController");

router.use(authenticateToken);

// ---------- Banks ----------
router.get("/banks", listBanks);
router.get("/banks/:id", getBankById);
router.post("/banks", requireAdmin, createBank);
router.put("/banks/:id", requireAdmin, updateBank);
router.delete("/banks/:id", requireAdmin, deleteBank);
router.post(
  "/banks/:id/logo",
  requireAdmin,
  uploadLogo.single("logo"),
  uploadBankLogo,
);

// ---------- Applications ----------
router.get("/applications", listApplications);
router.get("/applications/:id", getApplication);
router.post("/applications", createApplication);
router.patch("/applications/:id/status", updateStatus);

module.exports = router;
