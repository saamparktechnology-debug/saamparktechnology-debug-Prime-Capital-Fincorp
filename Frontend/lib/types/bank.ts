// lib/types/bank.ts

export interface Bank {
  bank_id: number;
  bank_name: string;
  short_code?: string | null;
  tagline?: string | null;
  logo_path?: string | null;
  apply_link?: string | null;
  is_active: number | boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBankPayload {
  bank_name: string;
  short_code?: string;
  tagline?: string;
  apply_link?: string;
  is_active?: number | boolean;
  display_order?: number;
}

export interface UpdateBankPayload {
  bank_name?: string;
  short_code?: string;
  tagline?: string;
  apply_link?: string;
  is_active?: number | boolean;
  display_order?: number;
}
