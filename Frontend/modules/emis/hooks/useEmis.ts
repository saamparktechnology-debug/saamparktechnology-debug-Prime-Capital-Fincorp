// modules/emis/hooks/useEmis.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { emiService } from "../services/emiService";
import { getErrorMessage } from "@/lib/api/client";
import type { EmiStatus } from "../types";

export const emiKeys = {
  all: ["emis"] as const,
  upcoming: ["emis", "upcoming"] as const,
  byLoan: (loanId: number | string) =>
    ["emis", "loan", String(loanId)] as const,
};

export function useUpcomingEmis() {
  return useQuery({
    queryKey: emiKeys.upcoming,
    queryFn: () => emiService.upcoming(),
  });
}

export function useEmisByLoan(loanId: number | string | undefined) {
  return useQuery({
    queryKey: emiKeys.byLoan(loanId ?? ""),
    queryFn: () => emiService.byLoan(loanId!),
    enabled: Boolean(loanId),
  });
}

export function useUpdateEmiStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ emiId, status }: { emiId: number; status: EmiStatus }) =>
      emiService.updateStatus(emiId, status),
    onSuccess: (_, vars) => {
      toast.success(`EMI marked as '${vars.status}'.`);
      qc.invalidateQueries({ queryKey: emiKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useSendReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (emiId: number) => emiService.sendReminder(emiId),
    onSuccess: (data) => {
      toast.success(data?.message || "Reminder sent.");
      qc.invalidateQueries({ queryKey: emiKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
