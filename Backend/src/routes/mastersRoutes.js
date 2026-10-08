// src/routes/mastersRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
} = require("../middlewares/authMiddleware");

const businessTypeCtrl = require("../controllers/businessTypeController");
const businessCategoryCtrl = require("../controllers/businessCategoryController");

router.use(authenticateToken);

// ---------- Business Types ----------
router.get("/business-types", businessTypeCtrl.list);
router.get("/business-types/:id", businessTypeCtrl.getById);
router.post("/business-types", requireAdmin, businessTypeCtrl.create);
router.put("/business-types/:id", requireAdmin, businessTypeCtrl.update);
router.delete("/business-types/:id", requireAdmin, businessTypeCtrl.remove);

// ---------- Business Categories ----------
router.get("/business-categories", businessCategoryCtrl.list);
router.get("/business-categories/:id", businessCategoryCtrl.getById);
router.post("/business-categories", requireAdmin, businessCategoryCtrl.create);
router.put(
  "/business-categories/:id",
  requireAdmin,
  businessCategoryCtrl.update,
);
router.delete(
  "/business-categories/:id",
  requireAdmin,
  businessCategoryCtrl.remove,
);

module.exports = router;
