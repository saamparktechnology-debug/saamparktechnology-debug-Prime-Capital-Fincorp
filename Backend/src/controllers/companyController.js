// src/controllers/companyController.js
const CompanyModel = require("../models/companyModel");
const audit = require("../utils/auditLog");
const fs = require("fs");
const { toRelativeUploadPath, toAbsolutePath } = require("../utils/filePaths");

const getCompany = async (req, res) => {
  try {
    const company = await CompanyModel.get();
    return res.status(200).json({ status: "success", data: company });
  } catch (error) {
    console.error("Get Company Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const updateCompany = async (req, res) => {
  try {
    const old = await CompanyModel.get();
    await CompanyModel.update(req.body);
    audit(
      req,
      "update",
      "company_profile",
      old?.company_id ?? 0,
      old,
      req.body,
    );
    return res
      .status(200)
      .json({ status: "success", message: "Company profile updated." });
  } catch (error) {
    console.error("Update Company Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "No file uploaded." });
    }

    // Delete old logo
    try {
      const existing = await CompanyModel.get();
      const oldAbs = toAbsolutePath(existing?.logo_path);
      if (oldAbs && fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs);
    } catch (e) {
      console.warn("Delete old company logo error:", e.message);
    }

    const relativePath = toRelativeUploadPath(req.file.path);
    await CompanyModel.updateLogo(relativePath);

    audit(req, "upload", "company_logo", 0, null, {
      logo_path: relativePath,
      file_name: req.file.originalname,
    });

    return res.status(200).json({
      status: "success",
      message: "Logo uploaded.",
      data: { logo_path: relativePath },
    });
  } catch (error) {
    console.error("Upload Logo Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = { getCompany, updateCompany, uploadLogo };
