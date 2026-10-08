// modules/demat/hooks/useDemat.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dematService } from "../services/dematService";
import { getErrorMessage } from "@/lib/api/client";
import type {
  CreateDematBankPayload,
  CreateDematApplicationPayload,
  DematStatus,
} from "../types";

export const dematKeys = {
  banks: (activeOnly = false) => ["demat", "banks", activeOnly] as const,
  applications: (filters?: any) => ["demat", "applications", filters] as const,
};

// ---------- Banks ----------
export function useDematBanks(activeOnly = false) {
  return useQuery({
    queryKey: dematKeys.banks(activeOnly),
    queryFn: () => dematService.listBanks(activeOnly),
  });
}

export function useCreateDematBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDematBankPayload) =>
      dematService.createBank(payload),
    onSuccess: () => {
      toast.success("Bank added.");
      qc.invalidateQueries({ queryKey: ["demat", "banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateDematBank(id: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateDematBankPayload>) =>
      dematService.updateBank(id!, payload),
    onSuccess: () => {
      toast.success("Bank updated.");
      qc.invalidateQueries({ queryKey: ["demat", "banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteDematBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => dematService.deleteBank(id),
    onSuccess: () => {
      toast.success("Bank deleted.");
      qc.invalidateQueries({ queryKey: ["demat", "banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUploadDematLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bankId, file }: { bankId: number | string; file: File }) =>
      dematService.uploadLogo(bankId, file),
    onSuccess: () => {
      toast.success("Logo uploaded.");
      qc.invalidateQueries({ queryKey: ["demat", "banks"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ---------- Applications ----------
export function useDematApplications(filters?: {
  status?: string;
  bank_id?: number;
  agent_id?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: dematKeys.applications(filters),
    queryFn: () => dematService.listApplications(filters),
  });
}

export function useCreateDematApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDematApplicationPayload) =>
      dematService.createApplication(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["demat", "applications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateDematStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: number | string;
      status: DematStatus;
      notes?: string;
    }) => dematService.updateStatus(id, { status, notes }),
    onSuccess: () => {
      toast.success("Status updated.");
      qc.invalidateQueries({ queryKey: ["demat", "applications"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
