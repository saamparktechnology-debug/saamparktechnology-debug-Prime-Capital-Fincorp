// modules/loans/hooks/useLoans.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loanService } from "../services/loanService";
import { getErrorMessage } from "@/lib/api/client";
import type {
  CreateLoanPayload,
  UpdateLoanPayload,
  UpdateLoanStatusPayload,
} from "../types";

export const loanKeys = {
  all: ["loans"] as const,
  byCustomer: (customerId: number | string) =>
    ["loans", "customer", String(customerId)] as const,
};

export function useLoansList() {
  return useQuery({
    queryKey: loanKeys.all,
    queryFn: () => loanService.list(),
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLoanPayload) => loanService.create(payload),
    onSuccess: () => {
      toast.success("Loan application submitted.");
      qc.invalidateQueries({ queryKey: loanKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateLoan(loanId: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateLoanPayload) =>
      loanService.update(loanId!, payload),
    onSuccess: () => {
      toast.success("Loan updated.");
      qc.invalidateQueries({ queryKey: loanKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateLoanStatus(loanId: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateLoanStatusPayload) =>
      loanService.updateStatus(loanId!, payload),
    onSuccess: (_, vars) => {
      toast.success(`Loan status updated to '${vars.loan_status}'.`);
      qc.invalidateQueries({ queryKey: loanKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
