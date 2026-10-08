// src/controllers/bankController.js
const BankModel = require("../models/bankModel");
const audit = require("../utils/auditLog");
const fs = require("fs");
const { toRelativeUploadPath, toAbsolutePath } = require("../utils/filePaths");

// GET /banks  (query: ?active=true for agents)
const getAllBanks = async (req, res) => {
  try {
    const activeOnly =
      req.query.active === "true" || req.user?.role === "agent";
    const banks = activeOnly
      ? await BankModel.listActive()
      : await BankModel.list();
    return res.status(200).json({
      status: "success",
      count: banks.length,
      data: banks,
    });
  } catch (error) {
    console.error("List Banks Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getBankById = async (req, res) => {
  try {
    const bank = await BankModel.getById(req.params.id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }
    return res.status(200).json({ status: "success", data: bank });
  } catch (error) {
    console.error("Get Bank Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const createBank = async (req, res) => {
  try {
    const {
      bank_name,
      short_code,
      tagline,
      apply_link,
      is_active,
      display_order,
    } = req.body;

    if (!bank_name) {
      return res.status(400).json({
        status: "fail",
        message: "bank_name is required.",
      });
    }

    const bankId = await BankModel.create({
      bank_name,
      short_code,
      tagline,
      apply_link,
      is_active,
      display_order,
    });

    audit(req, "create", "bank", bankId, null, {
      bank_name,
      short_code: short_code || null,
      apply_link: apply_link || null,
    });

    return res.status(201).json({
      status: "success",
      message: "Bank created.",
      data: { bank_id: bankId },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ status: "fail", message: "Bank name already exists." });
    }
    console.error("Create Bank Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const updateBank = async (req, res) => {
  try {
    const bank = await BankModel.getById(req.params.id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }

    const old = {
      bank_name: bank.bank_name,
      short_code: bank.short_code,
      tagline: bank.tagline,
      apply_link: bank.apply_link,
      is_active: bank.is_active,
    };

    await BankModel.update(req.params.id, req.body);

    audit(req, "update", "bank", Number(req.params.id), old, req.body);

    return res
      .status(200)
      .json({ status: "success", message: "Bank updated." });
  } catch (error) {
    console.error("Update Bank Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const deleteBank = async (req, res) => {
  try {
    const bank = await BankModel.getById(req.params.id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }

    try {
      const abs = toAbsolutePath(bank.logo_path);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      console.warn("Delete bank logo error:", e.message);
    }

    await BankModel.delete(req.params.id);
    audit(req, "delete", "bank", Number(req.params.id), bank, null);

    return res
      .status(200)
      .json({ status: "success", message: "Bank deleted." });
  } catch (error) {
    console.error("Delete Bank Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const uploadLogo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "No file uploaded." });
    }

    const bank = await BankModel.getById(id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }

    // Delete old
    try {
      const abs = toAbsolutePath(bank.logo_path);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      console.warn("Delete old logo error:", e.message);
    }

    const relativePath = toRelativeUploadPath(req.file.path);
    await BankModel.updateLogo(id, relativePath);

    audit(req, "upload_logo", "bank", Number(id), null, {
      logo_path: relativePath,
    });

    return res.status(200).json({
      status: "success",
      message: "Logo uploaded.",
      data: { logo_path: relativePath },
    });
  } catch (error) {
    console.error("Upload Bank Logo Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const removeLogo = async (req, res) => {
  try {
    const { id } = req.params;
    const bank = await BankModel.getById(id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }

    try {
      const abs = toAbsolutePath(bank.logo_path);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      console.warn("Delete logo error:", e.message);
    }

    await BankModel.update(id, { logo_path: null });

    audit(
      req,
      "remove_logo",
      "bank",
      Number(id),
      { logo_path: bank.logo_path },
      null,
    );

    return res
      .status(200)
      .json({ status: "success", message: "Logo removed." });
  } catch (error) {
    console.error("Remove Bank Logo Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  getAllBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
  uploadLogo,
  removeLogo,
};
