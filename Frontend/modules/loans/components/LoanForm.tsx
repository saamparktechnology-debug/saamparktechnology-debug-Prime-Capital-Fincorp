// modules/loans/components/LoanForm.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  AlertTriangle,
  Search,
  Building2,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBanksList } from "@/modules/banks/hooks/useBanks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { useCreateLoan, useUpdateLoanStatus } from "../hooks/useLoans";
import { useCustomersList } from "@/modules/customers/hooks/useCustomers";
import { useAuthStore } from "@/store/authStore";
import {
  ROLE,
  LOAN_TYPES,
  KYC_STATUS,
  LOAN_STATUS,
} from "@/lib/constants/statuses";
import { type SelectOption, optionTag } from "@/lib/format";
import {
  AADHAAR_REGEX,
  AADHAAR_ERROR,
  PAN_REGEX,
  PAN_ERROR,
} from "@/lib/utils/validators";
import { IdCard, CreditCard as PanIcon } from "lucide-react";

import {
  useBusinessTypes,
  useBusinessCategories,
} from "@/modules/masters/hooks/useMasters";

import { LoanDocumentStep } from "./LoanDocumentStep";
import type { Loan } from "../types";

// ---- Static options ----
const LOAN_TYPE_OPTIONS: SelectOption[] = LOAN_TYPES.map((t) => ({
  value: t,
  tag: t,
}));

const INTEREST_TYPE_OPTIONS: SelectOption[] = [
  { value: "flat", tag: "Flat" },
  { value: "reducing", tag: "Reducing Balance" },
];

const OWNERSHIP_OPTIONS: SelectOption[] = [
  { value: "owned", tag: "Owned" },
  { value: "rented", tag: "Rented" },
  { value: "leased", tag: "Leased" },
  { value: "family", tag: "Family" },
];

const MARITAL_OPTIONS: SelectOption[] = [
  { value: "single", tag: "Single" },
  { value: "married", tag: "Married" },
  { value: "widowed", tag: "Widowed" },
  { value: "divorced", tag: "Divorced" },
];

// ---- Detect business loan type (accepts both variants) ----
const isBusinessType = (t: string) => t === "Business" || t === "Business Loan";

// ---- Schema ----
const baseSchema = z.object({
  customer_id: z.number({ message: "Select a customer" }),
  loan_type: z.string().min(1, "Select loan type"),
  bank_id: z.number().optional(),
  requested_amount: z
    .number({ message: "Enter amount" })
    .positive("Must be positive"),
  tenure_months: z
    .number({ message: "Enter tenure" })
    .int()
    .positive("Must be positive"),
  interest_rate: z
    .number({ message: "Enter rate" })
    .min(0, "Must be 0 or more")
    .max(100, "Cannot exceed 100%"),
  interest_type: z.enum(["flat", "reducing"]),
  purpose: z.string().min(3, "Describe the purpose"),
  aadhaar_number: z.string().regex(AADHAAR_REGEX, AADHAAR_ERROR),
  pan_number: z
    .string()
    .transform((v) => v.toUpperCase())
    .refine((v) => PAN_REGEX.test(v), PAN_ERROR),

  // Business
  business_name: z.string().optional(),
  business_type_id: z.number().optional(),
  business_category_id: z.number().optional(),
  business_age_years: z.coerce.number().min(0).optional(),
  annual_turnover: z.coerce.number().min(0).optional(),
  ownership_type: z.string().optional(),
  business_address: z.string().optional(),
  business_landmark: z.string().optional(),
  business_city: z.string().optional(),
  business_state: z.string().optional(),
  business_pincode: z.string().optional(),

  // Client
  client_dob: z.string().optional(),
  client_marital_status: z.string().optional(),
  client_spouse_name: z.string().optional(),
  client_mother_name: z.string().optional(),
  client_alternate_phone: z.string().optional(),
  client_address: z.string().optional(),
  client_landmark: z.string().optional(),
  client_city: z.string().optional(),
  client_state: z.string().optional(),
  client_pincode: z.string().optional(),
});

