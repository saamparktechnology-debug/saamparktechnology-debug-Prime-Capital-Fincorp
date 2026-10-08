// modules/kyc/services/kycService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  KYCDocument,
  ReviewKYCPayload,
  KYCReviewResponse,
  ResubmitKYCResponse,
} from "../types";

export const kycService = {
  async listDocuments(customerId: number | string): Promise<KYCDocument[]> {
    const res = await api.get(ENDPOINTS.KYC.LIST_DOCUMENTS(customerId));
    return unwrap<KYCDocument[]>(res);
  },

  async uploadDocument(
    customerId: number | string,
    payload: { document_type: string; file: File },
  ): Promise<{ document_id: number; file_name: string }> {
    const formData = new FormData();
    formData.append("document", payload.file);
    formData.append("document_type", payload.document_type);

    const res = await api.post(
      ENDPOINTS.KYC.UPLOAD_DOCUMENT(customerId),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return unwrap(res);
  },

  async reviewKYC(
    customerId: number | string,
    payload: ReviewKYCPayload,
  ): Promise<KYCReviewResponse> {
    const res = await api.patch(ENDPOINTS.KYC.REVIEW(customerId), payload);
    return unwrap<KYCReviewResponse>(res);
  },

  async resubmitKYC(customerId: number | string): Promise<ResubmitKYCResponse> {
    const res = await api.post(ENDPOINTS.KYC.RESUBMIT(customerId));
    return unwrap<ResubmitKYCResponse>(res);
  },

  async deleteDocument(
    customerId: number | string,
    documentId: number | string,
  ): Promise<void> {
    await api.delete(ENDPOINTS.KYC.DELETE_DOCUMENT(customerId, documentId));
  },
};
