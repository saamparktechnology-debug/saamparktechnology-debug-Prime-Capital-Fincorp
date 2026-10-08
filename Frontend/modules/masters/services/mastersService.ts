// modules/masters/services/mastersService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  BusinessType,
  BusinessCategory,
  CreateBusinessTypePayload,
  CreateBusinessCategoryPayload,
} from "../types";

export const mastersService = {
  // ---------- Business Types ----------
  async listBusinessTypes(activeOnly = false): Promise<BusinessType[]> {
    const res = await api.get(ENDPOINTS.MASTERS.BUSINESS_TYPES.LIST, {
      params: activeOnly ? { active: "true" } : undefined,
    });
    return unwrap<BusinessType[]>(res);
  },

  async createBusinessType(
    payload: CreateBusinessTypePayload,
  ): Promise<BusinessType> {
    const res = await api.post(
      ENDPOINTS.MASTERS.BUSINESS_TYPES.CREATE,
      payload,
    );
    return unwrap<BusinessType>(res);
  },

  async updateBusinessType(
    id: number | string,
    payload: Partial<CreateBusinessTypePayload>,
  ): Promise<void> {
    await api.put(ENDPOINTS.MASTERS.BUSINESS_TYPES.UPDATE(id), payload);
  },

  async deleteBusinessType(id: number | string): Promise<void> {
    await api.delete(ENDPOINTS.MASTERS.BUSINESS_TYPES.DELETE(id));
  },

  // ---------- Business Categories ----------
  async listBusinessCategories(activeOnly = false): Promise<BusinessCategory[]> {
    const res = await api.get(ENDPOINTS.MASTERS.BUSINESS_CATEGORIES.LIST, {
      params: activeOnly ? { active: "true" } : undefined,
    });
    return unwrap<BusinessCategory[]>(res);
  },

  async createBusinessCategory(
    payload: CreateBusinessCategoryPayload,
  ): Promise<BusinessCategory> {
    const res = await api.post(
      ENDPOINTS.MASTERS.BUSINESS_CATEGORIES.CREATE,
      payload,
    );
    return unwrap<BusinessCategory>(res);
  },

  async updateBusinessCategory(
    id: number | string,
    payload: Partial<CreateBusinessCategoryPayload>,
  ): Promise<void> {
    await api.put(ENDPOINTS.MASTERS.BUSINESS_CATEGORIES.UPDATE(id), payload);
  },

  async deleteBusinessCategory(id: number | string): Promise<void> {
    await api.delete(ENDPOINTS.MASTERS.BUSINESS_CATEGORIES.DELETE(id));
  },
};