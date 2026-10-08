// src/routes/bankRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const uploadLogoMiddleware = require("../middlewares/logoUploadMiddleware");

const {
  getAllBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
  uploadLogo,
  removeLogo,
} = require("../controllers/bankController");

router.use(authenticateToken);

// Read
router.get("/", getAllBanks);
router.get("/:id", getBankById);

// Write (admin)
router.post("/", requireAdmin, createBank);
router.put("/:id", requireAdmin, updateBank);
router.delete("/:id", requireAdmin, deleteBank);

// Logo
router.post(
  "/:id/logo",
  requireAdmin,
  uploadLogoMiddleware.single("logo"),
  uploadLogo,
);
router.delete("/:id/logo", requireAdmin, removeLogo);

module.exports = router;
