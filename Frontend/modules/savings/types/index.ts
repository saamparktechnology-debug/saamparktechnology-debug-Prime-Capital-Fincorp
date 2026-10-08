// modules/savings/types/index.ts

export interface SavingsBank {
  bank_id: number;
  bank_name: string;
  short_code: string | null;
  logo_path: string | null;
  apply_link: string;
  tagline: string | null;
  is_active: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSavingsBankPayload {
  bank_name: string;
  short_code?: string;
  apply_link: string;
  tagline?: string;
  is_active?: number;
  display_order?: number;
}

export type SavingsStatus = "initiated" | "completed" | "cancelled";

export interface SavingsApplication {
  application_id: number;
  bank_id: number;
  agent_id: number;
  full_name: string;
  email: string;
  phone: string;
  aadhaar_number: string | null;
  pan_number: string | null;
  pincode: string;
  status: SavingsStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  bank_name?: string;
  bank_short_code?: string | null;
  bank_logo_path?: string | null;
  bank_apply_link?: string;
  agent_name?: string | null;
}

export interface CreateSavingsApplicationPayload {
  bank_id: number;
  agent_id?: number;
  full_name: string;
  email: string;
  phone: string;
  aadhaar_number: string;
  pan_number: string;
  pincode: string;
  notes?: string;
}
