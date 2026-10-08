// modules/reports/types/index.ts
export type { ReportType, ReportFilters, ReportRow } from "@/lib/types/report";

export interface ReportMeta {
  type: string;
  label: string;
  description: string;
  icon: string;
}

export const REPORT_TYPES: ReportMeta[] = [
  {
    type: "customers",
    label: "Customers",
    description: "All customer records with KYC status",
    icon: "Users",
  },
  {
    type: "loans",
    label: "All Loans",
    description: "Complete loan applications with status",
    icon: "FileSpreadsheet",
  },
  {
    type: "approved-loans",
    label: "Approved Loans",
    description: "Loans approved by admin",
    icon: "CheckCircle2",
  },
  {
    type: "rejected-loans",
    label: "Rejected Loans",
    description: "Loan applications that were rejected",
    icon: "XCircle",
  },
  {
    type: "disbursements",
    label: "Disbursements",
    description: "Loans disbursed by bank",
    icon: "Banknote",
  },
  {
    type: "collections",
    label: "Collections",
    description: "EMI payments received and pending",
    icon: "Wallet",
  },
  {
    type: "overdue",
    label: "Overdue EMIs",
    description: "EMIs past their due date with aging",
    icon: "AlertCircle",
  },
  {
    type: "outstanding",
    label: "Outstanding Balance",
    description: "Active loans with remaining balance",
    icon: "TrendingUp",
  },
  {
    type: "bank-disbursements",
    label: "Bank Disbursements",
    description: "Bank-wise disbursement totals",
    icon: "Landmark",
  },
  {
    type: "agent-performance",
    label: "Agent Performance",
    description: "Per-agent KPIs and portfolio",
    icon: "UserCog",
  },
  {
    type: "kyc-pending",
    label: "Pending KYC",
    description: "Customers awaiting KYC approval",
    icon: "Clock",
  },
];

export type ExportFormat = "csv" | "xlsx" | "pdf";
