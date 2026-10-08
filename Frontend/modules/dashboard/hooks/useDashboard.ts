// modules/dashboard/hooks/useDashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import type { DashboardRange } from "../types";

export const dashKeys = {
  summary: (range: string, start?: string, end?: string) =>
    ["dashboard", "summary", range, start, end] as const,
  recentLoans: ["dashboard", "recent-loans"] as const,
  banks: ["dashboard", "banks"] as const,
  agents: ["dashboard", "agents"] as const,
  collections: ["dashboard", "collections"] as const,
  customerTrend: ["dashboard", "customer-trend"] as const,
  upcomingEmis: ["dashboard", "upcoming-emis"] as const,
};

export function useDashboardSummary(
  range: DashboardRange,
  start?: string,
  end?: string,
) {
  return useQuery({
    queryKey: dashKeys.summary(range, start, end),
    queryFn: () => dashboardService.getSummary({ range, start, end }),
  });
}

export function useRecentLoans(limit = 5) {
  return useQuery({
    queryKey: dashKeys.recentLoans,
    queryFn: () => dashboardService.getRecentLoans(limit),
  });
}

export function useBankBreakdown(limit = 5) {
  return useQuery({
    queryKey: dashKeys.banks,
    queryFn: () => dashboardService.getBanks(limit),
  });
}

export function useAgentPerformanceMini(limit = 5) {
  return useQuery({
    queryKey: dashKeys.agents,
    queryFn: () => dashboardService.getAgentPerformance(limit),
  });
}

export function useCollectionsMonthly(months = 6) {
  return useQuery({
    queryKey: dashKeys.collections,
    queryFn: () => dashboardService.getCollectionsMonthly(months),
  });
}

export function useCustomerTrend(months = 6) {
  return useQuery({
    queryKey: dashKeys.customerTrend,
    queryFn: () => dashboardService.getCustomerTrend(months),
  });
}

export function useUpcomingEmis() {
  return useQuery({
    queryKey: dashKeys.upcomingEmis,
    queryFn: () => dashboardService.getUpcomingEmis(),
  });
}
