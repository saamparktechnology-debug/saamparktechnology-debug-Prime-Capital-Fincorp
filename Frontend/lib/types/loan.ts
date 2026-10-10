// lib/types/loan.ts
import type { LoanStatus, LoanType } from "@/lib/constants/statuses";

export type InterestType = "flat" | "reducing";

export interface Loan {
  loan_id: number;
  customer_id: number | null; // ← was number
  customer_full_name: string | null; // ← new
  customer_phone: string | null;
  aadhaar_number?: string | null;
  pan_number?: string | null;
  agent_id: number | null;
  loan_type: LoanType | string;
  bank_id?: number | null;
  bank_name?: string | null;
  bank_short_code?: string | null;
  aadhaar_doc_path?: string | null;
  pan_doc_path?: string | null;
  business_reg_doc_path?: string | null;
  bank_statement_doc_path?: string | null;

  // Joined fields
  first_name?: string | null; // ← NEW
  last_name?: string | null; // ← NEW
  primary_phone?: string | null; // ← NEW
  agent_name?: string | null; // ← NEW
  // New document fields
  aadhaar_back_doc_path?: string | null;
  nominee_doc_path?: string | null;

  // Nominee
  nominee_name?: string | null;
  nominee_relationship?: string | null;
  nominee_phone?: string | null;

  requested_amount: number;
  approved_amount?: number | null;
  tenure_months: number;
  interest_rate: number;
  interest_type?: "flat" | "reducing";
  purpose: string;
  loan_status: LoanStatus;
  bank_reference_number?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateLoanPayload {
  customer_id: number;
  aadhaar_number: string | null;
  pan_number: string | null;
  loan_type: LoanType | string;
  bank_id?: number | null;
  requested_amount: number;
  tenure_months: number;
  interest_rate: number;
  interest_type: InterestType;
  purpose: string;
  agent_id?: number;
  nominee_name?: string;
  nominee_relationship?: string;
  nominee_phone?: string;
}

export interface UpdateLoanPayload {
  loan_type?: LoanType | string;
  bank_id?: number | null;
  aadhaar_number?: string;
  pan_number?: string;
  requested_amount?: number;
  tenure_months?: number;
  interest_rate?: number;
  interest_type?: InterestType;
  purpose?: string;
}

export interface UpdateLoanStatusPayload {
  loan_status: LoanStatus;
  approved_amount?: number;
  bank_reference_number?: string;
  rejection_reason?: string;
  bank_id?: number;
}

export interface LoanStatusResponse {
  loan_id: number;
  loan_status: LoanStatus;
}
