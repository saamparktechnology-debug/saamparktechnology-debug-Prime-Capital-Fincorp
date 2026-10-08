// src/utils/auditLog.js
const AuditModel = require("../models/auditModel");

/**
 * Fire-and-forget audit helper.
 * Uses req.user when available; otherwise accepts explicit actor info
 * via overrideActor (useful during login where req.user isn't set).
 */
const audit = (
  req,
  action,
  targetEntity,
  targetId,
  oldValue = null,
  newValue = null,
  overrideActor = null,
) => {
  const actorType = overrideActor?.actorType || req.user?.role || "system";
  const actorId = overrideActor?.actorId ?? req.user?.id ?? 0;

  AuditModel.logAction(
    actorType,
    actorId,
    action,
    targetEntity,
    targetId,
    oldValue,
    newValue,
    req.ip,
  ).catch((err) => console.error("[AUDIT] Unhandled:", err.message));
};

module.exports = audit;
