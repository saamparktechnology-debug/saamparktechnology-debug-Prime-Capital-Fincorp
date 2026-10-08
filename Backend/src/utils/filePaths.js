// src/utils/filePaths.js
const path = require("path");

/**
 * Absolute root: <Backend>/uploads
 * src/utils/ → ../../uploads
 */
const UPLOADS_ROOT = path.join(__dirname, "../../uploads");

/**
 * Convert a multer absolute path → relative path stored in DB.
 *
 * Examples:
 *   D:\Saampark\Micro Finance\Backend\uploads\documents\x.pdf → documents/x.pdf
 *   /home/user/backend/uploads/logos/y.png                  → logos/y.png
 *   documents/already-relative.pdf                          → documents/already-relative.pdf
 */
const toRelativeUploadPath = (absPath) => {
  if (!absPath) return null;
  const normalized = absPath.replace(/\\/g, "/");
  if (normalized.includes("uploads/")) {
    return normalized.split("uploads/").pop().replace(/^\/+/, "");
  }
  return normalized.replace(/^\/+/, "");
};

/**
 * Convert a relative DB path → absolute disk path for delete/stat.
 */
const toAbsolutePath = (relativePath) => {
  if (!relativePath) return null;
  const clean = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return path.join(UPLOADS_ROOT, clean);
};

/**
 * Build the full public URL for a file (used only in tests/tools — frontend builds its own).
 */
const toPublicUrl = (relativePath) => {
  if (!relativePath) return null;
  const clean = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/uploads/${clean}`;
};

module.exports = {
  UPLOADS_ROOT,
  toRelativeUploadPath,
  toAbsolutePath,
  toPublicUrl,
};
