// modules/agents/services/companyService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { CompanyProfile } from "../types/agentKyc";

export const companyService = {
  async get(): Promise<CompanyProfile> {
    const res = await api.get(ENDPOINTS.COMPANY.GET);
    return unwrap<CompanyProfile>(res);
  },

  async update(payload: Partial<CompanyProfile>): Promise<void> {
    await api.put(ENDPOINTS.COMPANY.UPDATE, payload);
  },

  async uploadLogo(file: File): Promise<{ logo_path: string }> {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await api.post(ENDPOINTS.COMPANY.UPLOAD_LOGO, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res);
  },
};
