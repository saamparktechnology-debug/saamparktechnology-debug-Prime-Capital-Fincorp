// src/routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { fetchReport } = require("../controllers/reportController");

router.use(authenticateToken);
router.get("/:reportType", fetchReport);

module.exports = router;
