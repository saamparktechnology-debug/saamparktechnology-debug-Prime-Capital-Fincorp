// src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Access denied. No token provided.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid or expired token.",
      });
    }

    req.user = user; // Contains { id, role, email }
    next();
  });
};

// Middleware to restrict access strictly to Admins
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      status: "fail",
      message: "Access restricted. Admin privileges required.",
    });
  }
};

// Middleware to restrict access to Agents
const requireAgent = (req, res, next) => {
  if (req.user && req.user.role === "agent") {
    next();
  } else {
    return res.status(403).json({
      status: "fail",
      message: "Access restricted. Agent privileges required.",
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAgent,
};
