// modules/savings/services/savingsService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  SavingsBank,
  CreateSavingsBankPayload,
  SavingsApplication,
  CreateSavingsApplicationPayload,
  SavingsStatus,
} from "../types";

export const savingsService = {
  // ---------- Banks ----------
  async listBanks(activeOnly = false): Promise<SavingsBank[]> {
    const res = await api.get(ENDPOINTS.SAVINGS.BANKS.LIST, {
      params: activeOnly ? { active: "true" } : undefined,
    });
    return unwrap<SavingsBank[]>(res);
  },

  async createBank(payload: CreateSavingsBankPayload): Promise<SavingsBank> {
    const res = await api.post(ENDPOINTS.SAVINGS.BANKS.CREATE, payload);
    return unwrap<SavingsBank>(res);
  },

  async updateBank(
    id: number | string,
    payload: Partial<CreateSavingsBankPayload>,
  ): Promise<void> {
    await api.put(ENDPOINTS.SAVINGS.BANKS.UPDATE(id), payload);
  },

  async deleteBank(id: number | string): Promise<void> {
    await api.delete(ENDPOINTS.SAVINGS.BANKS.DELETE(id));
  },

  async uploadLogo(
    id: number | string,
    file: File,
  ): Promise<{ logo_path: string }> {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await api.post(
      ENDPOINTS.SAVINGS.BANKS.UPLOAD_LOGO(id),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return unwrap(res);
  },

  // ---------- Applications ----------
  async listApplications(filters?: {
    status?: string;
    bank_id?: number;
    agent_id?: number;
    search?: string;
  }): Promise<SavingsApplication[]> {
    const res = await api.get(ENDPOINTS.SAVINGS.APPLICATIONS.LIST, {
      params: filters,
    });
    return unwrap<SavingsApplication[]>(res);
  },

  async createApplication(
    payload: CreateSavingsApplicationPayload,
  ): Promise<SavingsApplication> {
    const res = await api.post(ENDPOINTS.SAVINGS.APPLICATIONS.CREATE, payload);
    return unwrap<SavingsApplication>(res);
  },

  async updateStatus(
    id: number | string,
    payload: { status: SavingsStatus; notes?: string },
  ): Promise<void> {
    await api.patch(ENDPOINTS.SAVINGS.APPLICATIONS.UPDATE_STATUS(id), payload);
  },
};
