// modules/banks/hooks/useBanks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bankService } from "../services/bankService";
import { getErrorMessage } from "@/lib/api/client";
import type { CreateBankPayload, UpdateBankPayload } from "../types";

export const bankKeys = {
  all: ["banks"] as const,
  detail: (id: number | string) => ["banks", "detail", String(id)] as const,
};

export function useBanksList() {
  return useQuery({
    queryKey: bankKeys.all,
    queryFn: () => bankService.list(),
  });
}

export function useActiveBanks() {
  return useQuery({
    queryKey: [...bankKeys.all, "active"],
    queryFn: () => bankService.listActive(),
  });
}

export function useCreateBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBankPayload) => bankService.create(payload),
    onSuccess: () => {
      toast.success("Bank added successfully.");
      qc.invalidateQueries({ queryKey: bankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateBank(id: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBankPayload) =>
      bankService.update(id!, payload),
    onSuccess: () => {
      toast.success("Bank updated successfully.");
      qc.invalidateQueries({ queryKey: bankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => bankService.delete(id),
    onSuccess: () => {
      toast.success("Bank deleted.");
      qc.invalidateQueries({ queryKey: bankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUploadBankLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bankId, file }: { bankId: number | string; file: File }) =>
      bankService.uploadLogo(bankId, file),
    onSuccess: () => {
      toast.success("Logo uploaded.");
      qc.invalidateQueries({ queryKey: bankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useRemoveBankLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bankId }: { bankId: number | string }) =>
      bankService.removeLogo(bankId),
    onSuccess: () => {
      toast.success("Logo removed.");
      qc.invalidateQueries({ queryKey: bankKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
