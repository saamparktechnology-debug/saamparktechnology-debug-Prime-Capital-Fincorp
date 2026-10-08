// modules/analytics/hooks/useAnalytics.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analyticsService";
import type { DateRangePreset } from "../types";

export const analyticsKeys = {
  kpis: (range: string, start?: string, end?: string) =>
    ["analytics", "kpis", range, start, end] as const,
  funnel: ["analytics", "funnel"] as const,
  collectionsTrend: (months: number) =>
    ["analytics", "collections-trend", months] as const,
  customerTrend: (months: number) =>
    ["analytics", "customer-trend", months] as const,
  bankDistribution: ["analytics", "bank-distribution"] as const,
  overdueAging: ["analytics", "overdue-aging"] as const,
  recentActivity: ["analytics", "recent-activity"] as const,
  topCustomers: ["analytics", "top-customers"] as const,
  agentDashboard: (agentId?: number) =>
    ["analytics", "agent-dashboard", agentId ?? "me"] as const,
  adminOverview: ["analytics", "admin-overview"] as const,
  agentSummary: (agentId: number | string) =>
    ["analytics", "agent-summary", String(agentId)] as const,
  productMix: ["analytics", "product-mix"] as const,
  disbursementTrend: (months: number) =>
    ["analytics", "disbursement-trend", months] as const,
  loanTypeDist: ["analytics", "loan-type-dist"] as const,
  customersByCity: ["analytics", "customers-by-city"] as const,
  collectionEfficiency: ["analytics", "collection-efficiency"] as const,
  interestTypeSplit: ["analytics", "interest-type-split"] as const,
  agentLeaderboard: ["analytics", "agent-leaderboard"] as const,
  kycFunnel: ["analytics", "kyc-funnel"] as const,
};

export function useBusinessKpis(
  range: DateRangePreset,
  start?: string,
  end?: string,
) {
  return useQuery({
    queryKey: analyticsKeys.kpis(range, start, end),
    queryFn: () => analyticsService.getKpis({ range, start, end }),
  });
}

export function useLoanFunnel() {
  return useQuery({
    queryKey: analyticsKeys.funnel,
    queryFn: () => analyticsService.getLoanFunnel(),
  });
}

export function useCollectionsTrend(months = 6) {
  return useQuery({
    queryKey: analyticsKeys.collectionsTrend(months),
    queryFn: () => analyticsService.getCollectionsTrend({ months }),
  });
}

export function useCustomerTrend(months = 6) {
  return useQuery({
    queryKey: analyticsKeys.customerTrend(months),
    queryFn: () => analyticsService.getCustomerTrend({ months }),
  });
}

export function useBankDistribution() {
  return useQuery({
    queryKey: analyticsKeys.bankDistribution,
    queryFn: () => analyticsService.getBankDistribution(),
  });
}

export function useOverdueAging() {
  return useQuery({
    queryKey: analyticsKeys.overdueAging,
    queryFn: () => analyticsService.getOverdueAging(),
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: analyticsKeys.recentActivity,
    queryFn: () => analyticsService.getRecentActivity({ limit }),
  });
}

export function useTopCustomers(limit = 10) {
  return useQuery({
    queryKey: analyticsKeys.topCustomers,
    queryFn: () => analyticsService.getTopCustomers({ limit }),
  });
}

export function useAgentAnalytics(agentId?: number) {
  return useQuery({
    queryKey: analyticsKeys.agentDashboard(agentId),
    queryFn: () => analyticsService.agentDashboard(agentId),
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: analyticsKeys.adminOverview,
    queryFn: () => analyticsService.adminOverview(),
  });
}

export function useAgentSummary(agentId: number | string | undefined) {
  return useQuery({
    queryKey: analyticsKeys.agentSummary(agentId ?? ""),
    queryFn: () => analyticsService.agentSummary(agentId!),
    enabled: Boolean(agentId),
  });
}

export function useProductMix() {
  return useQuery({
    queryKey: analyticsKeys.productMix,
    queryFn: () => analyticsService.getProductMix(),
  });
}

export function useDisbursementTrend(months = 6) {
  return useQuery({
    queryKey: analyticsKeys.disbursementTrend(months),
    queryFn: () => analyticsService.getDisbursementTrend({ months }),
  });
}

export function useLoanTypeDistribution() {
  return useQuery({
    queryKey: analyticsKeys.loanTypeDist,
    queryFn: () => analyticsService.getLoanTypeDistribution(),
  });
}

export function useCustomersByCity(limit = 8) {
  return useQuery({
    queryKey: analyticsKeys.customersByCity,
    queryFn: () => analyticsService.getCustomersByCity({ limit }),
  });
}

export function useCollectionEfficiency() {
  return useQuery({
    queryKey: analyticsKeys.collectionEfficiency,
    queryFn: () => analyticsService.getCollectionEfficiency(),
  });
}

export function useInterestTypeSplit() {
  return useQuery({
    queryKey: analyticsKeys.interestTypeSplit,
    queryFn: () => analyticsService.getInterestTypeSplit(),
  });
}

export function useAgentLeaderboard(limit = 10) {
  return useQuery({
    queryKey: analyticsKeys.agentLeaderboard,
    queryFn: () => analyticsService.getAgentLeaderboard({ limit }),
  });
}

export function useKycFunnel() {
  return useQuery({
    queryKey: analyticsKeys.kycFunnel,
    queryFn: () => analyticsService.getKycFunnel(),
  });
}
