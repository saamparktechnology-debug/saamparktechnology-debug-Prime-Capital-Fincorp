// modules/agents/components/AgentKycForm.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { type SelectOption, optionTag } from "@/lib/format";
import type { AgentKyc, UpdateAgentKycPayload } from "../types";

// ---- Options ----
const GENDER_OPTIONS: SelectOption[] = [
  { value: "male", tag: "Male" },
  { value: "female", tag: "Female" },
  { value: "other", tag: "Other" },
];

const MARITAL_OPTIONS: SelectOption[] = [
  { value: "single", tag: "Single" },
  { value: "married", tag: "Married" },
  { value: "widowed", tag: "Widowed" },
  { value: "divorced", tag: "Divorced" },
];

const OCCUPATION_OPTIONS: SelectOption[] = [
  { value: "salaried", tag: "Salaried" },
  { value: "self_employed", tag: "Self Employed" },
  { value: "business", tag: "Business" },
  { value: "freelancer", tag: "Freelancer" },
  { value: "other", tag: "Other" },
];

const NOMINEE_RELATIONSHIP_OPTIONS: SelectOption[] = [
  { value: "father", tag: "Father" },
  { value: "mother", tag: "Mother" },
  { value: "spouse", tag: "Spouse" },
  { value: "son", tag: "Son" },
  { value: "daughter", tag: "Daughter" },
  { value: "brother", tag: "Brother" },
  { value: "sister", tag: "Sister" },
  { value: "other", tag: "Other" },
];

// ---- Schema — EVERYTHING optional, NO validation rules ----
const optionalNum = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .optional();

const optionalStr = z.string().optional();

const schema = z.object({
  // Basic
  full_name: optionalStr,
  date_of_birth: optionalStr,
  gender: optionalStr,
  marital_status: optionalStr,
  father_name: optionalStr,
  mother_name: optionalStr,

  // Contact
  primary_phone: optionalStr,
  alternate_phone: optionalStr,
  email: optionalStr,
  current_address: optionalStr,
  current_city: optionalStr,
  current_state: optionalStr,
  current_pincode: optionalStr,

  // Permanent
  same_as_current: z.union([z.boolean(), z.number()]).optional(),
  permanent_address: optionalStr,
  permanent_city: optionalStr,
  permanent_state: optionalStr,
  permanent_pincode: optionalStr,

  // IDs
  national_id_number: optionalStr,
  pan_number: optionalStr,
  voter_id_number: optionalStr,

  // Bank
  bank_name: optionalStr,
  branch_name: optionalStr,
  account_holder_name: optionalStr,
  account_number: optionalStr,
  ifsc_code: optionalStr,

  // Occupation
  occupation_type: optionalStr,
  employer_or_business_name: optionalStr,
  work_experience_years: optionalNum,
  monthly_income: optionalNum,
  primary_income_source: optionalStr,

  // Emergency
  emergency_contact_name: optionalStr,
  emergency_contact_relationship: optionalStr,
  emergency_contact_phone: optionalStr,

  // Nominee
  nominee_full_name: optionalStr,
  nominee_relationship: optionalStr,
  nominee_phone: optionalStr,
  nominee_dob: optionalStr,
});

type FormValues = z.infer<typeof schema>;

// Numeric fields to convert to proper numbers
const NUMERIC_FIELDS = new Set(["work_experience_years", "monthly_income"]);
const BOOLEAN_FIELDS = new Set(["same_as_current"]);

const cleanPayload = (values: FormValues): UpdateAgentKycPayload => {
  const cleaned: UpdateAgentKycPayload = {};
  Object.entries(values).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;

    // Boolean fields → force to true/false
    if (BOOLEAN_FIELDS.has(k)) {
      (cleaned as any)[k] = Boolean(v);
      return;
    }

    // Numeric fields → force to number
    if (NUMERIC_FIELDS.has(k)) {
      const n = Number(v);
      if (!Number.isNaN(n)) (cleaned as any)[k] = n;
      return;
    }

    (cleaned as any)[k] = v;
  });
  return cleaned;
};

