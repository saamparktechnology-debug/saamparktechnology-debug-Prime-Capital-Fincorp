// modules/masters/hooks/useMasters.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mastersService } from "../services/mastersService";
import { getErrorMessage } from "@/lib/api/client";
import type {
  CreateBusinessTypePayload,
  CreateBusinessCategoryPayload,
} from "../types";

export const mastersKeys = {
  businessTypes: (activeOnly = false) =>
    ["masters", "business-types", activeOnly] as const,
  businessCategories: (activeOnly = false) =>
    ["masters", "business-categories", activeOnly] as const,
};

// ---------- Business Types ----------
export function useBusinessTypes(activeOnly = false) {
  return useQuery({
    queryKey: mastersKeys.businessTypes(activeOnly),
    queryFn: () => mastersService.listBusinessTypes(activeOnly),
  });
}

export function useCreateBusinessType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBusinessTypePayload) =>
      mastersService.createBusinessType(payload),
    onSuccess: () => {
      toast.success("Business type added.");
      qc.invalidateQueries({ queryKey: ["masters", "business-types"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateBusinessType(id: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateBusinessTypePayload>) =>
      mastersService.updateBusinessType(id!, payload),
    onSuccess: () => {
      toast.success("Business type updated.");
      qc.invalidateQueries({ queryKey: ["masters", "business-types"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteBusinessType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => mastersService.deleteBusinessType(id),
    onSuccess: () => {
      toast.success("Business type deleted.");
      qc.invalidateQueries({ queryKey: ["masters", "business-types"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ---------- Business Categories ----------
export function useBusinessCategories(activeOnly = false) {
  return useQuery({
    queryKey: mastersKeys.businessCategories(activeOnly),
    queryFn: () => mastersService.listBusinessCategories(activeOnly),
  });
}

export function useCreateBusinessCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBusinessCategoryPayload) =>
      mastersService.createBusinessCategory(payload),
    onSuccess: () => {
      toast.success("Business category added.");
      qc.invalidateQueries({ queryKey: ["masters", "business-categories"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateBusinessCategory(id: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateBusinessCategoryPayload>) =>
      mastersService.updateBusinessCategory(id!, payload),
    onSuccess: () => {
      toast.success("Business category updated.");
      qc.invalidateQueries({ queryKey: ["masters", "business-categories"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteBusinessCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      mastersService.deleteBusinessCategory(id),
    onSuccess: () => {
      toast.success("Business category deleted.");
      qc.invalidateQueries({ queryKey: ["masters", "business-categories"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
