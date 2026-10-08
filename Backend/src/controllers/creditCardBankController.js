// src/controllers/creditCardBankController.js
const CreditCardBankModel = require("../models/creditCardBankModel");
const audit = require("../utils/auditLog");
const fs = require("fs");
const { toRelativeUploadPath, toAbsolutePath } = require("../utils/filePaths");

// GET /credit-card-banks
const listBanks = async (req, res) => {
  try {
    const activeOnly =
      req.query.active === "true" || req.user?.role === "agent";
    const banks = await CreditCardBankModel.list(activeOnly);
    return res
      .status(200)
      .json({ status: "success", count: banks.length, data: banks });
  } catch (error) {
    console.error("List Credit Card Banks Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getBankById = async (req, res) => {
  try {
    const bank = await CreditCardBankModel.getById(req.params.id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }
    return res.status(200).json({ status: "success", data: bank });
  } catch (error) {
    console.error("Get Credit Card Bank Error:", error);
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
      target_audience,
      documents_required,
      is_active,
      display_order,
    } = req.body;

    if (!bank_name || !apply_link || !target_audience || !documents_required) {
      return res.status(400).json({
        status: "fail",
        message:
          "bank_name, apply_link, target_audience, documents_required are required.",
      });
    }

    const bankId = await CreditCardBankModel.create({
      bank_name,
      short_code,
      apply_link,
      tagline,
      target_audience,
      documents_required,
      is_active,
      display_order,
    });

    audit(req, "create", "credit_card_bank", bankId, null, {
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
    console.error("Create Credit Card Bank Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const updateBank = async (req, res) => {
  try {
    const bank = await CreditCardBankModel.getById(req.params.id);
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

    await CreditCardBankModel.update(req.params.id, req.body);

    audit(
      req,
      "update",
      "credit_card_bank",
      Number(req.params.id),
      old,
      req.body,
    );

    return res
      .status(200)
      .json({ status: "success", message: "Bank updated." });
  } catch (error) {
    console.error("Update Credit Card Bank Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const deleteBank = async (req, res) => {
  try {
    const bank = await CreditCardBankModel.getById(req.params.id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }

    try {
      const abs = toAbsolutePath(bank.logo_path);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      console.warn("Delete CC bank logo error:", e.message);
    }

    await CreditCardBankModel.delete(req.params.id);
    audit(req, "delete", "credit_card_bank", Number(req.params.id), bank, null);

    return res
      .status(200)
      .json({ status: "success", message: "Bank deleted." });
  } catch (error) {
    console.error("Delete Credit Card Bank Error:", error);
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

    const bank = await CreditCardBankModel.getById(id);
    if (!bank) {
      return res
        .status(404)
        .json({ status: "fail", message: "Bank not found." });
    }

    // Delete old logo
    try {
      const abs = toAbsolutePath(bank.logo_path);
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      console.warn("Delete old logo error:", e.message);
    }

    const relativePath = toRelativeUploadPath(req.file.path);
    await CreditCardBankModel.updateLogo(id, relativePath);

    audit(req, "upload_logo", "credit_card_bank", Number(id), null, {
      logo_path: relativePath,
    });

    return res.status(200).json({
      status: "success",
      message: "Logo uploaded.",
      data: { logo_path: relativePath },
    });
  } catch (error) {
    console.error("Upload Credit Card Bank Logo Error:", error);
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
