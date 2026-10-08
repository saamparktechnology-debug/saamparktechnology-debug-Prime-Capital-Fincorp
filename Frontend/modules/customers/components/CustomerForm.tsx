// modules/customers/components/CustomerForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useCreateCustomer } from "../hooks/useCustomers";
import { useAuthStore } from "@/store/authStore";
import { ROLE } from "@/lib/constants/statuses";
import { type SelectOption, optionTag } from "@/lib/format";

// ---- Zod schema ----
const phoneRegex = /^\+?[0-9]{10,15}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const optionalNum = z
  .union([z.number(), z.nan()])
  .optional()
  .transform((v) =>
    typeof v === "number" && !Number.isNaN(v) ? v : undefined,
  );

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Required"),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  marital_status: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),

  primary_phone: z.string().regex(phoneRegex, "Enter a valid phone"),
  alternate_phone: z.string().optional(),
  email_address: z.string().email("Invalid email").optional().or(z.literal("")),

  current_address_line1: z.string().optional(),
  current_address_line2: z.string().optional(),
  current_city: z.string().optional(),
  current_state: z.string().optional(),
  current_pincode: z.string().optional(),
  residence_type: z.string().optional(),

  same_as_current: z.boolean().optional(),
  permanent_address_line1: z.string().optional(),
  permanent_city: z.string().optional(),
  permanent_state: z.string().optional(),
  permanent_pincode: z.string().optional(),

  family_type: z.string().optional(),
  total_family_members: optionalNum,
  earning_members_count: optionalNum,
  dependents_count: optionalNum,

  national_id_number: z.string().min(1, "Required"),
  tax_id_number: z.string().min(1, "Required"),
  voter_id_number: z.string().optional(),

  bank_name: z.string().optional(),
  branch_name: z.string().optional(),
  account_holder_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z
    .string()
    .optional()
    .refine((v) => !v || ifscRegex.test(v), "Invalid IFSC code"),

  occupation_type: z.string().optional(),
  employer_or_business_name: z.string().optional(),
  work_experience_years: optionalNum,
  monthly_personal_income: optionalNum,
  monthly_household_income: optionalNum,
  primary_income_source: z.string().optional(),

  nominee_full_name: z.string().optional(),
  nominee_relationship: z.string().optional(),
  nominee_phone: z
    .string()
    .optional()
    .refine((v) => !v || phoneRegex.test(v), "Enter a valid nominee phone"),
  nominee_dob: z.string().optional(),

  agent_id: optionalNum,
});

type FormValues = z.infer<typeof schema>;

// ---- Static options ----
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

const RESIDENCE_OPTIONS: SelectOption[] = [
  { value: "owned", tag: "Owned" },
  { value: "rented", tag: "Rented" },
  { value: "family", tag: "Family" },
];

const FAMILY_TYPE_OPTIONS: SelectOption[] = [
  { value: "nuclear", tag: "Nuclear" },
  { value: "joint", tag: "Joint" },
  { value: "extended", tag: "Extended" },
];

