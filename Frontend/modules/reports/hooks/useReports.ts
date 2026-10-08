// modules/reports/hooks/useReports.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/reportService";
import type { ReportFilters } from "../types";

// Stable string key for query key (order-independent)
const filterKey = (filters: ReportFilters): string => {
  const sorted = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(sorted);
};

export const reportKeys = {
  fetch: (type: string, filters: ReportFilters) =>
    ["reports", type, filterKey(filters)] as const,
};

export function useReport(
  reportType: string | null,
  filters: ReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: reportKeys.fetch(reportType ?? "", filters),
    queryFn: () => reportService.fetch(reportType!, filters),
    enabled: Boolean(reportType) && enabled,
    staleTime: 30_000,
  });
}
