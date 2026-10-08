// modules/dashboard/types/index.ts

export interface DashboardSummary {
  customers: { total: number; new_in_period: number };
  kyc: { approved: number; pending: number; rejected: number };
  agents: { total: number; active: number; new_in_period: number };
  banks: { total: number; active: number };
  loans: {
    total: number;
    active: number;
    total_disbursed: number;
    new_in_period: number;
  };
  collections: {
    collected_all_time: number;
    collected_in_period: number;
    outstanding: number;
    overdue: number;
  };
}

export interface RecentLoan {
  loan_id: number;
  customer_id: number;
  loan_type: string;
  requested_amount: string | number;
  approved_amount: string | number | null;
  loan_status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  primary_phone: string;
  bank_name: string | null;
}

export interface BankBreakdown {
  bank_id: number;
  bank_name: string;
  short_code: string | null;
  is_active: number;
  loan_count: number;
  total_disbursed: string | number;
}

export interface AgentMini {
  agent_id: number;
  full_name: string;
  email: string;
  is_active: number;
  total_customers: number;
  total_loans: number;
  portfolio_value: string | number;
}

export interface MonthlyPoint {
  month: string;
  collected?: string | number;
  count?: number;
}

export type DashboardRange = "today" | "this_month" | "this_fy" | "custom";
