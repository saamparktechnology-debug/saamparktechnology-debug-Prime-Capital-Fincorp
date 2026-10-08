// src/controllers/agentKycController.js
const AgentKycModel = require("../models/agentKycModel");
const AgentModel = require("../models/agentModel");
const audit = require("../utils/auditLog");
const fs = require("fs");
const { toRelativeUploadPath, toAbsolutePath } = require("../utils/filePaths");

// ---------- Agent: get own KYC ----------
const getMyKyc = async (req, res) => {
  try {
    const kyc = await AgentKycModel.findByAgentId(req.user.id);
    if (!kyc) {
      return res
        .status(404)
        .json({ status: "fail", message: "KYC record not found." });
    }
    return res.status(200).json({ status: "success", data: kyc });
  } catch (error) {
    console.error("Get My KYC Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

// ---------- Agent: update own KYC fields ----------
const updateMyKyc = async (req, res) => {
  try {
    const kyc = await AgentKycModel.findByAgentId(req.user.id);
    if (!kyc) {
      return res
        .status(404)
        .json({ status: "fail", message: "KYC record not found." });
    }

    if (kyc.kyc_status === "approved") {
      return res.status(400).json({
        status: "fail",
        message: "KYC is already approved. Contact admin to make changes.",
      });
    }

    const oldSnapshot = {
      full_name: kyc.full_name,
      primary_phone: kyc.primary_phone,
      email: kyc.email,
      current_address: kyc.current_address,
    };

    const success = await AgentKycModel.update(req.user.id, req.body);
    if (!success) {
      return res
        .status(400)
        .json({ status: "fail", message: "No valid fields to update." });
    }

    audit(req, "update", "agent_kyc", req.user.id, oldSnapshot, req.body);

    return res
      .status(200)
      .json({ status: "success", message: "KYC updated successfully." });
  } catch (error) {
    console.error("Update My KYC Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

// ---------- Admin: get any agent KYC ----------
const getAgentKyc = async (req, res) => {
  const { agentId } = req.params;
  try {
    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return res
        .status(404)
        .json({ status: "fail", message: "Agent not found." });
    }

    await AgentKycModel.ensureExists(agentId, {
      full_name: agent.full_name,
      email: agent.email,
      primary_phone: agent.phone_number,
    });

    const fullKyc = await AgentKycModel.findByAgentId(agentId);
    return res.status(200).json({
      status: "success",
      data: { agent, kyc: fullKyc },
    });
  } catch (error) {
    console.error("Get Agent KYC Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

// ---------- Admin: update any agent KYC ----------
const updateAgentKyc = async (req, res) => {
  const { agentId } = req.params;
  try {
    const kyc = await AgentKycModel.findByAgentId(agentId);
    if (!kyc) {
      return res
        .status(404)
        .json({ status: "fail", message: "KYC record not found." });
    }

    const success = await AgentKycModel.update(agentId, req.body);
    if (!success) {
      return res
        .status(400)
        .json({ status: "fail", message: "No valid fields to update." });
    }

    audit(req, "update", "agent_kyc", Number(agentId), kyc, req.body);

    return res
      .status(200)
      .json({ status: "success", message: "KYC updated successfully." });
  } catch (error) {
    console.error("Update Agent KYC Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

// ---------- Admin: review (approve/reject) ----------
const reviewAgentKyc = async (req, res) => {
  const { agentId } = req.params;
  const { status, rejection_reason, issue_date, valid_till } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ status: "fail", message: "Invalid KYC status." });
  }

  if (status === "rejected" && !rejection_reason) {
    return res
      .status(400)
      .json({ status: "fail", message: "Rejection reason is required." });
  }

  if (status === "approved" && (!issue_date || !valid_till)) {
    return res.status(400).json({
      status: "fail",
      message: "Issue date and valid till are required for approval.",
    });
  }

  try {
    const kyc = await AgentKycModel.findByAgentId(agentId);
    if (!kyc) {
      return res
        .status(404)
        .json({ status: "fail", message: "KYC record not found." });
    }

    await AgentKycModel.review(
      agentId,
      status,
      rejection_reason,
      req.user.id,
      issue_date || null,
      valid_till || null,
    );

    audit(
      req,
      status === "approved" ? "approve" : "reject",
      "agent_kyc",
      Number(agentId),
      { kyc_status: kyc.kyc_status },
      {
        kyc_status: status,
        rejection_reason: rejection_reason || null,
        issue_date: issue_date || null,
        valid_till: valid_till || null,
      },
    );

    return res
      .status(200)
      .json({ status: "success", message: `Agent KYC ${status}.` });
  } catch (error) {
    console.error("Review Agent KYC Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

// ---------- Documents: upload (admin only) ----------
const uploadDocument = async (req, res) => {
  const { agentId } = req.params;
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "No file uploaded or file type is invalid.",
      });
    }

    const { document_type } = req.body;
    if (!document_type) {
      return res
        .status(400)
        .json({ status: "fail", message: "document_type is required." });
    }

    const docId = await AgentKycModel.addDocument({
      agent_id: Number(agentId),
      document_type,
      file_name: req.file.originalname,
      file_path: toRelativeUploadPath(req.file.path),
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by_role: req.user.role,
    });

    audit(req, "upload", "agent_document", docId, null, {
      agent_id: Number(agentId),
      document_type,
      file_name: req.file.originalname,
    });

    return res.status(201).json({
      status: "success",
      message: "Document uploaded successfully.",
      data: { document_id: docId, file_name: req.file.originalname },
    });
  } catch (error) {
    console.error("Upload Agent Document Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

// ---------- Documents: list ----------
const listDocuments = async (req, res) => {
  const { agentId } = req.params;
  try {
    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return res
        .status(404)
        .json({ status: "fail", message: "Agent not found." });
    }

    const documents = await AgentKycModel.listDocuments(agentId);
    return res.status(200).json({
      status: "success",
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("List Agent Documents Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

// ---------- Documents: delete (admin only) ----------
const deleteDocument = async (req, res) => {
  const { agentId, documentId } = req.params;
  try {
    const doc = await AgentKycModel.findDocumentById(documentId);
    if (!doc || Number(doc.agent_id) !== Number(agentId)) {
      return res
        .status(404)
        .json({ status: "fail", message: "Document not found." });
    }

    try {
      const absPath = toAbsolutePath(doc.file_path);
      if (absPath && fs.existsSync(absPath)) {
        fs.unlinkSync(absPath);
      }
    } catch (fileErr) {
      console.error("Delete agent doc file error:", fileErr.message);
    }

    await AgentKycModel.deleteDocument(documentId);

    audit(
      req,
      "delete",
      "agent_document",
      Number(documentId),
      {
        agent_id: Number(agentId),
        document_type: doc.document_type,
        file_name: doc.file_name,
      },
      null,
    );

    return res
      .status(200)
      .json({ status: "success", message: "Document deleted." });
  } catch (error) {
    console.error("Delete Agent Document Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  getMyKyc,
  updateMyKyc,
  getAgentKyc,
  updateAgentKyc,
  reviewAgentKyc,
  uploadDocument,
  listDocuments,
  deleteDocument,
};
