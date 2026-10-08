// lib/types/emi.ts
import type { EmiStatus } from "@/lib/constants/statuses";

export interface EMI {
  emi_id: number;
  loan_id: number;
  customer_id: number;
  installment_number: number;
  emi_amount: number;
  due_date: string;
  installments_left: number;
  status: EmiStatus;
  paid_date?: string | null;
}

export interface UpcomingEMI {
  emi_id: number;
  loan_id: number;
  emi_amount: number;
  due_date: string;
  status: EmiStatus;
  customer_id: number;
  first_name: string;
  last_name: string;
  primary_phone?: string | null;
  email_address?: string | null;
  loan_type: string;
  agent_id?: number;
}

export interface UpdateEmiStatusPayload {
  status: EmiStatus;
}