const OCCUPATION_OPTIONS: SelectOption[] = [
  { value: "salaried", tag: "Salaried" },
  { value: "self_employed", tag: "Self Employed" },
  { value: "business", tag: "Business" },
  { value: "farmer", tag: "Farmer" },
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

export function CustomerForm() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === ROLE.ADMIN;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      first_name: "",
      last_name: "",
      primary_phone: "",
      national_id_number: "",
      tax_id_number: "",
      family_type: "",
      same_as_current: false,
    },
  });

  const mutation = useCreateCustomer();

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        ...values,
        agent_id: isAdmin ? values.agent_id : undefined,
      } as any,
      {
        onSuccess: (res) => router.push(`/customers/${res.customer_id}`),
      },
    );
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Identification */}
      <SectionCard
        title="Identification"
        description="Basic personal and ID details"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="First name"
            required
            error={form.formState.errors.first_name?.message}
          >
            <Input {...form.register("first_name")} />
          </Field>

          <Field label="Middle name">
            <Input {...form.register("middle_name")} />
          </Field>

          <Field
            label="Last name"
            required
            error={form.formState.errors.last_name?.message}
          >
            <Input {...form.register("last_name")} />
          </Field>

          <Field label="Date of birth">
            <Input type="date" {...form.register("date_of_birth")} />
          </Field>

          <Field label="Gender">
            <Select
              value={form.watch("gender") ?? ""}
              onValueChange={(v) => form.setValue("gender", v ?? "")}
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
            <Input {...form.register("father_name")} />
          </Field>

          <Field label="Mother's name">
            <Input {...form.register("mother_name")} />
          </Field>
        </div>
      </SectionCard>

      {/* Contact */}
      <SectionCard title="Contact & Address">
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Primary phone"
            required
            error={form.formState.errors.primary_phone?.message}
          >
            <Input
              {...form.register("primary_phone")}
              placeholder="9876543210"
            />
          </Field>

          <Field label="Alternate phone">
            <Input {...form.register("alternate_phone")} />
          </Field>

          <Field
            label="Email"
            error={form.formState.errors.email_address?.message}
          >
            <Input type="email" {...form.register("email_address")} />
          </Field>

          <Field label="Address line 1">
            <Input {...form.register("current_address_line1")} />
          </Field>

          <Field label="City">
            <Input {...form.register("current_city")} />
          </Field>

          <Field label="State">
            <Input {...form.register("current_state")} />
          </Field>

          <Field label="Pincode">
            <Input {...form.register("current_pincode")} />
          </Field>

          <Field label="Residence type">
            <Select
              value={form.watch("residence_type") ?? ""}
              onValueChange={(v) => form.setValue("residence_type", v ?? "")}
            >
              <SelectTrigger>
                <span
                  className={
                    !form.watch("residence_type") ? "text-muted-foreground" : ""
                  }
                >
                  {optionTag(RESIDENCE_OPTIONS, form.watch("residence_type")) ??
                    "Select"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {RESIDENCE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </SectionCard>

      {/* Family */}
      <SectionCard
        title="Family Details"
        description="Family and dependent information"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Family Type">
            <Select
              value={form.watch("family_type") ?? ""}
              onValueChange={(v) => form.setValue("family_type", v ?? "")}
            >
              <SelectTrigger>
                <span
                  className={
                    !form.watch("family_type") ? "text-muted-foreground" : ""
                  }
                >
                  {optionTag(FAMILY_TYPE_OPTIONS, form.watch("family_type")) ??
                    "Select"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {FAMILY_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Total family members">
            <Input
              type="number"
              min="0"
              {...form.register("total_family_members", {
                valueAsNumber: true,
              })}
            />
          </Field>

          <Field label="Earning members count">
            <Input
              type="number"
              min="0"
              {...form.register("earning_members_count", {
                valueAsNumber: true,
              })}
            />
          </Field>

          <Field label="Dependents count">
            <Input
              type="number"
              min="0"
              {...form.register("dependents_count", {
                valueAsNumber: true,
              })}
            />
          </Field>
        </div>
      </SectionCard>

      {/* IDs */}
      <SectionCard
        title="Government IDs"
        description="Required for KYC verification"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Aadhaar Number"
            required
            error={form.formState.errors.national_id_number?.message}
          >
            <Input {...form.register("national_id_number")} />
          </Field>

          <Field
            label="Pan Number"
            required
            error={form.formState.errors.tax_id_number?.message}
          >
            <Input {...form.register("tax_id_number")} />
          </Field>

          <Field label="Voter ID">
            <Input {...form.register("voter_id_number")} />
          </Field>
        </div>
      </SectionCard>

      {/* Bank */}
      <SectionCard title="Bank Account">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Bank name">
            <Input {...form.register("bank_name")} />
          </Field>

          <Field label="Branch">
            <Input {...form.register("branch_name")} />
          </Field>

          <Field label="Account holder">
            <Input {...form.register("account_holder_name")} />
          </Field>

          <Field label="Account number">
            <Input {...form.register("account_number")} />
          </Field>

          <Field
            label="IFSC code"
            error={form.formState.errors.ifsc_code?.message}
          >
            <Input {...form.register("ifsc_code")} placeholder="HDFC0001234" />
          </Field>
        </div>
      </SectionCard>

      {/* Occupation */}
      <SectionCard title="Occupation & Income">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Occupation type">
            <Select
              value={form.watch("occupation_type") ?? ""}
              onValueChange={(v) => form.setValue("occupation_type", v ?? "")}
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
            <Input {...form.register("employer_or_business_name")} />
          </Field>

          <Field label="Work experience (years)">
            <Input
              type="number"
              {...form.register("work_experience_years", {
                valueAsNumber: true,
              })}
            />
          </Field>

          <Field label="Monthly personal income">
            <Input
              type="number"
              {...form.register("monthly_personal_income", {
                valueAsNumber: true,
              })}
            />
          </Field>

          <Field label="Monthly household income">
            <Input
              type="number"
              {...form.register("monthly_household_income", {
                valueAsNumber: true,
              })}
            />
          </Field>

          <Field label="Primary income source">
            <Input {...form.register("primary_income_source")} />
          </Field>
        </div>
      </SectionCard>

      {/* Nominee */}
      <SectionCard
        title="Nominee Details"
        description="Nominee information for the customer profile"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nominee full name">
            <Input {...form.register("nominee_full_name")} />
          </Field>

          <Field label="Nominee relationship">
            <Select
              value={form.watch("nominee_relationship") ?? ""}
              onValueChange={(v) =>
                form.setValue("nominee_relationship", v ?? "")
              }
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

          <Field
            label="Nominee phone"
            error={form.formState.errors.nominee_phone?.message}
          >
            <Input
              {...form.register("nominee_phone")}
              placeholder="9876543210"
            />
          </Field>

          <Field label="Nominee date of birth">
            <Input type="date" {...form.register("nominee_dob")} />
          </Field>
        </div>
      </SectionCard>

      {/* Admin: assign agent */}
      {isAdmin && (
        <SectionCard title="Assignment">
          <Field label="Agent ID" required>
            <Input
              type="number"
              placeholder="Enter agent_id"
              {...form.register("agent_id", { valueAsNumber: true })}
            />
          </Field>
        </SectionCard>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register Customer"
          )}
        </Button>
      </div>
    </form>
  );
}

// ---- Helpers ----
function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
