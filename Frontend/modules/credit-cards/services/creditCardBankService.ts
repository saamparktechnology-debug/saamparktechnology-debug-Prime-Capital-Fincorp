// modules/credit-cards/services/creditCardBankService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { CreditCardBank, CreateCreditCardBankPayload } from "../types";

export const creditCardBankService = {
  async list(activeOnly = false): Promise<CreditCardBank[]> {
    const res = await api.get(ENDPOINTS.CREDIT_CARD_BANKS.LIST, {
      params: activeOnly ? { active: "true" } : undefined,
    });
    return unwrap<CreditCardBank[]>(res);
  },

  async create(payload: CreateCreditCardBankPayload): Promise<CreditCardBank> {
    const res = await api.post(ENDPOINTS.CREDIT_CARD_BANKS.CREATE, payload);
    return unwrap<CreditCardBank>(res);
  },

  async update(
    id: number | string,
    payload: Partial<CreateCreditCardBankPayload>,
  ): Promise<void> {
    await api.put(ENDPOINTS.CREDIT_CARD_BANKS.UPDATE(id), payload);
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(ENDPOINTS.CREDIT_CARD_BANKS.DELETE(id));
  },

  async uploadLogo(
    id: number | string,
    file: File,
  ): Promise<{ logo_path: string }> {
    const formData = new FormData();
    formData.append("logo", file);
    const res = await api.post(
      ENDPOINTS.CREDIT_CARD_BANKS.UPLOAD_LOGO(id),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return unwrap(res);
  },
};
