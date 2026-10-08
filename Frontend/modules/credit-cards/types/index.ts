export type CardType = "fd" | "normal";
export type CCStatus = "initiated" | "completed" | "cancelled";

export interface CreditCardApplication {
  application_id: number;
  card_type: CardType;
  bank_id: number | null;
  agent_id: number | null;
  applied_from_office: number; // 0 or 1
  full_name: string;
  email: string;
  phone: string;
  aadhaar_number: string | null;
  pan_number: string | null;
  aadhaar_doc_path: string | null;
  pan_doc_path: string | null;
  pincode: string;
  status: CCStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  bank_name?: string | null;
  bank_short_code?: string | null;
  bank_logo_path?: string | null;
  bank_apply_link?: string | null;
  bank_tagline?: string | null;
  bank_target_audience?: string | null;
  bank_documents_required?: string | null;
  agent_name?: string | null;
  agent_email?: string | null;
}

export interface CreateCreditCardApplicationPayload {
  card_type: CardType;
  bank_id?: number | null; // required for "normal", ignored for "fd"
  agent_id?: number | null;
  full_name: string;
  email: string;
  phone: string;
  aadhaar_number: string;
  pan_number: string;
  pincode: string;
  notes?: string;
}

export interface CardTypeMeta {
  value: CardType;
  label: string;
  description: string;
  accent: "violet" | "blue";
}

// ---------- FD Document checklist ----------
export interface CcDocumentChecklistItem {
  doc_type: "aadhaar" | "pan";
  label: string;
  path: string | null;
  uploaded: boolean;
}

export interface CcDocumentChecklist {
  application_id: number;
  card_type: CardType;
  status: CCStatus;
  checklist: CcDocumentChecklistItem[];
  all_uploaded: boolean;
  uploaded_count: number;
  total_required: number;
}
// ---------- Credit Card Bank (master) ----------
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
