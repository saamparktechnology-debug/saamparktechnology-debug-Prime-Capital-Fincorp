// src/routes/companyRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const {
  getCompany,
  updateCompany,
  uploadLogo,
} = require("../controllers/companyController");

router.use(authenticateToken);

router.get("/", getCompany);
router.put("/", requireAdmin, updateCompany);
router.post("/logo", requireAdmin, upload.single("logo"), uploadLogo);

module.exports = router;
