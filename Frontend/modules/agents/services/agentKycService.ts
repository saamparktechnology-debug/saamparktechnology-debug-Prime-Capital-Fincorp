// modules/agents/services/agentKycService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AgentKyc,
  AgentKycWithAgent,
  AgentDocument,
  UpdateAgentKycPayload,
  ReviewAgentKycPayload,
} from "../types";

export const agentKycService = {
  // ---------- Agent self ----------
  async getMyKyc(): Promise<AgentKyc> {
    const res = await api.get(ENDPOINTS.AGENT_KYC.ME);
    return unwrap<AgentKyc>(res);
  },

  async updateMyKyc(payload: UpdateAgentKycPayload): Promise<void> {
    await api.patch(ENDPOINTS.AGENT_KYC.ME, payload);
  },

  // ---------- Admin ----------
  async getAgentKyc(agentId: number | string): Promise<AgentKycWithAgent> {
    const res = await api.get(ENDPOINTS.AGENT_KYC.DETAIL(agentId));
    return unwrap<AgentKycWithAgent>(res);
  },

  async updateAgentKyc(
    agentId: number | string,
    payload: UpdateAgentKycPayload,
  ): Promise<void> {
    await api.patch(ENDPOINTS.AGENT_KYC.UPDATE(agentId), payload);
  },

  async reviewAgentKyc(
    agentId: number | string,
    payload: ReviewAgentKycPayload,
  ): Promise<void> {
    await api.patch(ENDPOINTS.AGENT_KYC.REVIEW(agentId), payload);
  },

  // ---------- Documents ----------
  async listDocuments(agentId: number | string): Promise<AgentDocument[]> {
    const res = await api.get(ENDPOINTS.AGENT_KYC.LIST_DOCUMENTS(agentId));
    return unwrap<AgentDocument[]>(res);
  },

  async uploadDocument(
    agentId: number | string,
    payload: { document_type: string; file: File },
  ): Promise<{ document_id: number; file_name: string }> {
    const formData = new FormData();
    formData.append("document", payload.file);
    formData.append("document_type", payload.document_type);

    const res = await api.post(
      ENDPOINTS.AGENT_KYC.UPLOAD_DOCUMENT(agentId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return unwrap(res);
  },

  async deleteDocument(
    agentId: number | string,
    documentId: number | string,
  ): Promise<void> {
    await api.delete(ENDPOINTS.AGENT_KYC.DELETE_DOCUMENT(agentId, documentId));
  },
};
