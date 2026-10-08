// lib/types/report.ts

export type ReportType =
  | "customers"
  | "loans"
  | "loan-applications"
  | "approved-loans"
  | "rejected-loans"
  | "disbursements"
  | "collections"
  | "overdue"
  | "outstanding"
  | "bank-disbursements"
  | "agent-performance"
  | "kyc-pending";

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
  agent_id?: number;
  loan_type?: string;
  bank_id?: number;
  min_amount?: number;
  max_amount?: number;
  kyc_status?: string;
}

export type ReportRow = Record<string, unknown>;

export interface ReportResponse {
  report_type: ReportType;
  filters_applied: ReportFilters;
  count: number;
  data: ReportRow[];
}
