// src/controllers/businessCategoryController.js
const BusinessCategoryModel = require("../models/businessCategoryModel");
const audit = require("../utils/auditLog");

const list = async (req, res) => {
  try {
    const activeOnly =
      req.query.active === "true" || req.user?.role === "agent";
    const categories = await BusinessCategoryModel.list(activeOnly);
    return res
      .status(200)
      .json({ status: "success", count: categories.length, data: categories });
  } catch (error) {
    console.error("List Business Categories Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const getById = async (req, res) => {
  try {
    const cat = await BusinessCategoryModel.getById(req.params.id);
    if (!cat) {
      return res
        .status(404)
        .json({ status: "fail", message: "Business category not found." });
    }
    return res.status(200).json({ status: "success", data: cat });
  } catch (error) {
    console.error("Get Business Category Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const create = async (req, res) => {
  try {
    const { category_name, description, is_active, display_order } = req.body;
    if (!category_name) {
      return res
        .status(400)
        .json({ status: "fail", message: "category_name is required." });
    }

    const id = await BusinessCategoryModel.create({
      category_name,
      description,
      is_active,
      display_order,
    });

    audit(req, "create", "business_category", id, null, { category_name });

    return res.status(201).json({
      status: "success",
      message: "Created.",
      data: { category_id: id },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ status: "fail", message: "Business category already exists." });
    }
    console.error("Create Business Category Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const update = async (req, res) => {
  try {
    const existing = await BusinessCategoryModel.getById(req.params.id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "fail", message: "Business category not found." });
    }

    await BusinessCategoryModel.update(req.params.id, req.body);
    audit(
      req,
      "update",
      "business_category",
      Number(req.params.id),
      existing,
      req.body,
    );

    return res.status(200).json({ status: "success", message: "Updated." });
  } catch (error) {
    console.error("Update Business Category Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

const remove = async (req, res) => {
  try {
    const existing = await BusinessCategoryModel.getById(req.params.id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "fail", message: "Business category not found." });
    }

    await BusinessCategoryModel.delete(req.params.id);
    audit(
      req,
      "delete",
      "business_category",
      Number(req.params.id),
      existing,
      null,
    );

    return res.status(200).json({ status: "success", message: "Deleted." });
  } catch (error) {
    console.error("Delete Business Category Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = { list, getById, create, update, remove };
