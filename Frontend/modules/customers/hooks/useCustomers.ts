// modules/customers/hooks/useCustomers.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerService } from "../services/customerService";
import { getErrorMessage } from "@/lib/api/client";
import type { CreateCustomerPayload } from "../types";

export const customerKeys = {
  all: ["customers"] as const,
  detail: (id: number | string) => ["customers", "detail", String(id)] as const,
};

export function useCustomersList() {
  return useQuery({
    queryKey: customerKeys.all,
    queryFn: () => customerService.list(),
  });
}

export function useCustomerDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ""),
    queryFn: () => customerService.detail(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) =>
      customerService.create(payload),
    onSuccess: () => {
      toast.success("Customer registered. KYC status is now pending.");
      qc.invalidateQueries({ queryKey: customerKeys.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
