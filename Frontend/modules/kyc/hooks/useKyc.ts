// modules/kyc/hooks/useKyc.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { kycService } from "../services/kycService";
import { getErrorMessage } from "@/lib/api/client";
import type { ReviewKYCPayload } from "../types";

export const kycKeys = {
  documents: (customerId: number | string) =>
    ["kyc", "documents", String(customerId)] as const,
  customer: (customerId: number | string) =>
    ["customers", "detail", String(customerId)] as const,
};

export function useKycDocuments(customerId: number | string | undefined) {
  return useQuery({
    queryKey: kycKeys.documents(customerId ?? ""),
    queryFn: () => kycService.listDocuments(customerId!),
    enabled: Boolean(customerId),
  });
}

export function useUploadDocument(customerId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { document_type: string; file: File }) =>
      kycService.uploadDocument(customerId, payload),
    onSuccess: () => {
      toast.success("Document uploaded successfully.");
      qc.invalidateQueries({ queryKey: kycKeys.documents(customerId) });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useReviewKYC(customerId: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewKYCPayload) =>
      kycService.reviewKYC(customerId!, payload),
    onSuccess: (_, vars) => {
      toast.success(`KYC ${vars.status} successfully.`);
      if (customerId) {
        qc.invalidateQueries({ queryKey: kycKeys.customer(customerId) });
        qc.invalidateQueries({ queryKey: ["customers"] });
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useResubmitKYC(customerId: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => kycService.resubmitKYC(customerId!),
    onSuccess: () => {
      toast.success("KYC resubmitted. Status is now pending.");
      if (customerId) {
        qc.invalidateQueries({ queryKey: kycKeys.customer(customerId) });
        qc.invalidateQueries({ queryKey: ["customers"] });
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteDocument(customerId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number | string) =>
      kycService.deleteDocument(customerId, documentId),
    onSuccess: () => {
      toast.success("Document deleted.");
      qc.invalidateQueries({ queryKey: kycKeys.documents(customerId) });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
