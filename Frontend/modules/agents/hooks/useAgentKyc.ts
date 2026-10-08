// modules/agents/hooks/useAgentKyc.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { agentKycService } from "../services/agentKycService";
import { getErrorMessage } from "@/lib/api/client";
import type { UpdateAgentKycPayload, ReviewAgentKycPayload } from "../types";

export const agentKycKeys = {
  me: ["agent-kyc", "me"] as const,
  detail: (agentId: number | string) =>
    ["agent-kyc", "detail", String(agentId)] as const,
  documents: (agentId: number | string) =>
    ["agent-kyc", "documents", String(agentId)] as const,
};

// ---------- Agent self ----------
export function useMyAgentKyc() {
  return useQuery({
    queryKey: agentKycKeys.me,
    queryFn: () => agentKycService.getMyKyc(),
    retry: 1,
  });
}

export function useUpdateMyAgentKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAgentKycPayload) =>
      agentKycService.updateMyKyc(payload),
    onSuccess: () => {
      toast.success("KYC updated.");
      qc.invalidateQueries({ queryKey: agentKycKeys.me });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ---------- Admin ----------
export function useAgentKyc(agentId: number | string | undefined) {
  return useQuery({
    queryKey: agentKycKeys.detail(agentId ?? ""),
    queryFn: () => agentKycService.getAgentKyc(agentId!),
    enabled: Boolean(agentId),
  });
}

export function useUpdateAgentKyc(agentId: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAgentKycPayload) =>
      agentKycService.updateAgentKyc(agentId!, payload),
    onSuccess: () => {
      toast.success("Agent KYC updated.");
      if (agentId) {
        qc.invalidateQueries({ queryKey: agentKycKeys.detail(agentId) });
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useReviewAgentKyc(agentId: number | string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewAgentKycPayload) =>
      agentKycService.reviewAgentKyc(agentId!, payload),
    onSuccess: (_, vars) => {
      toast.success(`Agent KYC ${vars.status}.`);
      if (agentId) {
        qc.invalidateQueries({ queryKey: agentKycKeys.detail(agentId) });
      }
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ---------- Documents ----------
export function useAgentDocuments(agentId: number | string | undefined) {
  return useQuery({
    queryKey: agentKycKeys.documents(agentId ?? ""),
    queryFn: () => agentKycService.listDocuments(agentId!),
    enabled: Boolean(agentId),
  });
}

export function useUploadAgentDocument(agentId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { document_type: string; file: File }) =>
      agentKycService.uploadDocument(agentId, payload),
    onSuccess: () => {
      toast.success("Document uploaded.");
      qc.invalidateQueries({ queryKey: agentKycKeys.documents(agentId) });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteAgentDocument(agentId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number | string) =>
      agentKycService.deleteDocument(agentId, documentId),
    onSuccess: () => {
      toast.success("Document deleted.");
      qc.invalidateQueries({ queryKey: agentKycKeys.documents(agentId) });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
