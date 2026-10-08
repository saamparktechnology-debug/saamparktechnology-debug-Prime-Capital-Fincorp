// modules/loans/hooks/useLoanDocuments.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loanDocumentService } from "../services/loanDocumentService";
import { getErrorMessage } from "@/lib/api/client";

export const loanDocKeys = {
  checklist: (loanId: number | string) =>
    ["loans", "documents", String(loanId)] as const,
};

export function useLoanDocumentChecklist(loanId: number | string | undefined) {
  return useQuery({
    queryKey: loanDocKeys.checklist(loanId ?? ""),
    queryFn: () => loanDocumentService.getChecklist(loanId!),
    enabled: Boolean(loanId),
  });
}

export function useUploadLoanDocument(loanId: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docType, file }: { docType: string; file: File }) =>
      loanDocumentService.upload(loanId!, docType, file),
    onSuccess: () => {
      toast.success("Document uploaded.");
      if (loanId) {
        qc.invalidateQueries({ queryKey: loanDocKeys.checklist(loanId) });
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteLoanDocument(loanId: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docType: string) =>
      loanDocumentService.remove(loanId!, docType),
    onSuccess: () => {
      toast.success("Document removed.");
      if (loanId) {
        qc.invalidateQueries({ queryKey: loanDocKeys.checklist(loanId) });
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
