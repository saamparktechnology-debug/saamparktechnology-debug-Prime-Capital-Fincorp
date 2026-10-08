"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ccBankService } from "../services/ccBankService";
import { getErrorMessage } from "@/lib/api/client";
import type { CreateCreditCardBankPayload } from "../types";

export const ccBankKeys = {
  all: ["credit-card-banks"] as const,
  list: (activeOnly = false) =>
    ["credit-card-banks", "list", activeOnly] as const,
  detail: (id: number | string) =>
    ["credit-card-banks", "detail", String(id)] as const,
};

export function useCcBanks(activeOnly = false) {
  return useQuery({
    queryKey: ccBankKeys.list(activeOnly),
    queryFn: () => ccBankService.list(activeOnly),
  });
}

export function useCreateCcBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCreditCardBankPayload) =>
      ccBankService.create(payload),
    onSuccess: () => {
      toast.success("Bank added.");
      qc.invalidateQueries({ queryKey: ccBankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateCcBank(id: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateCreditCardBankPayload>) =>
      ccBankService.update(id!, payload),
    onSuccess: () => {
      toast.success("Bank updated.");
      qc.invalidateQueries({ queryKey: ccBankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteCcBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => ccBankService.remove(id),
    onSuccess: () => {
      toast.success("Bank deleted.");
      qc.invalidateQueries({ queryKey: ccBankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUploadCcBankLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number | string; file: File }) =>
      ccBankService.uploadLogo(id, file),
    onSuccess: () => {
      toast.success("Logo uploaded.");
      qc.invalidateQueries({ queryKey: ccBankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
