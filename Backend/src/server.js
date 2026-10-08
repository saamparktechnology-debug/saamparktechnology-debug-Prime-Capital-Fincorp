// src/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const agentRoutes = require("./routes/agentRoutes");
const customerRoutes = require("./routes/customerRoutes");
const kycRoutes = require("./routes/kycRoutes");
const loanRoutes = require("./routes/loanRoutes");
const emiRoutes = require("./routes/emiRoutes");
const auditRoutes = require("./routes/auditRoutes");
const reportRoutes = require("./routes/reportRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const bankRoutes = require("./routes/bankRoutes");
const ReminderService = require("./services/reminderService");
const dashboardRoutes = require("./routes/dashboardRoutes");
const agentKycRoutes = require("./routes/agentKycRoutes");
const companyRoutes = require("./routes/companyRoutes");
const dematRoutes = require("./routes/dematRoutes");
const creditCardRoutes = require("./routes/creditCardRoutes");
const savingsRoutes = require("./routes/savingsRoutes");
const mastersRoutes = require("./routes/mastersRoutes");
const ccBankRoutes = require("./routes/creditCardBankRoutes");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Import DB connection pool to verify on boot
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Production Security Enhancements ---

// 1. Secure HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  }),
);
// 2. CORS — restricted to frontend origin(s)
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

// 3. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Request Sanitization Middleware (Trims whitespace from top-level string inputs)
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (let key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
});

// 5. Stricter Rate Limiter for Authentication & OTP (Prevents Brute-Forcing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message:
      "Too many authentication attempts from this IP, please try again later.",
  },
});
app.use("/api/v1/auth/login", authLimiter);

// --- Health Check ---
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Microfinance Management System API is running successfully.",
    timestamp: new Date().toISOString(),
  });
});

// --- Routes ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/agents", agentRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.use("/api/v1/loans", loanRoutes);
app.use("/api/v1/emis", emiRoutes);
app.use("/api/v1/audits", auditRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/banks", bankRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/agent-kyc", agentKycRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/demat", dematRoutes);
app.use("/api/v1/credit-cards", creditCardRoutes);
app.use("/api/v1/savings", savingsRoutes);
app.use("/api/v1/masters", mastersRoutes);
app.use("/api/v1/credit-card-banks", ccBankRoutes);

// --- API Docs ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 404 Handler (before error handler) ---
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// --- Reminder Background Job ---
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const runReminderJob = async () => {
  try {
    await ReminderService.checkAndSendEmiReminders();
  } catch (err) {
    console.error("Reminder job failed:", err);
  }
};

// Run once on boot, then every 24h
setTimeout(runReminderJob, 5000); // 5 sec after boot to let DB settle
setInterval(runReminderJob, TWENTY_FOUR_HOURS);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});

module.exports = app;