export function AgentKycForm({
  kyc,
  disabled,
  loading,
  onSubmit,
}: {
  kyc: AgentKyc;
  disabled?: boolean;
  loading?: boolean;
  onSubmit: (payload: UpdateAgentKycPayload) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      full_name: kyc.full_name ?? "",
      date_of_birth: kyc.date_of_birth?.slice(0, 10) ?? "",
      gender: kyc.gender ?? "",
      marital_status: kyc.marital_status ?? "",
      father_name: kyc.father_name ?? "",
      mother_name: kyc.mother_name ?? "",
      primary_phone: kyc.primary_phone ?? "",
      alternate_phone: kyc.alternate_phone ?? "",
      email: kyc.email ?? "",
      current_address: kyc.current_address ?? "",
      current_city: kyc.current_city ?? "",
      current_state: kyc.current_state ?? "",
      current_pincode: kyc.current_pincode ?? "",
      same_as_current: kyc.same_as_current ?? true,
      permanent_address: kyc.permanent_address ?? "",
      permanent_city: kyc.permanent_city ?? "",
      permanent_state: kyc.permanent_state ?? "",
      permanent_pincode: kyc.permanent_pincode ?? "",
      national_id_number: kyc.national_id_number ?? "",
      pan_number: kyc.pan_number ?? "",
      voter_id_number: kyc.voter_id_number ?? "",
      bank_name: kyc.bank_name ?? "",
      branch_name: kyc.branch_name ?? "",
      account_holder_name: kyc.account_holder_name ?? "",
      account_number: kyc.account_number ?? "",
      ifsc_code: kyc.ifsc_code ?? "",
      occupation_type: kyc.occupation_type ?? "",
      employer_or_business_name: kyc.employer_or_business_name ?? "",
      work_experience_years: kyc.work_experience_years ?? undefined,
      monthly_income: kyc.monthly_income ?? undefined,
      primary_income_source: kyc.primary_income_source ?? "",
      emergency_contact_name: kyc.emergency_contact_name ?? "",
      emergency_contact_relationship: kyc.emergency_contact_relationship ?? "",
      emergency_contact_phone: kyc.emergency_contact_phone ?? "",
      nominee_full_name: kyc.nominee_full_name ?? "",
      nominee_relationship: kyc.nominee_relationship ?? "",
      nominee_phone: kyc.nominee_phone ?? "",
      nominee_dob: kyc.nominee_dob?.slice(0, 10) ?? "",
    },
  });

  // Sync form when kyc prop changes
  useEffect(() => {
    form.reset({
      full_name: kyc.full_name ?? "",
      date_of_birth: kyc.date_of_birth?.slice(0, 10) ?? "",
      gender: kyc.gender ?? "",
      marital_status: kyc.marital_status ?? "",
      father_name: kyc.father_name ?? "",
      mother_name: kyc.mother_name ?? "",
      primary_phone: kyc.primary_phone ?? "",
      alternate_phone: kyc.alternate_phone ?? "",
      email: kyc.email ?? "",
      current_address: kyc.current_address ?? "",
      current_city: kyc.current_city ?? "",
      current_state: kyc.current_state ?? "",
      current_pincode: kyc.current_pincode ?? "",
      same_as_current: kyc.same_as_current ?? true,
      permanent_address: kyc.permanent_address ?? "",
      permanent_city: kyc.permanent_city ?? "",
      permanent_state: kyc.permanent_state ?? "",
      permanent_pincode: kyc.permanent_pincode ?? "",
      national_id_number: kyc.national_id_number ?? "",
      pan_number: kyc.pan_number ?? "",
      voter_id_number: kyc.voter_id_number ?? "",
      bank_name: kyc.bank_name ?? "",
      branch_name: kyc.branch_name ?? "",
      account_holder_name: kyc.account_holder_name ?? "",
      account_number: kyc.account_number ?? "",
      ifsc_code: kyc.ifsc_code ?? "",
      occupation_type: kyc.occupation_type ?? "",
      employer_or_business_name: kyc.employer_or_business_name ?? "",
      work_experience_years: kyc.work_experience_years ?? undefined,
      monthly_income: kyc.monthly_income ?? undefined,
      primary_income_source: kyc.primary_income_source ?? "",
      emergency_contact_name: kyc.emergency_contact_name ?? "",
      emergency_contact_relationship: kyc.emergency_contact_relationship ?? "",
      emergency_contact_phone: kyc.emergency_contact_phone ?? "",
      nominee_full_name: kyc.nominee_full_name ?? "",
      nominee_relationship: kyc.nominee_relationship ?? "",
      nominee_phone: kyc.nominee_phone ?? "",
      nominee_dob: kyc.nominee_dob?.slice(0, 10) ?? "",
    });
  }, [kyc, form]);

  const submit = form.handleSubmit(
    (values) => {
      console.log("[AgentKycForm] ✅ Valid submit, values:", values);
      const payload = cleanPayload(values);
      console.log("[AgentKycForm] 📤 Clean payload:", payload);
      onSubmit(payload);
    },
    (errors) => {
      console.error("[AgentKycForm] ❌ Validation errors:", errors);
    },
  );

  const sameAsCurrent = form.watch("same_as_current");

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Basic */}
      <Section title="Basic Information">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Full name">
            <Input disabled={disabled} {...form.register("full_name")} />
          </Field>
          <Field label="Date of birth">
            <Input
              type="date"
              disabled={disabled}
              {...form.register("date_of_birth")}
            />
          </Field>
          <Field label="Gender">
            <Select
              value={form.watch("gender") ?? ""}
              onValueChange={(v) => form.setValue("gender", v ?? "")}
              disabled={disabled}
            >
              <SelectTrigger>
                <span
                  className={
                    !form.watch("gender") ? "text-muted-foreground" : ""
                  }
                >
                  {optionTag(GENDER_OPTIONS, form.watch("gender")) ?? "Select"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Marital status">
            <Select
              value={form.watch("marital_status") ?? ""}
              onValueChange={(v) => form.setValue("marital_status", v ?? "")}
              disabled={disabled}
            >
              <SelectTrigger>
                <span
                  className={
                    !form.watch("marital_status") ? "text-muted-foreground" : ""
                  }
                >
                  {optionTag(MARITAL_OPTIONS, form.watch("marital_status")) ??
                    "Select"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {MARITAL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Father's name">
            <Input disabled={disabled} {...form.register("father_name")} />
          </Field>
          <Field label="Mother's name">
            <Input disabled={disabled} {...form.register("mother_name")} />
          </Field>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Information">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Primary phone">
            <Input disabled={disabled} {...form.register("primary_phone")} />
          </Field>
          <Field label="Alternate phone">
            <Input disabled={disabled} {...form.register("alternate_phone")} />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              disabled={disabled}
              {...form.register("email")}
            />
          </Field>
          <Field label="Current address">
            <Input disabled={disabled} {...form.register("current_address")} />
          </Field>
          <Field label="City">
            <Input disabled={disabled} {...form.register("current_city")} />
          </Field>
          <Field label="State">
            <Input disabled={disabled} {...form.register("current_state")} />
          </Field>
          <Field label="Pincode">
            <Input disabled={disabled} {...form.register("current_pincode")} />
          </Field>
        </div>
      </Section>

      {/* Permanent */}
      <Section title="Permanent Address">
        <div className="mb-4 flex items-center gap-3">
          <Switch
            id="same_as_current"
            checked={Boolean(sameAsCurrent ?? true)}
            onCheckedChange={(v) => form.setValue("same_as_current", v)}
            disabled={disabled}
          />
          <Label htmlFor="same_as_current" className="text-sm">
            Same as current address
          </Label>
        </div>

        {!sameAsCurrent && (
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Permanent address">
              <Input
                disabled={disabled}
                {...form.register("permanent_address")}
              />
            </Field>
            <Field label="City">
              <Input disabled={disabled} {...form.register("permanent_city")} />
            </Field>
            <Field label="State">
              <Input
                disabled={disabled}
                {...form.register("permanent_state")}
              />
            </Field>
            <Field label="Pincode">
              <Input
                disabled={disabled}
                {...form.register("permanent_pincode")}
              />
            </Field>
          </div>
        )}
      </Section>

      {/* IDs */}
      <Section title="Government IDs">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="National ID (Aadhaar)">
            <Input
              disabled={disabled}
              {...form.register("national_id_number")}
            />
          </Field>
          <Field label="PAN Number">
            <Input disabled={disabled} {...form.register("pan_number")} />
          </Field>
          <Field label="Voter ID">
            <Input disabled={disabled} {...form.register("voter_id_number")} />
          </Field>
        </div>
      </Section>

      {/* Bank */}
      <Section title="Bank Account">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Bank name">
            <Input disabled={disabled} {...form.register("bank_name")} />
          </Field>
          <Field label="Branch">
            <Input disabled={disabled} {...form.register("branch_name")} />
          </Field>
          <Field label="Account holder">
            <Input
              disabled={disabled}
              {...form.register("account_holder_name")}
            />
          </Field>
          <Field label="Account number">
            <Input disabled={disabled} {...form.register("account_number")} />
          </Field>
          <Field label="IFSC code">
            <Input
              disabled={disabled}
              placeholder="HDFC0001234"
              {...form.register("ifsc_code")}
            />
          </Field>
        </div>
      </Section>

      {/* Occupation */}
      <Section title="Occupation & Income">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Occupation type">
            <Select
              value={form.watch("occupation_type") ?? ""}
              onValueChange={(v) => form.setValue("occupation_type", v ?? "")}
              disabled={disabled}
            >
              <SelectTrigger>
                <span
                  className={
                    !form.watch("occupation_type")
                      ? "text-muted-foreground"
                      : ""
                  }
                >
                  {optionTag(
                    OCCUPATION_OPTIONS,
                    form.watch("occupation_type"),
                  ) ?? "Select"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {OCCUPATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Employer / Business">
            <Input
              disabled={disabled}
              {...form.register("employer_or_business_name")}
            />
          </Field>
          <Field label="Experience (years)">
            <Input
              type="number"
              disabled={disabled}
              {...form.register("work_experience_years")}
            />
          </Field>
          <Field label="Monthly income">
            <Input
              type="number"
              disabled={disabled}
              {...form.register("monthly_income")}
            />
          </Field>
          <Field label="Primary income source">
            <Input
              disabled={disabled}
              {...form.register("primary_income_source")}
            />
          </Field>
        </div>
      </Section>

      {/* Emergency */}
      <Section title="Emergency Contact">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Contact name">
            <Input
              disabled={disabled}
              {...form.register("emergency_contact_name")}
            />
          </Field>
          <Field label="Relationship">
            <Input
              disabled={disabled}
              {...form.register("emergency_contact_relationship")}
            />
          </Field>
          <Field label="Phone">
            <Input
              disabled={disabled}
              {...form.register("emergency_contact_phone")}
            />
          </Field>
        </div>
      </Section>

      {/* Nominee */}
      <Section title="Nominee Details">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nominee name">
            <Input
              disabled={disabled}
              {...form.register("nominee_full_name")}
            />
          </Field>
          <Field label="Relationship">
            <Select
              value={form.watch("nominee_relationship") ?? ""}
              onValueChange={(v) =>
                form.setValue("nominee_relationship", v ?? "")
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <span
                  className={
                    !form.watch("nominee_relationship")
                      ? "text-muted-foreground"
                      : ""
                  }
                >
                  {optionTag(
                    NOMINEE_RELATIONSHIP_OPTIONS,
                    form.watch("nominee_relationship"),
                  ) ?? "Select"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {NOMINEE_RELATIONSHIP_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nominee phone">
            <Input disabled={disabled} {...form.register("nominee_phone")} />
          </Field>
          <Field label="Nominee DOB">
            <Input
              type="date"
              disabled={disabled}
              {...form.register("nominee_dob")}
            />
          </Field>
        </div>
      </Section>

      {!disabled && (
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

// ---- Helpers ----
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
