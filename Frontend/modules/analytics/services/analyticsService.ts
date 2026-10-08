// modules/analytics/services/analyticsService.ts
import { api, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  BusinessKpis,
  LoanFunnelRow,
  CollectionsTrendRow,
  CustomerTrendRow,
  BankDistributionRow,
  OverdueAgingRow,
  RecentActivity,
  TopCustomerRow,
  DateRangePreset,
  AdminAgentOverviewRow,
  AgentAnalytics,
  AgentProfileSummary,
  InterestTypeSplitRow,
  AgentLeaderboardRow,
  KycFunnel,
  CollectionEfficiency,
  CityDistributionRow,
  LoanTypeDistributionRow,
  DisbursementTrendRow,
  ProductMixRow,
} from "../types";

interface RangeParams {
  range: DateRangePreset;
  start?: string;
  end?: string;
  agent_id?: number;
}

export const analyticsService = {
  // ---------- Business-wide ----------
  async getKpis(params: RangeParams): Promise<BusinessKpis> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_KPIS, { params });
    return unwrap<BusinessKpis>(res);
  },

  async getLoanFunnel(params?: {
    agent_id?: number;
  }): Promise<LoanFunnelRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_FUNNEL, { params });
    return unwrap<LoanFunnelRow[]>(res);
  },

  async getCollectionsTrend(params?: {
    months?: number;
    agent_id?: number;
  }): Promise<CollectionsTrendRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_COLLECTIONS_TREND, {
      params,
    });
    return unwrap<CollectionsTrendRow[]>(res);
  },

  async getCustomerTrend(params?: {
    months?: number;
    agent_id?: number;
  }): Promise<CustomerTrendRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_CUSTOMER_TREND, {
      params,
    });
    return unwrap<CustomerTrendRow[]>(res);
  },

  async getBankDistribution(): Promise<BankDistributionRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_BANK_DISTRIBUTION);
    return unwrap<BankDistributionRow[]>(res);
  },

  async getOverdueAging(params?: {
    agent_id?: number;
  }): Promise<OverdueAgingRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_OVERDUE_AGING, {
      params,
    });
    return unwrap<OverdueAgingRow[]>(res);
  },

  async getRecentActivity(params?: {
    limit?: number;
    agent_id?: number;
  }): Promise<RecentActivity> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_RECENT_ACTIVITY, {
      params,
    });
    return unwrap<RecentActivity>(res);
  },

  async getTopCustomers(params?: {
    limit?: number;
    agent_id?: number;
  }): Promise<TopCustomerRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_TOP_CUSTOMERS, {
      params,
    });
    return unwrap<TopCustomerRow[]>(res);
  },

  // ---------- Agent-centric (existing) ----------
  async agentDashboard(agentId?: number): Promise<AgentAnalytics> {
    const res = await api.get(ENDPOINTS.ANALYTICS.AGENT_DASHBOARD, {
      params: agentId ? { agent_id: agentId } : undefined,
    });
    return unwrap<AgentAnalytics>(res);
  },

  async adminOverview(): Promise<AdminAgentOverviewRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.ADMIN_AGENTS_OVERVIEW);
    return unwrap<AdminAgentOverviewRow[]>(res);
  },

  async agentSummary(agentId: number | string): Promise<AgentProfileSummary> {
    const res = await api.get(ENDPOINTS.ANALYTICS.ADMIN_AGENT_SUMMARY(agentId));
    return unwrap<AgentProfileSummary>(res);
  },
  async getProductMix(params?: {
    agent_id?: number;
  }): Promise<ProductMixRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_PRODUCT_MIX, {
      params,
    });
    return unwrap<ProductMixRow[]>(res);
  },

  async getDisbursementTrend(params?: {
    months?: number;
    agent_id?: number;
  }): Promise<DisbursementTrendRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_DISBURSEMENT_TREND, {
      params,
    });
    return unwrap<DisbursementTrendRow[]>(res);
  },

  async getLoanTypeDistribution(params?: {
    agent_id?: number;
  }): Promise<LoanTypeDistributionRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_LOAN_TYPE_DIST, {
      params,
    });
    return unwrap<LoanTypeDistributionRow[]>(res);
  },

  async getCustomersByCity(params?: {
    limit?: number;
    agent_id?: number;
  }): Promise<CityDistributionRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_CUSTOMERS_BY_CITY, {
      params,
    });
    return unwrap<CityDistributionRow[]>(res);
  },

  async getCollectionEfficiency(params?: {
    agent_id?: number;
  }): Promise<CollectionEfficiency> {
    const res = await api.get(
      ENDPOINTS.ANALYTICS.BUSINESS_COLLECTION_EFFICIENCY,
      { params },
    );
    return unwrap<CollectionEfficiency>(res);
  },

  async getInterestTypeSplit(params?: {
    agent_id?: number;
  }): Promise<InterestTypeSplitRow[]> {
    const res = await api.get(
      ENDPOINTS.ANALYTICS.BUSINESS_INTEREST_TYPE_SPLIT,
      { params },
    );
    return unwrap<InterestTypeSplitRow[]>(res);
  },

  async getAgentLeaderboard(params?: {
    limit?: number;
  }): Promise<AgentLeaderboardRow[]> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_AGENT_LEADERBOARD, {
      params,
    });
    return unwrap<AgentLeaderboardRow[]>(res);
  },

  async getKycFunnel(params?: { agent_id?: number }): Promise<KycFunnel> {
    const res = await api.get(ENDPOINTS.ANALYTICS.BUSINESS_KYC_FUNNEL, {
      params,
    });
    return unwrap<KycFunnel>(res);
  },
};
