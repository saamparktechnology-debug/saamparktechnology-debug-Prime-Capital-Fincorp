// modules/savings/hooks/useSavings.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { savingsService } from "../services/savingsService";
import { getErrorMessage } from "@/lib/api/client";
import type {
  CreateSavingsBankPayload,
  CreateSavingsApplicationPayload,
  SavingsStatus,
} from "../types";

export const savingsKeys = {
  banks: (activeOnly = false) => ["savings", "banks", activeOnly] as const,
  applications: (filters?: any) =>
    ["savings", "applications", filters] as const,
};

// ---------- Banks ----------
export function useSavingsBanks(activeOnly = false) {
  return useQuery({
    queryKey: savingsKeys.banks(activeOnly),
    queryFn: () => savingsService.listBanks(activeOnly),
  });
}

export function useCreateSavingsBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSavingsBankPayload) =>
      savingsService.createBank(payload),
    onSuccess: () => {
      toast.success("Bank added.");
      qc.invalidateQueries({ queryKey: ["savings", "banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateSavingsBank(id: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateSavingsBankPayload>) =>
      savingsService.updateBank(id!, payload),
    onSuccess: () => {
      toast.success("Bank updated.");
      qc.invalidateQueries({ queryKey: ["savings", "banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteSavingsBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => savingsService.deleteBank(id),
    onSuccess: () => {
      toast.success("Bank deleted.");
      qc.invalidateQueries({ queryKey: ["savings", "banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUploadSavingsLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bankId, file }: { bankId: number | string; file: File }) =>
      savingsService.uploadLogo(bankId, file),
    onSuccess: () => {
      toast.success("Logo uploaded.");
      qc.invalidateQueries({ queryKey: ["savings", "banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ---------- Applications ----------
export function useSavingsApplications(filters?: {
  status?: string;
  bank_id?: number;
  agent_id?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: savingsKeys.applications(filters),
    queryFn: () => savingsService.listApplications(filters),
  });
}

export function useCreateSavingsApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSavingsApplicationPayload) =>
      savingsService.createApplication(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings", "applications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateSavingsStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: number | string;
      status: SavingsStatus;
      notes?: string;
    }) => savingsService.updateStatus(id, { status, notes }),
    onSuccess: () => {
      toast.success("Status updated.");
      qc.invalidateQueries({ queryKey: ["savings", "applications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
