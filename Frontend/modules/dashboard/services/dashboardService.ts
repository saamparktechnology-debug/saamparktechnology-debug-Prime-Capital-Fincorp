// modules/dashboard/services/dashboardService.ts
import { api, unwrap } from "@/lib/api/client";
import type {
  DashboardSummary,
  RecentLoan,
  BankBreakdown,
  AgentMini,
  MonthlyPoint,
  DashboardRange,
} from "../types";
import { UpcomingEMI } from "@/lib/types";
import { ENDPOINTS } from "@/lib/api/endpoints";

export const dashboardService = {
  async getSummary(params: {
    range: DashboardRange;
    start?: string;
    end?: string;
  }): Promise<DashboardSummary> {
    const res = await api.get("/dashboard/summary", { params });
    return unwrap<DashboardSummary>(res);
  },

  async getRecentLoans(limit = 5): Promise<RecentLoan[]> {
    const res = await api.get("/dashboard/recent-loans", {
      params: { limit },
    });
    return unwrap<RecentLoan[]>(res);
  },

  async getBanks(limit = 5): Promise<BankBreakdown[]> {
    const res = await api.get("/dashboard/banks", { params: { limit } });
    return unwrap<BankBreakdown[]>(res);
  },

  async getAgentPerformance(limit = 5): Promise<AgentMini[]> {
    const res = await api.get("/dashboard/agent-performance", {
      params: { limit },
    });
    return unwrap<AgentMini[]>(res);
  },

  async getCollectionsMonthly(months = 6): Promise<MonthlyPoint[]> {
    const res = await api.get("/dashboard/collections-monthly", {
      params: { months },
    });
    return unwrap<MonthlyPoint[]>(res);
  },

  async getCustomerTrend(months = 6): Promise<MonthlyPoint[]> {
    const res = await api.get("/dashboard/customer-trend", {
      params: { months },
    });
    return unwrap<MonthlyPoint[]>(res);
  },

  async getUpcomingEmis(): Promise<UpcomingEMI[]> {
    const res = await api.get(ENDPOINTS.EMIS.UPCOMING);
    return unwrap<UpcomingEMI[]>(res);
  },
};