const schema = baseSchema.superRefine((data, ctx) => {
  if (!isBusinessType(data.loan_type)) return;

  const requiredBusiness: Array<[string, string]> = [
    ["business_name", "Business name is required"],
    ["business_type_id", "Business type is required"],
    ["business_category_id", "Business category is required"],
    ["business_age_years", "Business age is required"],
    ["annual_turnover", "Annual turnover is required"],
    ["ownership_type", "Ownership type is required"],
    ["business_address", "Business address is required"],
    ["business_city", "Business city is required"],
    ["business_state", "Business state is required"],
    ["business_pincode", "Business pincode is required"],
  ];

  for (const [key, message] of requiredBusiness) {
    const v = (data as any)[key];
    if (v === undefined || v === null || v === "" || Number.isNaN(v)) {
      ctx.addIssue({
        code: "custom",
        path: [key],
        message,
      });
    }
  }

  const requiredClient: Array<[string, string]> = [
    ["client_dob", "Client DOB is required"],
    ["client_marital_status", "Client marital status is required"],
    ["client_alternate_phone", "Client alternate phone is required"],
    ["client_address", "Client address is required"],
    ["client_city", "Client city is required"],
    ["client_state", "Client state is required"],
    ["client_pincode", "Client pincode is required"],
  ];

  for (const [key, message] of requiredClient) {
    const v = (data as any)[key];
    if (v === undefined || v === null || v === "") {
      ctx.addIssue({
        code: "custom",
        path: [key],
        message,
      });
    }
  }
});

type FormValues = z.infer<typeof schema>;

