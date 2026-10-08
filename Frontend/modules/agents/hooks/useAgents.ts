// modules/agents/hooks/useAgents.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { agentService } from "../services/agentService";
import { analyticsService } from "@/modules/analytics/services/analyticsService";
import { getErrorMessage } from "@/lib/api/client";
import type {
  CreateAgentPayload,
  UpdateAgentPermissionsPayload,
} from "../types";

export const agentKeys = {
  all: ["agents"] as const,
  detail: (id: number | string) => ["agents", "detail", String(id)] as const,
  permissions: (id: number | string) =>
    ["agents", "permissions", String(id)] as const,
};

export function useAgentsList() {
  return useQuery({
    queryKey: agentKeys.all,
    queryFn: () => agentService.list(),
  });
}

export function useAgentDetail(agentId: number | string | undefined) {
  return useQuery({
    queryKey: agentKeys.detail(agentId ?? ""),
    queryFn: () => agentService.detail(agentId!),
    enabled: Boolean(agentId),
  });
}

export function useAgentPermissions(agentId: number | undefined) {
  return useQuery({
    queryKey: agentKeys.permissions(agentId ?? ""),
    queryFn: () => agentService.getPermissions(agentId!),
    enabled: Boolean(agentId),
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAgentPayload) => agentService.create(payload),
    onSuccess: () => {
      toast.success("Agent created successfully with default permissions.");
      qc.invalidateQueries({ queryKey: agentKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useToggleAgentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      agentService.toggleStatus(id, is_active),
    onSuccess: (_, vars) => {
      toast.success(
        `Agent ${vars.is_active ? "activated" : "deactivated"} successfully.`,
      );
      qc.invalidateQueries({ queryKey: agentKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdatePermissions(agentId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAgentPermissionsPayload) =>
      agentService.updatePermissions(agentId!, payload),
    onSuccess: () => {
      toast.success("Permissions updated successfully.");
      qc.invalidateQueries({ queryKey: agentKeys.all });
      if (agentId) {
        qc.invalidateQueries({ queryKey: agentKeys.permissions(agentId) });
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useAgentSummary(agentId: number | string | undefined) {
  return useQuery({
    queryKey: ["agents", "summary", String(agentId ?? "")],
    queryFn: () => analyticsService.agentSummary(agentId!),
    enabled: Boolean(agentId),
  });
}
