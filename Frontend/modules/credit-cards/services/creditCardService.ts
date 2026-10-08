// modules/credit-cards/services/creditCardService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CreditCardApplication,
  CreateCreditCardApplicationPayload,
  CCStatus,
  CcDocumentChecklist,
} from "../types";

export const creditCardService = {
  async listApplications(filters?: {
    status?: string;
    card_type?: string;
    agent_id?: number;
    search?: string;
  }): Promise<CreditCardApplication[]> {
    const res = await api.get(ENDPOINTS.CREDIT_CARDS.APPLICATIONS.LIST, {
      params: filters,
    });
    return unwrap<CreditCardApplication[]>(res);
  },

  async getApplication(id: number | string): Promise<CreditCardApplication> {
    const res = await api.get(ENDPOINTS.CREDIT_CARDS.APPLICATIONS.DETAIL(id));
    return unwrap<CreditCardApplication>(res);
  },

  async createApplication(
    payload: CreateCreditCardApplicationPayload,
  ): Promise<CreditCardApplication> {
    const res = await api.post(
      ENDPOINTS.CREDIT_CARDS.APPLICATIONS.CREATE,
      payload,
    );
    return unwrap<CreditCardApplication>(res);
  },

  async updateStatus(
    id: number | string,
    payload: { status: CCStatus; notes?: string },
  ): Promise<void> {
    await api.patch(
      ENDPOINTS.CREDIT_CARDS.APPLICATIONS.UPDATE_STATUS(id),
      payload,
    );
  },

  // ---------- FD Documents ----------
  async getChecklist(
    applicationId: number | string,
  ): Promise<CcDocumentChecklist> {
    const res = await api.get(
      `${ENDPOINTS.CREDIT_CARDS.APPLICATIONS.DETAIL(applicationId)}/documents/status`,
    );
    return unwrap<CcDocumentChecklist>(res);
  },

  async uploadDocument(
    applicationId: number | string,
    docType: string,
    file: File,
  ): Promise<{ doc_type: string; file_path: string }> {
    const formData = new FormData();
    formData.append("document", file);
    const res = await api.post(
      `${ENDPOINTS.CREDIT_CARDS.APPLICATIONS.DETAIL(applicationId)}/documents/${docType}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return unwrap(res);
  },

  async deleteDocument(
    applicationId: number | string,
    docType: string,
  ): Promise<void> {
    await api.delete(
      `${ENDPOINTS.CREDIT_CARDS.APPLICATIONS.DETAIL(applicationId)}/documents/${docType}`,
    );
  },
};
