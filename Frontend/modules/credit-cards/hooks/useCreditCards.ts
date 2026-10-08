// modules/credit-cards/hooks/useCreditCards.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { creditCardService } from "../services/creditCardService";
import { getErrorMessage } from "@/lib/api/client";
import type { CreateCreditCardApplicationPayload, CCStatus } from "../types";

export const ccKeys = {
  applications: (filters?: any) =>
    ["credit-cards", "applications", filters] as const,
  checklist: (applicationId: number | string) =>
    ["credit-cards", "checklist", String(applicationId)] as const,
};

// ---------- Applications ----------
export function useCreditCardApplications(filters?: {
  status?: string;
  card_type?: string;
  agent_id?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ccKeys.applications(filters),
    queryFn: () => creditCardService.listApplications(filters),
  });
}

export function useCreateCreditCardApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCreditCardApplicationPayload) =>
      creditCardService.createApplication(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credit-cards", "applications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateCCStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: number | string;
      status: CCStatus;
      notes?: string;
    }) => creditCardService.updateStatus(id, { status, notes }),
    onSuccess: () => {
      toast.success("Status updated.");
      qc.invalidateQueries({ queryKey: ["credit-cards", "applications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ---------- FD Documents ----------
export function useCcChecklist(applicationId: number | string | undefined) {
  return useQuery({
    queryKey: ccKeys.checklist(applicationId ?? ""),
    queryFn: () => creditCardService.getChecklist(applicationId!),
    enabled: Boolean(applicationId),
  });
}

export function useUploadCcDocument(
  applicationId: number | string | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docType, file }: { docType: string; file: File }) =>
      creditCardService.uploadDocument(applicationId!, docType, file),
    onSuccess: () => {
      toast.success("Document uploaded.");
      if (applicationId) {
        qc.invalidateQueries({ queryKey: ccKeys.checklist(applicationId) });
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteCcDocument(
  applicationId: number | string | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docType: string) =>
      creditCardService.deleteDocument(applicationId!, docType),
    onSuccess: () => {
      toast.success("Document removed.");
      if (applicationId) {
        qc.invalidateQueries({ queryKey: ccKeys.checklist(applicationId) });
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
