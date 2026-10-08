// modules/audit/hooks/useAudit.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { auditService } from "../services/auditService";

export const auditKeys = {
  all: ["audits"] as const,
};

export function useAuditLogs() {
  return useQuery({
    queryKey: auditKeys.all,
    queryFn: () => auditService.list(),
    staleTime: 10_000, // fresh every 10s
    refetchOnWindowFocus: true, // live-updating feel
  });
}
