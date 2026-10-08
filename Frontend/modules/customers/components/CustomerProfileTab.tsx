// modules/customers/components/CustomerProfileTab.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Customer } from "../types";

export function CustomerProfileTab({ customer }: { customer: Customer }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InfoCard title="Personal">
        <Row
          label="Full name"
          value={`${customer.first_name} ${customer.middle_name ?? ""} ${customer.last_name}`}
        />
        <Row label="Date of birth" value={formatDate(customer.date_of_birth)} />
        <Row label="Gender" value={customer.gender} />
        <Row label="Marital status" value={customer.marital_status} />
        <Row label="Father's name" value={customer.father_name} />
        <Row label="Mother's name" value={customer.mother_name} />
      </InfoCard>

      <InfoCard title="Contact">
        <Row label="Primary phone" value={customer.primary_phone} />
        <Row label="Alternate phone" value={customer.alternate_phone} />
        <Row label="Email" value={customer.email_address} />
        <Row label="Address" value={customer.current_address_line1} />
        <Row label="City" value={customer.current_city} />
        <Row label="State" value={customer.current_state} />
        <Row label="Pincode" value={customer.current_pincode} />
      </InfoCard>

      <InfoCard title="Government IDs">
        <Row label="National ID" value={customer.national_id_number} />
        <Row label="Tax ID" value={customer.tax_id_number} />
        <Row label="Voter ID" value={customer.voter_id_number} />
      </InfoCard>

      <InfoCard title="Bank">
        <Row label="Bank" value={customer.bank_name} />
        <Row label="Branch" value={customer.branch_name} />
        <Row label="Account holder" value={customer.account_holder_name} />
        <Row label="Account number" value={customer.account_number} />
        <Row label="IFSC" value={customer.ifsc_code} />
      </InfoCard>

      <InfoCard title="Occupation & Income">
        <Row label="Occupation" value={customer.occupation_type} />
        <Row label="Employer" value={customer.employer_or_business_name} />
        <Row
          label="Experience"
          value={`${customer.work_experience_years ?? "—"} yrs`}
        />
        <Row
          label="Monthly income"
          value={formatCurrency(customer.monthly_personal_income)}
        />
        <Row
          label="Household income"
          value={formatCurrency(customer.monthly_household_income)}
        />
      </InfoCard>

      <InfoCard title="KYC">
        <Row label="Status" value={customer.kyc_status} />
        <Row label="Rejection reason" value={customer.kyc_rejection_reason} />
        <Row label="Registered on" value={formatDate(customer.created_at)} />
      </InfoCard>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}
