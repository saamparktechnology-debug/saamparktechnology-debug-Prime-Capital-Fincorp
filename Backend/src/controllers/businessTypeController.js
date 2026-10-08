// src/controllers/businessTypeController.js
const BusinessTypeModel = require("../models/businessTypeModel");
const audit = require("../utils/auditLog");

const list = async (req, res) => {
  try {
    const activeOnly =
      req.query.active === "true" || req.user?.role === "agent";
    const types = await BusinessTypeModel.list(activeOnly);
    return res
      .status(200)
      .json({ status: "success", count: types.length, data: types });
  } catch (error) {
    console.error("List Business Types Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getById = async (req, res) => {
  try {
    const type = await BusinessTypeModel.getById(req.params.id);
    if (!type) {
      return res
        .status(404)
        .json({ status: "fail", message: "Business type not found." });
    }
    return res.status(200).json({ status: "success", data: type });
  } catch (error) {
    console.error("Get Business Type Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const create = async (req, res) => {
  try {
    const { type_name, description, is_active, display_order } = req.body;
    if (!type_name) {
      return res
        .status(400)
        .json({ status: "fail", message: "type_name is required." });
    }

    const id = await BusinessTypeModel.create({
      type_name,
      description,
      is_active,
      display_order,
    });

    audit(req, "create", "business_type", id, null, { type_name });

    return res
      .status(201)
      .json({ status: "success", message: "Created.", data: { type_id: id } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ status: "fail", message: "Business type already exists." });
    }
    console.error("Create Business Type Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const update = async (req, res) => {
  try {
    const existing = await BusinessTypeModel.getById(req.params.id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "fail", message: "Business type not found." });
    }

    await BusinessTypeModel.update(req.params.id, req.body);
    audit(
      req,
      "update",
      "business_type",
      Number(req.params.id),
      existing,
      req.body,
    );

    return res.status(200).json({ status: "success", message: "Updated." });
  } catch (error) {
    console.error("Update Business Type Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const remove = async (req, res) => {
  try {
    const existing = await BusinessTypeModel.getById(req.params.id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "fail", message: "Business type not found." });
    }

    await BusinessTypeModel.delete(req.params.id);
    audit(
      req,
      "delete",
      "business_type",
      Number(req.params.id),
      existing,
      null,
    );

    return res.status(200).json({ status: "success", message: "Deleted." });
  } catch (error) {
    console.error("Delete Business Type Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = { list, getById, create, update, remove };
