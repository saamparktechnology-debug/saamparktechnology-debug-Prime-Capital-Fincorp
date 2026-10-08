const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");
const uploadLogo = require("../middlewares/logoUploadMiddleware");
const ctrl = require("../controllers/creditCardBankController");

router.use(authenticateToken);
router.get("/", ctrl.listBanks);
router.get("/:id", ctrl.getBankById);
router.post("/", requireAdmin, ctrl.createBank);
router.put("/:id", requireAdmin, ctrl.updateBank);
router.delete("/:id", requireAdmin, ctrl.deleteBank);
router.post(
  "/:id/logo",
  requireAdmin,
  uploadLogo.single("logo"),
  ctrl.uploadLogo,
);
module.exports = router;
