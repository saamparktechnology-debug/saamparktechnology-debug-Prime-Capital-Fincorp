// src/routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
} = require("../controllers/customerController");

router.use(authenticateToken);

// Agents must have 'can_create' on 'customers' module to post
router.post("/", checkPermission("customers", "can_create"), createCustomer);

// Agents must have 'can_read' on 'customers' module to view list/details
router.get("/", checkPermission("customers", "can_read"), getCustomers);
router.get("/:id", checkPermission("customers", "can_read"), getCustomerById);

module.exports = router;
