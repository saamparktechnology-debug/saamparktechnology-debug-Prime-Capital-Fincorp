// modules/agents/types/agentKyc.ts

export type KycStatus = "pending" | "approved" | "rejected";

export interface CompanyProfile {
  company_id: number;
  company_name: string;
  tagline: string | null;
  logo_path: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  card_validity_years: number;
}

export interface AgentKyc {
  kyc_id: number;
  agent_id: number;

  agent_code: string | null;
  issue_date: string | null;
  valid_till: string | null;

  // Basic
  full_name: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  marital_status: "single" | "married" | "widowed" | "divorced" | null;
  father_name: string | null;
  mother_name: string | null;

  // Contact
  primary_phone: string | null;
  alternate_phone: string | null;
  email: string | null;
  current_address: string | null;
  current_city: string | null;
  current_state: string | null;
  current_pincode: string | null;

  // Permanent
  same_as_current: boolean;
  permanent_address: string | null;
  permanent_city: string | null;
  permanent_state: string | null;
  permanent_pincode: string | null;

  // IDs
  national_id_number: string | null;
  pan_number: string | null;
  voter_id_number: string | null;

  // Bank
  bank_name: string | null;
  branch_name: string | null;
  account_holder_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;

  // Occupation
  occupation_type: string | null;
  employer_or_business_name: string | null;
  work_experience_years: number | null;
  monthly_income: number | null;
  primary_income_source: string | null;

  // Emergency
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;

  // Nominee
  nominee_full_name: string | null;
  nominee_relationship: string | null;
  nominee_phone: string | null;
  nominee_dob: string | null;

  // Status
  kyc_status: KycStatus;
  kyc_rejection_reason: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface AgentKycWithAgent {
  agent: {
    agent_id: number;
    email: string;
    full_name: string;
    phone_number: string;
    is_active: boolean;
    created_at: string;
  };
  kyc: AgentKyc;
}

export interface AgentDocument {
  document_id: number;
  agent_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by_role: "admin" | "agent";
  created_at: string;
}

export interface UpdateAgentKycPayload {
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  father_name?: string;
  mother_name?: string;
  primary_phone?: string;
  alternate_phone?: string;
  email?: string;
  current_address?: string;
  current_city?: string;
  current_state?: string;
  current_pincode?: string;
  same_as_current?: boolean;
  permanent_address?: string;
  permanent_city?: string;
  permanent_state?: string;
  permanent_pincode?: string;
  national_id_number?: string;
  pan_number?: string;
  voter_id_number?: string;
  bank_name?: string;
  branch_name?: string;
  account_holder_name?: string;
  account_number?: string;
  ifsc_code?: string;
  occupation_type?: string;
  employer_or_business_name?: string;
  work_experience_years?: number;
  monthly_income?: number;
  primary_income_source?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  nominee_full_name?: string;
  nominee_relationship?: string;
  nominee_phone?: string;
  nominee_dob?: string;
}

export interface ReviewAgentKycPayload {
  status: "approved" | "rejected";
  rejection_reason?: string;
  issue_date?: string;
  valid_till?: string;
}
