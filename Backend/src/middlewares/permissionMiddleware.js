// src/middlewares/permissionMiddleware.js
const pool = require("../config/db");

const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    // console.log(req);
    // Admins bypass module-level permission checks
    if (req.user.role === "admin") {
      return next();
    }

    if (req.user.role === "agent") {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM agent_permissions WHERE agent_id = ? AND module_name = ?`,
          [req.user.id, moduleName],
        );

        if (rows.length === 0) {
          return res.status(403).json({
            status: "fail",
            message: `Access denied. No permissions configured for module: ${moduleName}`,
          });
        }

        const perm = rows[0];
        // action expected: 'can_create', 'can_read', 'can_update', 'can_delete'
        if (perm[action]) {
          return next();
        } else {
          const actionName = action.replace("can_", "");
          return res.status(403).json({
            status: "fail",
            message: `Access denied. You do not have '${actionName}' permission for the '${moduleName}' module.`,
          });
        }
      } catch (error) {
        console.error("Permission Check Error:", error);
        return res.status(500).json({
          status: "error",
          message: "Internal server error verifying permissions.",
        });
      }
    }

    return res
      .status(403)
      .json({ status: "fail", message: "Unauthorized role." });
  };
};

module.exports = checkPermission;
