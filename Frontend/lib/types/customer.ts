// lib/types/customer.ts
import type { KycStatus } from "@/lib/constants/statuses";

export interface Customer {
  customer_id: number;
  agent_id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  father_name?: string | null;
  mother_name?: string | null;

  primary_phone: string;
  alternate_phone?: string | null;
  email_address?: string | null;

  current_address_line1?: string | null;
  current_address_line2?: string | null;
  current_city?: string | null;
  current_state?: string | null;
  current_pincode?: string | null;
  residence_type?: string | null;

  same_as_current?: boolean | null;
  permanent_address_line1?: string | null;
  permanent_city?: string | null;
  permanent_state?: string | null;
  permanent_pincode?: string | null;

  family_type?: string | null;
  total_family_members?: number | null;
  earning_members_count?: number | null;
  dependents_count?: number | null;

  national_id_number: string;
  tax_id_number: string;
  voter_id_number?: string | null;

  bank_name?: string | null;
  branch_name?: string | null;
  account_holder_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;

  occupation_type?: string | null;
  employer_or_business_name?: string | null;
  work_experience_years?: number | null;

  monthly_personal_income?: number | null;
  monthly_household_income?: number | null;
  primary_income_source?: string | null;

  nominee_full_name?: string | null;
  nominee_relationship?: string | null;
  nominee_phone?: string | null;
  nominee_dob?: string | null;

  kyc_status: KycStatus;
  kyc_rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateCustomerPayload {
  // Required
  first_name: string;
  last_name: string;
  primary_phone: string;
  national_id_number: string;
  tax_id_number: string;

  // Optional-but-often-used
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  father_name?: string;
  mother_name?: string;
  alternate_phone?: string;
  email_address?: string;

  current_address_line1?: string;
  current_address_line2?: string;
  current_city?: string;
  current_state?: string;
  current_pincode?: string;
  residence_type?: string;

  same_as_current?: boolean;
  permanent_address_line1?: string;
  permanent_city?: string;
  permanent_state?: string;
  permanent_pincode?: string;

  family_type?: string;
  total_family_members?: number;
  earning_members_count?: number;
  dependents_count?: number;

  voter_id_number?: string;

  bank_name?: string;
  branch_name?: string;
  account_holder_name?: string;
  account_number?: string;
  ifsc_code?: string;

  occupation_type?: string;
  employer_or_business_name?: string;
  work_experience_years?: number;

  monthly_personal_income?: number;
  monthly_household_income?: number;
  primary_income_source?: string;

  nominee_full_name?: string;
  nominee_relationship?: string;
  nominee_phone?: string;
  nominee_dob?: string;

  // Admin-only
  agent_id?: number;
}
