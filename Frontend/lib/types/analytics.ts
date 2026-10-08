// lib/types/analytics.ts

export interface StatusCount {
  count: number;
}

export interface LoanStatusCount extends StatusCount {
  loan_status: string;
  total_amount: number;
}

export interface CollectionStatusCount extends StatusCount {
  status: string;
  total_amount: number;
}

export interface CustomerStatusCount extends StatusCount {
  kyc_status: string;
}

export interface AgentAnalytics {
  customers: CustomerStatusCount[];
  loans: LoanStatusCount[];
  collections: CollectionStatusCount[];
}

export interface AdminAgentOverviewRow {
  agent_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  total_customers: number;
  total_loans: number;
  active_portfolio_value: number;
}

export interface AgentProfileSummary {
  profile: {
    agent_id: number;
    full_name: string;
    email: string;
    phone_number: string;
    is_active: boolean;
    created_at: string;
  };
  metrics: AgentAnalytics;
}
