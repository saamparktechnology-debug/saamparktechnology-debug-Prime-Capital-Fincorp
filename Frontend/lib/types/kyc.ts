// lib/types/kyc.ts
import type { KycStatus } from "@/lib/constants/statuses";

export interface KYCDocument {
  document_id: number;
  customer_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by_role: "admin" | "agent";
  created_at?: string;
}

export interface UploadDocumentPayload {
  document_type: string;
  file: File;
}

export interface ReviewKYCPayload {
  status: "approved" | "rejected";
  rejection_reason?: string;
}

export interface KYCReviewResponse {
  customer_id: number;
  kyc_status: KycStatus;
}

export interface ResubmitKYCResponse {
  customer_id: number;
  kyc_status: KycStatus;
}
