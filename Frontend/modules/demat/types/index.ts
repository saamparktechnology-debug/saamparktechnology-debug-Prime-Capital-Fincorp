// modules/demat/types/index.ts

export interface DematBank {
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

export interface CreateDematBankPayload {
  bank_name: string;
  short_code?: string;
  apply_link: string;
  tagline?: string;
  is_active?: number;
  display_order?: number;
}

export type DematStatus = "initiated" | "completed" | "cancelled";

export interface DematApplication {
  application_id: number;
  bank_id: number;
  agent_id: number | null;
  full_name: string;
  aadhaar_number: string | null;
  pan_number: string | null;
  email: string;
  phone: string;
  pincode: string;
  status: DematStatus;
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

export interface CreateDematApplicationPayload {
  bank_id: number;
  agent_id?: number; // admin only
  full_name: string;
  email: string;
  phone: string;
  aadhaar_number: string;
  pan_number: string;
  pincode: string;
  notes?: string;
}