// ---------- Step indicator ----------
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Details" },
    { n: 2, label: "Documents" },
    { n: 3, label: "Done" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              current >= s.n
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {current > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
          </div>
          <span
            className={`text-xs font-medium ${
              current >= s.n ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 ${
                current > s.n ? "bg-blue-600" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function LoanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get("type") || "Personal Loan";

  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === ROLE.ADMIN;

  const { data: customers, isLoading: loadingCustomers } = useCustomersList();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const { data: banks, isLoading: loadingBanks } = useBanksList();
  const { data: businessTypes } = useBusinessTypes(true);
  const { data: businessCategories } = useBusinessCategories(true);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [createdLoan, setCreatedLoan] = useState<Loan | null>(null);
  const [selectedBankForRedirect, setSelectedBankForRedirect] = useState<{
    bank_name: string;
    apply_link: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      loan_type: preselectedType,
      requested_amount: 0,
      tenure_months: 12,
      interest_rate: 12,
      interest_type: "flat",
      purpose: "",
      aadhaar_number: "",
      pan_number: "",
      business_name: "",
      business_type_id: undefined,
      business_category_id: undefined,
      business_age_years: undefined,
      annual_turnover: undefined,
      ownership_type: "",
      business_address: "",
      business_landmark: "",
      business_city: "",
      business_state: "",
      business_pincode: "",
      client_dob: "",
      client_marital_status: "",
      client_spouse_name: "",
      client_mother_name: "",
      client_alternate_phone: "",
      client_address: "",
      client_landmark: "",
      client_city: "",
      client_state: "",
      client_pincode: "",
    },
  });

  const createM = useCreateLoan();
  const updateStatusM = useUpdateLoanStatus(createdLoan?.loan_id);

  const selectedCustomer = useMemo(
    () => customers?.find((c) => c.customer_id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const eligibleCustomers = useMemo(() => {
    if (!customers) return [];
    const q = customerSearch.trim().toLowerCase();
    return customers.filter((c) => {
      if (c.kyc_status !== KYC_STATUS.APPROVED) return false;
      if (!q) return true;
      return (
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.primary_phone.includes(q)
      );
    });
  }, [customers, customerSearch]);

  const bankOptions = useMemo<SelectOption[]>(
    () =>
      (banks ?? [])
        .filter((b) => b.is_active)
        .map((b) => ({
          value: String(b.bank_id),
          tag: `${b.bank_name}${b.short_code ? ` (${b.short_code})` : ""}`,
        })),
    [banks],
  );

  const businessTypeOptions: SelectOption[] = useMemo(
    () =>
      (businessTypes ?? []).map((t) => ({
        value: String(t.type_id),
        tag: t.type_name,
      })),
    [businessTypes],
  );

  const businessCategoryOptions: SelectOption[] = useMemo(
    () =>
      (businessCategories ?? []).map((c) => ({
        value: String(c.category_id),
        tag: c.category_name,
      })),
    [businessCategories],
  );

  const loanType = form.watch("loan_type");
  const interestType = form.watch("interest_type");
  const selectedBankId = form.watch("bank_id");
  const isBusiness = isBusinessType(loanType);

  const loanTypeTag = optionTag(LOAN_TYPE_OPTIONS, loanType) ?? "Select type";
  const interestTypeTag =
    optionTag(INTEREST_TYPE_OPTIONS, interestType) ?? "Select type";
  const selectedBankTag =
    optionTag(bankOptions, selectedBankId) ?? "Select bank for submission";

  // -------------- Step 1 Submit --------------
  const onSubmitStep1 = form.handleSubmit((values) => {
    createM.mutate(values as any, {
      onSuccess: (res) => {
        // Determine bank redirect data
        const chosenBank = (banks ?? []).find(
          (b) => b.bank_id === values.bank_id,
        );
        if (chosenBank?.apply_link) {
          setSelectedBankForRedirect({
            bank_name: chosenBank.bank_name,
            apply_link: chosenBank.apply_link,
          });
        }

        const loan: Loan = {
          loan_id: res.loan_id,
          loan_status: "Applied",
          loan_type: values.loan_type,
          // ...other fields will come from backend on refetch; minimal here
        } as Loan;

        setCreatedLoan(loan);

        if (isBusinessType(values.loan_type)) {
          setCurrentStep(2);
        } else {
          setCurrentStep(3);
        }
      },
    });
  });

  // -------------- Step 2 Submit Lead --------------
  const onSubmitStep2 = () => {
    if (!createdLoan) return;
    // Keep status as "Applied" (per decision)
    // If you later want to bump to "Under Review", uncomment:
    // updateStatusM.mutate({ loan_status: "Applied" }, { onSuccess: () => setCurrentStep(3) });
    setCurrentStep(3);
  };

  // -------------- Step 3 — Success --------------
  if (currentStep === 3 && createdLoan) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <StepIndicator current={3} />

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-center text-white">
            <CheckCircle2 className="mx-auto h-14 w-14" />
            <h2 className="mt-3 text-xl font-bold">
              {isBusiness ? "Lead Submitted!" : "Application Submitted!"}
            </h2>
            <p className="mt-1 text-sm text-white/90">
              {isBusiness
                ? "All documents are uploaded. Admin will review shortly."
                : "Your loan application has been recorded."}
            </p>
          </div>
          <CardContent className="space-y-4 p-6">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Reference ID</p>
              <p className="font-mono text-lg font-semibold">
                #LN{String(createdLoan.loan_id).padStart(5, "0")}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {selectedBankForRedirect && (
                <a
                  href={selectedBankForRedirect.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ size: "lg" })}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open {selectedBankForRedirect.bank_name}
                </a>
              )}
              <Button
                variant={selectedBankForRedirect ? "outline" : "default"}
                onClick={() => router.push(`/loans/${createdLoan.loan_id}`)}
              >
                View Loan Details
              </Button>
              <Button variant="ghost" onClick={() => router.push("/loans")}>
                Back to Loans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------- Step 2 — Document upload --------------
  if (currentStep === 2 && createdLoan) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <StepIndicator current={2} />
        <LoanDocumentStep
          loanId={createdLoan.loan_id}
          onSubmitLead={onSubmitStep2}
          submitting={updateStatusM.isPending}
          onBack={() => setCurrentStep(1)}
        />
      </div>
    );
  }

  // -------------- Step 1 — Form --------------
  return (
    <div className="space-y-6">
      <StepIndicator current={1} />

      <form onSubmit={onSubmitStep1} className="space-y-6">
        {/* Customer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingCustomers ? (
              <p className="text-sm text-muted-foreground">
                Loading customers...
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone (only KYC-approved shown)"
                    className="pl-9"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>

                {!customerSearch && !selectedCustomerId && (
                  <p className="text-xs text-muted-foreground">
                    Start typing to find a KYC-approved customer.
                  </p>
                )}

                {customerSearch && eligibleCustomers.length === 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No KYC-approved customer matches "{customerSearch}".
                    </AlertDescription>
                  </Alert>
                )}

                {customerSearch && eligibleCustomers.length > 0 && (
                  <ul className="max-h-60 divide-y overflow-y-auto rounded-lg border">
                    {eligibleCustomers.slice(0, 20).map((c) => (
                      <li key={c.customer_id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomerId(c.customer_id);
                            form.setValue("customer_id", c.customer_id, {
                              shouldValidate: true,
                            });
                            setCustomerSearch("");
                          }}
                          className="flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-muted/50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {c.first_name} {c.last_name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {c.primary_phone}
                            </p>
                          </div>
                          <span className="text-xs text-emerald-600">
                            KYC approved
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedCustomer && (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div>
                      <p className="text-sm font-medium">
                        {selectedCustomer.first_name}{" "}
                        {selectedCustomer.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCustomer.primary_phone} •{" "}
                        {selectedCustomer.national_id_number}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomerId(null);
                        form.setValue("customer_id", undefined as any);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                )}

                {form.formState.errors.customer_id && !selectedCustomer && (
                  <p className="text-xs text-destructive">
                    Please select a customer.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Loan Type</Label>
              <Select
                value={loanType}
                onValueChange={(v) => {
                  const newType = v ?? "";
                  form.setValue("loan_type", newType);
                  // Business loans don't need bank
                  if (newType === "Business" || newType === "Business Loan") {
                    form.setValue("bank_id", undefined);
                  }
                }}
              >
                <SelectTrigger>
                  <span>{loanTypeTag}</span>
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Requested Amount</Label>
              <Input
                type="number"
                placeholder="50000"
                {...form.register("requested_amount", {
                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                })}
              />
              {form.formState.errors.requested_amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.requested_amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tenure (months)</Label>
              <Input
                type="number"
                placeholder="12"
                {...form.register("tenure_months", {
                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                })}
              />
              {form.formState.errors.tenure_months && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.tenure_months.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Interest Rate (% p.a.)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="12"
                {...form.register("interest_rate", {
                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                })}
              />
              {form.formState.errors.interest_rate && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.interest_rate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Interest Type</Label>
              <Select
                value={interestType}
                onValueChange={(v) =>
                  form.setValue(
                    "interest_type",
                    (v ?? "flat") as "flat" | "reducing",
                  )
                }
              >
                <SelectTrigger>
                  <span>{interestTypeTag}</span>
                </SelectTrigger>
                <SelectContent>
                  {INTEREST_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Purpose</Label>
              <Textarea
                rows={3}
                placeholder="e.g., Small shop expansion"
                {...form.register("purpose")}
              />
              {form.formState.errors.purpose && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.purpose.message}
                </p>
              )}
            </div>

            {!isBusiness && (
              <div className="space-y-2 md:col-span-2">
                <Label>Partner Bank (optional)</Label>
                <Select
                  value={selectedBankId ? String(selectedBankId) : ""}
                  onValueChange={(v) =>
                    form.setValue("bank_id", v ? Number(v) : undefined)
                  }
                  disabled={loadingBanks}
                >
                  <SelectTrigger>
                    <span
                      className={!selectedBankId ? "text-muted-foreground" : ""}
                    >
                      {selectedBankTag}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {bankOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the partner bank where this loan will be submitted.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Government IDs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Government IDs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Aadhaar Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="1234 5678 9012"
                  maxLength={14}
                  {...form.register("aadhaar_number")}
                />
              </div>
              {form.formState.errors.aadhaar_number && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.aadhaar_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                PAN Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <PanIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 uppercase"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  {...form.register("pan_number", {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                />
              </div>
              {form.formState.errors.pan_number && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.pan_number.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Info (only if Business loan) */}
        {isBusiness && (
          <Card className="border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-blue-600" />
                Business Information
                <Badge variant="outline" className="text-[10px]">
                  Required
                </Badge>
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g., Surajit Traders"
                  {...form.register("business_name")}
                />
                {form.formState.errors.business_name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.business_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Business Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={
                    form.watch("business_type_id")
                      ? String(form.watch("business_type_id"))
                      : ""
                  }
                  onValueChange={(v) =>
                    form.setValue("business_type_id", v ? Number(v) : undefined)
                  }
                >
                  <SelectTrigger>
                    <span
                      className={
                        !form.watch("business_type_id")
                          ? "text-muted-foreground"
                          : ""
                      }
                    >
                      {optionTag(
                        businessTypeOptions,
                        form.watch("business_type_id"),
                      ) ?? "Select type"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.business_type_id && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.business_type_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Business Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={
                    form.watch("business_category_id")
                      ? String(form.watch("business_category_id"))
                      : ""
                  }
                  onValueChange={(v) =>
                    form.setValue(
                      "business_category_id",
                      v ? Number(v) : undefined,
                    )
                  }
                >
                  <SelectTrigger>
                    <span
                      className={
                        !form.watch("business_category_id")
                          ? "text-muted-foreground"
                          : ""
                      }
                    >
                      {optionTag(
                        businessCategoryOptions,
                        form.watch("business_category_id"),
                      ) ?? "Select category"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {businessCategoryOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.business_category_id && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.business_category_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Business Age (years){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="5"
                  {...form.register("business_age_years")}
                />
                {form.formState.errors.business_age_years && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.business_age_years.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Annual Turnover (₹){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="500000"
                  {...form.register("annual_turnover")}
                />
                {form.formState.errors.annual_turnover && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.annual_turnover.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Ownership Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.watch("ownership_type") ?? ""}
                  onValueChange={(v) =>
                    form.setValue("ownership_type", v ?? "")
                  }
                >
                  <SelectTrigger>
                    <span
                      className={
                        !form.watch("ownership_type")
                          ? "text-muted-foreground"
                          : ""
                      }
                    >
                      {optionTag(
                        OWNERSHIP_OPTIONS,
                        form.watch("ownership_type"),
                      ) ?? "Select"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {OWNERSHIP_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.ownership_type && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.ownership_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>
                  Business Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Street address"
                  {...form.register("business_address")}
                />
                {form.formState.errors.business_address && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.business_address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Landmark</Label>
                <Input
                  placeholder="Nearby landmark"
                  {...form.register("business_landmark")}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Burdwan"
                  {...form.register("business_city")}
                />
                {form.formState.errors.business_city && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.business_city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="West Bengal"
                  {...form.register("business_state")}
                />
                {form.formState.errors.business_state && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.business_state.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Pincode <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="713103"
                  {...form.register("business_pincode")}
                />
                {form.formState.errors.business_pincode && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.business_pincode.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client Details (only if Business loan) */}
        {isBusiness && (
          <Card className="border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                Client Details
                <Badge variant="outline" className="text-[10px]">
                  Required
                </Badge>
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input type="date" {...form.register("client_dob")} />
                {form.formState.errors.client_dob && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.client_dob.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Marital Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.watch("client_marital_status") ?? ""}
                  onValueChange={(v) =>
                    form.setValue("client_marital_status", v ?? "")
                  }
                >
                  <SelectTrigger>
                    <span
                      className={
                        !form.watch("client_marital_status")
                          ? "text-muted-foreground"
                          : ""
                      }
                    >
                      {optionTag(
                        MARITAL_OPTIONS,
                        form.watch("client_marital_status"),
                      ) ?? "Select"}
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
                {form.formState.errors.client_marital_status && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.client_marital_status.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Spouse Name</Label>
                <Input
                  placeholder="Optional"
                  {...form.register("client_spouse_name")}
                />
              </div>

              <div className="space-y-2">
                <Label>Mother's Name</Label>
                <Input
                  placeholder="Optional"
                  {...form.register("client_mother_name")}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Alternate Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="9876543211"
                  {...form.register("client_alternate_phone")}
                />
                {form.formState.errors.client_alternate_phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.client_alternate_phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Street address"
                  {...form.register("client_address")}
                />
                {form.formState.errors.client_address && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.client_address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Landmark</Label>
                <Input
                  placeholder="Nearby landmark"
                  {...form.register("client_landmark")}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Burdwan"
                  {...form.register("client_city")}
                />
                {form.formState.errors.client_city && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.client_city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="West Bengal"
                  {...form.register("client_state")}
                />
                {form.formState.errors.client_state && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.client_state.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Pincode <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="713103"
                  {...form.register("client_pincode")}
                />
                {form.formState.errors.client_pincode && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.client_pincode.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createM.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createM.isPending || !selectedCustomer}
          >
            {createM.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isBusiness ? (
              "Save & Continue to Documents"
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
