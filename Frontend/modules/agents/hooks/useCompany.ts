// modules/agents/hooks/useCompany.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { companyService } from "../services/companyService";
import { getErrorMessage } from "@/lib/api/client";
import type { CompanyProfile } from "../types/agentKyc";

export const companyKeys = { all: ["company"] as const };

export function useCompany() {
  return useQuery({
    queryKey: companyKeys.all,
    queryFn: () => companyService.get(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<CompanyProfile>) => companyService.update(p),
    onSuccess: () => {
      toast.success("Company profile updated.");
      qc.invalidateQueries({ queryKey: companyKeys.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => companyService.uploadLogo(file),
    onSuccess: () => {
      toast.success("Logo uploaded.");
      qc.invalidateQueries({ queryKey: companyKeys.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
