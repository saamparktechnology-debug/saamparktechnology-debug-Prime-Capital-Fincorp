// modules/banks/services/bankService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Bank, CreateBankPayload, UpdateBankPayload } from "../types";

export const bankService = {
  async list(): Promise<Bank[]> {
    const res = await api.get(ENDPOINTS.BANKS.LIST);
    return unwrap<Bank[]>(res);
  },

  async listActive(): Promise<Bank[]> {
    const res = await api.get(ENDPOINTS.BANKS.LIST, {
      params: { active: "true" },
    });
    return unwrap<Bank[]>(res);
  },

  async detail(id: number | string): Promise<Bank> {
    const res = await api.get(ENDPOINTS.BANKS.DETAIL(id));
    return unwrap<Bank>(res);
  },

  async create(payload: CreateBankPayload): Promise<Bank> {
    const res = await api.post(ENDPOINTS.BANKS.CREATE, payload);
    return unwrap<Bank>(res);
  },

  async update(id: number | string, payload: UpdateBankPayload): Promise<void> {
    await api.put(ENDPOINTS.BANKS.UPDATE(id), payload);
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(ENDPOINTS.BANKS.DELETE(id));
  },

  async uploadLogo(
    id: number | string,
    file: File,
  ): Promise<{ logo_path: string }> {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await api.post(ENDPOINTS.BANKS.UPLOAD_LOGO(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res);
  },

  async removeLogo(id: number | string): Promise<void> {
    await api.delete(ENDPOINTS.BANKS.REMOVE_LOGO(id));
  },
};
