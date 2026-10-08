// modules/credit-cards/hooks/useCreditCardBanks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { creditCardBankService } from "../services/creditCardBankService";
import { getErrorMessage } from "@/lib/api/client";
import type { CreateCreditCardBankPayload } from "../types";

export const ccBankKeys = {
  all: ["credit-card-banks"] as const,
  active: ["credit-card-banks", "active"] as const,
};

export function useCreditCardBanks(activeOnly = false) {
  return useQuery({
    queryKey: activeOnly ? ccBankKeys.active : ccBankKeys.all,
    queryFn: () => creditCardBankService.list(activeOnly),
  });
}

export function useCreateCreditCardBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCreditCardBankPayload) =>
      creditCardBankService.create(payload),
    onSuccess: () => {
      toast.success("Bank added.");
      qc.invalidateQueries({ queryKey: ccBankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateCreditCardBank(id: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateCreditCardBankPayload>) =>
      creditCardBankService.update(id!, payload),
    onSuccess: () => {
      toast.success("Bank updated.");
      qc.invalidateQueries({ queryKey: ccBankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteCreditCardBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => creditCardBankService.delete(id),
    onSuccess: () => {
      toast.success("Bank deleted.");
      qc.invalidateQueries({ queryKey: ccBankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUploadCreditCardBankLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bankId, file }: { bankId: number | string; file: File }) =>
      creditCardBankService.uploadLogo(bankId, file),
    onSuccess: () => {
      toast.success("Logo uploaded.");
      qc.invalidateQueries({ queryKey: ccBankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
