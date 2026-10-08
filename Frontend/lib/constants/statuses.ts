import type { LucideIcon } from "lucide-react";
import {
  Zap,
  UserRound,
  BriefcaseBusiness,
  House,
  Home,
  Car,
  ShieldCheck,
} from "lucide-react";

// ---------- KYC ----------
export const KYC_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type KycStatus = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

// ---------- Loan ----------
export const LOAN_STATUS = {
  DRAFT: "Draft",
  APPLIED: "Applied",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DISBURSED: "Disbursed",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
} as const;

export type LoanStatus = (typeof LOAN_STATUS)[keyof typeof LOAN_STATUS];

export const LOAN_STATUS_LIST: LoanStatus[] = Object.values(LOAN_STATUS);

export const LOAN_STATUS_EDITABLE_BY_AGENT: LoanStatus[] = [
  LOAN_STATUS.DRAFT,
  LOAN_STATUS.APPLIED,
  LOAN_STATUS.UNDER_REVIEW,
];

// ---------- EMI ----------
export const EMI_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  OVERDUE: "Overdue",
} as const;

export type EmiStatus = (typeof EMI_STATUS)[keyof typeof EMI_STATUS];

export const EMI_STATUS_LIST: EmiStatus[] = Object.values(EMI_STATUS);

// ---------- Loan types ----------

export interface LoanTypeMeta {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: LucideIcon;
  accent: "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan" | "orange";
}

export const LOAN_TYPE_CATALOG: LoanTypeMeta[] = [
  {
    id: 1,
    name: "Instant Loan",
    code: "IPL",
    description: "Quick approval with minimal documentation",
    icon: Zap,
    accent: "amber",
  },
  {
    id: 2,
    name: "Personal Loan",
    code: "PRL",
    description: "For personal expenses and emergencies",
    icon: UserRound,
    accent: "blue",
  },
  {
    id: 3,
    name: "Business Loan",
    code: "BNL",
    description: "Working capital for business growth",
    icon: BriefcaseBusiness,
    accent: "emerald",
  },
  {
    id: 4,
    name: "Loan Against Property",
    code: "LAP",
    description: "Secured loan against property",
    icon: House,
    accent: "violet",
  },
  {
    id: 5,
    name: "Home Loan",
    code: "HML",
    description: "For home purchase or construction",
    icon: Home,
    accent: "cyan",
  },
  {
    id: 6,
    name: "Car Loan",
    code: "CRL",
    description: "For new or used vehicle purchase",
    icon: Car,
    accent: "rose",
  },
  {
    id: 7,
    name: "KYC Loan",
    code: "KYC",
    description: "KYC-verified instant disbursement",
    icon: ShieldCheck,
    accent: "orange",
  },
];

export const LOAN_TYPES = LOAN_TYPE_CATALOG.map(
  (t) => t.name,
) as readonly string[];

export type LoanType = string;

// ---------- Roles ----------
export const ROLE = {
  ADMIN: "admin",
  AGENT: "agent",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
