// modules/demat/services/dematService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  DematBank,
  CreateDematBankPayload,
  DematApplication,
  CreateDematApplicationPayload,
  DematStatus,
} from "../types";

export const dematService = {
  // ---------- Banks ----------
  async listBanks(activeOnly = false): Promise<DematBank[]> {
    const res = await api.get(ENDPOINTS.DEMAT.BANKS.LIST, {
      params: activeOnly ? { active: "true" } : undefined,
    });
    return unwrap<DematBank[]>(res);
  },

  async createBank(payload: CreateDematBankPayload): Promise<DematBank> {
    const res = await api.post(ENDPOINTS.DEMAT.BANKS.CREATE, payload);
    return unwrap<DematBank>(res);
  },

  async updateBank(
    id: number | string,
    payload: Partial<CreateDematBankPayload>,
  ): Promise<void> {
    await api.put(ENDPOINTS.DEMAT.BANKS.UPDATE(id), payload);
  },

  async deleteBank(id: number | string): Promise<void> {
    await api.delete(ENDPOINTS.DEMAT.BANKS.DELETE(id));
  },

  async uploadLogo(
    id: number | string,
    file: File,
  ): Promise<{ logo_path: string }> {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await api.post(
      ENDPOINTS.DEMAT.BANKS.UPLOAD_LOGO(id),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return unwrap(res);
  },

  // ---------- Applications ----------
  async listApplications(filters?: {
    status?: string;
    bank_id?: number;
    agent_id?: number;
    search?: string;
  }): Promise<DematApplication[]> {
    const res = await api.get(ENDPOINTS.DEMAT.APPLICATIONS.LIST, {
      params: filters,
    });
    return unwrap<DematApplication[]>(res);
  },

  async createApplication(
    payload: CreateDematApplicationPayload,
  ): Promise<DematApplication> {
    const res = await api.post(ENDPOINTS.DEMAT.APPLICATIONS.CREATE, payload);
    return unwrap<DematApplication>(res);
  },

  async updateStatus(
    id: number | string,
    payload: { status: DematStatus; notes?: string },
  ): Promise<void> {
    await api.patch(ENDPOINTS.DEMAT.APPLICATIONS.UPDATE_STATUS(id), payload);
  },
};
