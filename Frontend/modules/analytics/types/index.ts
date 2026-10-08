// modules/analytics/types/index.ts
export type {
  AgentAnalytics,
  AdminAgentOverviewRow,
  AgentProfileSummary,
  CustomerStatusCount,
  LoanStatusCount,
  CollectionStatusCount,
} from "@/lib/types/analytics";

export interface BusinessKpis {
  customers: {
    total: number;
    new_in_period: number;
    kyc_approved: number;
    kyc_pending: number;
    kyc_rejected: number;
  };
  loans: {
    total: number;
    new_in_period: number;
    total_disbursed: number;
    active_portfolio: number;
    pending_applications: number;
    approved_awaiting_disb: number;
  };
  emis: {
    total_collected: number;
    total_outstanding: number;
    total_overdue: number;
    collected_in_period: number;
    pending_in_period: number;
    overdue_in_period: number;
    overdue_count_in_period: number;
  };
}

export interface LoanFunnelRow {
  loan_status: string;
  count: number;
  amount: string | number;
}

export interface CollectionsTrendRow {
  month: string;
  collected: string | number;
  pending: string | number;
  overdue: string | number;
}

export interface CustomerTrendRow {
  month: string;
  count: number;
}

export interface BankDistributionRow {
  bank_id: number;
  bank_name: string;
  short_code: string | null;
  loan_count: number;
  total_amount: string | number;
}

export interface OverdueAgingRow {
  bucket: string;
  count: number;
  amount: string | number;
}

export interface RecentActivity {
  loans: Array<{
    loan_id: number;
    loan_type: string;
    requested_amount: string | number;
    loan_status: string;
    created_at: string;
    first_name: string;
    last_name: string;
    customer_id: number;
  }>;
  collections: Array<{
    emi_id: number;
    emi_amount: string | number;
    paid_date: string;
    status: string;
    first_name: string;
    last_name: string;
    customer_id: number;
    loan_id: number;
  }>;
}

export interface TopCustomerRow {
  customer_id: number;
  first_name: string;
  last_name: string;
  primary_phone: string;
  kyc_status: string;
  loan_count: number;
  total_amount: string | number;
}

export type DateRangePreset =
  | "today"
  | "this_month"
  | "this_fy"
  | "custom"
  | "all";

export interface ProductMixRow {
  product: string;
  count: number;
  color: string;
}

export interface DisbursementTrendRow {
  month: string;
  count: number;
  disbursed: string | number;
}

export interface LoanTypeDistributionRow {
  loan_type: string;
  count: number;
  total_amount: string | number;
}

export interface CityDistributionRow {
  city: string;
  count: number;
}

export interface CollectionEfficiency {
  collected: number;
  outstanding: number;
  overdue: number;
  efficiency: number;
  overdueRate: number;
}

export interface InterestTypeSplitRow {
  interest_type: string;
  count: number;
  total_amount: string | number;
}

export interface AgentLeaderboardRow {
  agent_id: number;
  full_name: string;
  email: string;
  is_active: number;
  total_customers: number;
  total_loans: number;
  portfolio_value: string | number;
  total_collected: string | number;
}

export interface KycFunnel {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
