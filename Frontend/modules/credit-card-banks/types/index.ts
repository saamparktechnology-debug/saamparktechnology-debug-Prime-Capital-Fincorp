export interface CreditCardBank {
  bank_id: number;
  bank_name: string;
  short_code: string | null;
  logo_path: string | null;
  apply_link: string;
  tagline: string | null;
  target_audience: string;
  documents_required: string;
  is_active: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCreditCardBankPayload {
  bank_name: string;
  short_code?: string;
  apply_link: string;
  tagline?: string;
  target_audience: string;
  documents_required: string;
  is_active?: number;
  display_order?: number;
}
