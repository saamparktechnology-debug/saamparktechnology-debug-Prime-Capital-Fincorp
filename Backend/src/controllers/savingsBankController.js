// src/controllers/savingsBankController.js
const SavingsModel = require("../models/savingsModel");
const audit = require("../utils/auditLog");
const fs = require("fs");
const { toRelativeUploadPath, toAbsolutePath } = require("../utils/filePaths");

const listBanks = async (req, res) => {
  try {
    const activeOnly =
      req.query.active === "true" || req.user?.role === "agent";
    const banks = await SavingsModel.listBanks(activeOnly);
    return res
      .status(200)
      .json({ status: "success", count: banks.length, data: banks });
  } catch (error) {
    console.error("List Savings Banks Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getBankById = async (req, res) => {
  try {
    const bank = await SavingsModel.getBankById(req.params.id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }
    return res.status(200).json({ status: "success", data: bank });
  } catch (error) {
    console.error("Get Savings Bank Error:", error);
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
      apply_link,
      tagline,
      is_active,
      display_order,
    } = req.body;
    if (!bank_name || !apply_link) {
      return res.status(400).json({
        status: "fail",
        message: "bank_name and apply_link are required.",
      });
    }

    const bankId = await SavingsModel.createBank({
      bank_name,
      short_code,
      apply_link,
      tagline,
      is_active,
      display_order,
    });

    audit(req, "create", "savings_bank", bankId, null, {
      bank_name,
      apply_link,
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
    console.error("Create Savings Bank Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const updateBank = async (req, res) => {
  try {
    const bank = await SavingsModel.getBankById(req.params.id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }

    const old = {
      bank_name: bank.bank_name,
      apply_link: bank.apply_link,
      is_active: bank.is_active,
    };

    await SavingsModel.updateBank(req.params.id, req.body);

    audit(req, "update", "savings_bank", Number(req.params.id), old, req.body);

    return res
      .status(200)
      .json({ status: "success", message: "Bank updated." });
  } catch (error) {
    console.error("Update Savings Bank Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const deleteBank = async (req, res) => {
  try {
    const bank = await SavingsModel.getBankById(req.params.id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }

    try {
      const abs = toAbsolutePath(bank.logo_path);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      console.warn("Delete savings bank logo error:", e.message);
    }

    await SavingsModel.deleteBank(req.params.id);
    audit(req, "delete", "savings_bank", Number(req.params.id), bank, null);

    return res
      .status(200)
      .json({ status: "success", message: "Bank deleted." });
  } catch (error) {
    console.error("Delete Savings Bank Error:", error);
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

    const bank = await SavingsModel.getBankById(id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }

    try {
      const abs = toAbsolutePath(bank.logo_path);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      console.warn("Delete old logo error:", e.message);
    }

    const relativePath = toRelativeUploadPath(req.file.path);
    await SavingsModel.updateBankLogo(id, relativePath);

    audit(req, "upload_logo", "savings_bank", Number(id), null, {
      logo_path: relativePath,
    });

    return res.status(200).json({
      status: "success",
      message: "Logo uploaded.",
      data: { logo_path: relativePath },
    });
  } catch (error) {
    console.error("Upload Savings Bank Logo Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  listBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
  uploadLogo,
};
