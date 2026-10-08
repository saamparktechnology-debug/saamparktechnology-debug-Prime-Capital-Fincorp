// modules/credit-cards/CreditCardApply.tsx
"use client";

import { Suspense, useState, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { documentUrl } from "@/lib/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  CheckCircle2,
  ArrowLeft,
  User,
  Users,
  Mail,
  Phone,
  MapPin,
  UserCog,
  IdCard,
  CreditCard as PanIcon,
  Landmark,
  CreditCard as CreditCardIcon,
  Building2,
  Share2,
  FileText,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type SelectOption, optionTag } from "@/lib/format";

import { usePermission } from "@/lib/hooks/usePermission";
import { useAgentsList } from "@/modules/agents/hooks/useAgents";
import { useCreditCardBanks } from "./hooks/useCreditCardBanks";

import {
  AADHAAR_REGEX,
  AADHAAR_ERROR,
  PAN_REGEX,
  PAN_ERROR,
} from "@/lib/utils/validators";

import { useCreateCreditCardApplication } from "./hooks/useCreditCards";
import { cardTypeLabel } from "./utils/cardTypes";
import type { CardType, CreditCardApplication } from "./types";
import { CcDocumentStep } from "./components/CcDocumentStep";

const phoneRegex = /^\+?[0-9]{10,15}$/;
const pincodeRegex = /^[0-9]{4,10}$/;

const schema = z.object({
  card_type: z.enum(["fd", "normal"]),
  bank_id: z.number({ message: "Please select a bank" }),
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(phoneRegex, "Enter a valid phone"),
  aadhaar_number: z.string().regex(AADHAAR_REGEX, AADHAAR_ERROR),
  pan_number: z
    .string()
    .transform((v) => v.toUpperCase())
    .refine((v) => PAN_REGEX.test(v), PAN_ERROR),
  pincode: z.string().regex(pincodeRegex, "Enter a valid pincode"),
  agent_id: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ------------------------------------------------------------------ */
/* WhatsApp helper                                                    */
/* ------------------------------------------------------------------ */

const buildWhatsAppUrl = (opts: {
  phone: string;
  customerName: string;
  bankName: string;
  applyLink: string;
}): string => {
  let digits = opts.phone.replace(/\D/g, "");
  if (!digits.startsWith("91") && digits.length === 10) {
    digits = "91" + digits;
  }

  const message = `Dear ${opts.customerName},

Your ${opts.bankName} credit card application has been initiated.

Please complete your application using the link below:
${opts.applyLink}

For any assistance, please contact us.
- Capital Fincorp Pvt. Ltd.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

/* ------------------------------------------------------------------ */
/* Shared components                                                  */
/* ------------------------------------------------------------------ */

function StepIndicator({
  current,
  steps,
}: {
  current: 1 | 2 | 3;
  steps: { n: number; label: string }[];
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {steps.map((step, index) => {
        const done = current > step.n;
        const active = current === step.n;

        return (
          <div key={step.n} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                done || active
                  ? "bg-blue-600 text-white"
                  : "border bg-background text-muted-foreground"
              } ${active ? "ring-4 ring-blue-500/20" : ""}`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : step.n}
            </div>

            <span
              className={`hidden text-xs font-medium sm:inline ${
                active
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>

            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 transition-colors ${
                  done ? "bg-blue-600" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  error,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  icon: typeof User;
  error?: string;
  hint?: string;
  className?: string;
  children: (props: {
    id: string;
    className: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label} <span className="text-destructive">*</span>
      </Label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {children({
          id,
          className: `h-10 pl-9 ${
            error ? "border-destructive focus-visible:ring-destructive/30" : ""
          }`,
          "aria-invalid": !!error,
          "aria-describedby": describedBy,
        })}
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                          */
/* ------------------------------------------------------------------ */

function CreditCardApplyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin } = usePermission();

  const initialType = (searchParams.get("type") as CardType) || "normal";

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [created, setCreated] = useState<CreditCardApplication | null>(null);

  const { data: agents } = useAgentsList();
  const { data: banks, isLoading: loadingBanks } = useCreditCardBanks(true);

  const activeAgents = (agents ?? []).filter((agent) => agent.is_active);
  const activeBanks = (banks ?? []).filter((bank) => bank.is_active);

  const agentOptions: SelectOption[] = activeAgents.map((agent) => ({
    value: String(agent.agent_id),
    tag: agent.full_name,
  }));

  const bankOptions: SelectOption[] = activeBanks.map((bank) => ({
    value: String(bank.bank_id),
    tag: `${bank.bank_name}${bank.short_code ? ` (${bank.short_code})` : ""}`,
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      card_type: initialType,
      bank_id: undefined as any,
      full_name: "",
      email: "",
      phone: "",
      aadhaar_number: "",
      pan_number: "",
      pincode: "",
      agent_id: undefined,
    },
  });

  const createM = useCreateCreditCardApplication();

  const selectedCardType = form.watch("card_type");
  const selectedBankId = form.watch("bank_id");
  const selectedAgentId = form.watch("agent_id");
  const selectedAgent = (agents ?? []).find(
    (a) => a.agent_id === selectedAgentId,
  );
  const isFd = selectedCardType === "fd";

  const selectedBank = (banks ?? []).find((b) => b.bank_id === selectedBankId);
  const errors = form.formState.errors;

  const steps = isFd
    ? [
        { n: 1, label: "Details" },
        { n: 2, label: "Documents" },
        { n: 3, label: "Done" },
      ]
    : [
        { n: 1, label: "Details" },
        { n: 3, label: "Done" },
      ];

  const onSubmitStep1 = form.handleSubmit((values) => {
    if (!values.bank_id) {
      form.setError("bank_id", { message: "Please select a bank." });
      return;
    }

    createM.mutate(
      {
        card_type: values.card_type,
        bank_id: values.bank_id,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        aadhaar_number: values.aadhaar_number,
        pan_number: values.pan_number,
        pincode: values.pincode,
        agent_id: isAdmin ? (values.agent_id ?? null) : undefined,
      },
      {
        onSuccess: (data) => {
          setCreated(data);
          if (data.card_type === "fd") {
            setCurrentStep(2);
          } else {
            setCurrentStep(3);
          }
        },
      },
    );
  });

  /* ---------------------------------------------------------------- */
  /* Step 3 — Success                                                */
  /* ---------------------------------------------------------------- */

  // ---------- Step 3: Success ----------
  if (currentStep === 3 && created) {
    const doneSteps =
      created.card_type === "fd"
        ? [
            { n: 1, label: "Details" },
            { n: 2, label: "Documents" },
            { n: 3, label: "Done" },
          ]
        : [
            { n: 1, label: "Details" },
            { n: 3, label: "Done" },
          ];

    // Debug logging — remove after confirming
    console.log("[CC Success] bank data:", {
      bank_name: created.bank_name,
      bank_id: created.bank_id,
      bank_short_code: created.bank_short_code,
      bank_apply_link: created.bank_apply_link,
    });

    const waUrl = created.bank_apply_link
      ? buildWhatsAppUrl({
          phone: created.phone,
          customerName: created.full_name,
          bankName: created.bank_name || "partner bank",
          applyLink: created.bank_apply_link,
        })
      : null;

    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <StepIndicator current={3} steps={doneSteps} />

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-center text-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-8 ring-white/10">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="mt-3 text-xl font-bold">Application submitted</h2>

            <p className="mt-1 text-sm text-white/90">
              Share the bank link with your customer to complete the process.
            </p>
          </div>

          <CardContent className="space-y-5 p-6">
            {/* Reference */}
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Reference ID</p>
                <p className="font-mono text-lg font-semibold">
                  #CC{String(created.application_id).padStart(5, "0")}
                </p>
              </div>

              <Badge variant="outline" className="w-fit">
                {cardTypeLabel(created.card_type)}
              </Badge>
            </div>

            {/* Applicant details */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Applicant details</h3>

              <Separator />

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 sm:grid-cols-3">
                <Info label="Name" value={created.full_name} />
                <Info label="Phone" value={created.phone} />
                <Info label="Email" value={created.email} />
                <Info label="Bank" value={created.bank_name ?? "—"} />
                <Info label="Pincode" value={created.pincode} />
                <Info label="Aadhaar" value={created.aadhaar_number ?? "—"} />
                <Info label="PAN" value={created.pan_number ?? "—"} />
              </div>
            </div>

            {/* Applied from office badge */}
            {created.applied_from_office ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center text-xs text-amber-700 dark:text-amber-400">
                <Building2 className="mx-auto mb-1 h-4 w-4" />
                Applied from office — no agent assigned
              </div>
            ) : null}

            {/* Apply link + WhatsApp share */}
            {created.bank_apply_link ? (
              <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {created.bank_name} — Application Link
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Open the bank&apos;s site or share it with the customer.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <a
                    href={created.bank_apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonVariants({ variant: "default" })} flex-1`}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open {created.bank_name} Site
                  </a>

                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${buttonVariants({ variant: "default" })} flex-1 bg-emerald-600 hover:bg-emerald-700`}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                No application link available for{" "}
                {created.bank_name ?? "this bank"}.
              </div>
            )}

            {/* Back */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/credit-cards")}
              >
                Back to Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Step 2 — Documents                                              */
  /* ---------------------------------------------------------------- */

  if (currentStep === 2 && created) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <StepIndicator current={2} steps={steps} />

        <CcDocumentStep
          applicationId={created.application_id}
          onSubmit={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Step 1 — Form                                                   */
  /* ---------------------------------------------------------------- */

  const TypeIcon = isFd ? Landmark : CreditCardIcon;

  const typeAccent = isFd
    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
    : "bg-blue-500/10 text-blue-600 dark:text-blue-400";

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* Back */}
      <div>
        <Link
          href="/credit-cards"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title="New Credit Card Application"
        description="Fill in customer details to record this application"
      />

      {/* Progress */}
      <StepIndicator current={1} steps={steps} />

      <form
        onSubmit={onSubmitStep1}
        noValidate
        className="space-y-5 sm:space-y-6"
      >
        {/* ====================================================== */}
        {/* Card Type                                               */}
        {/* ====================================================== */}

        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 border-b bg-muted/40 p-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${typeAccent}`}
            >
              <TypeIcon className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">
                {cardTypeLabel(selectedCardType)}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {isFd
                  ? "Secured against a fixed deposit"
                  : "Standard unsecured credit card"}
              </p>
            </div>

            <Badge variant="outline" className="text-[10px]">
              {isFd ? "FD" : "NORMAL"}
            </Badge>
          </div>

          <CardContent className="pt-4">
            <div className="max-w-md space-y-2">
              <Label htmlFor="card_type">
                Card Type <span className="text-destructive">*</span>
              </Label>

              <Select
                value={selectedCardType}
                onValueChange={(value) =>
                  form.setValue("card_type", (value ?? "normal") as CardType, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="card_type" className="h-10">
                  <span>
                    {optionTag(
                      [
                        { value: "fd", tag: "FD Credit Card" },
                        { value: "normal", tag: "Normal Credit Card" },
                      ],
                      selectedCardType,
                    ) ?? "Select"}
                  </span>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="fd">FD Credit Card</SelectItem>
                  <SelectItem value="normal">Normal Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ====================================================== */}
        {/* Partner Bank (REQUIRED)                                 */}
        {/* ====================================================== */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Partner Bank <span className="text-destructive">*</span>
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-3 pt-4">
            <Select
              value={selectedBankId ? String(selectedBankId) : ""}
              onValueChange={(value) =>
                form.setValue("bank_id", Number(value), {
                  shouldValidate: true,
                })
              }
              disabled={loadingBanks}
            >
              <SelectTrigger className="max-w-xl h-10">
                <Landmark className="mr-2 h-4 w-4 text-muted-foreground" />
                <span
                  className={!selectedBankId ? "text-muted-foreground" : ""}
                >
                  {optionTag(bankOptions, selectedBankId) ?? "Select bank"}
                </span>
              </SelectTrigger>

              <SelectContent>
                {bankOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.bank_id && (
              <p className="text-xs text-destructive">
                {errors.bank_id.message}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              The customer will receive this bank&apos;s application link via
              WhatsApp after submission.
            </p>
          </CardContent>
        </Card>

        {/* ====================================================== */}
        {/* Customer Details                                       */}
        {/* ====================================================== */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customer Details</CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
            <Field
              id="full_name"
              label="Full Name"
              icon={User}
              error={errors.full_name?.message}
              className="sm:col-span-2"
            >
              {(props) => (
                <Input
                  {...props}
                  autoComplete="name"
                  placeholder="e.g., Surajit Singh"
                  {...form.register("full_name")}
                />
              )}
            </Field>

            <Field
              id="email"
              label="Email"
              icon={Mail}
              error={errors.email?.message}
              className="sm:col-span-2"
            >
              {(props) => (
                <Input
                  {...props}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...form.register("email")}
                />
              )}
            </Field>

            <Field
              id="phone"
              label="Phone"
              icon={Phone}
              error={errors.phone?.message}
              hint="WhatsApp link will be sent to this number."
            >
              {(props) => (
                <Input
                  {...props}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="9876543210"
                  {...form.register("phone")}
                />
              )}
            </Field>

            <Field
              id="pincode"
              label="Pincode"
              icon={MapPin}
              error={errors.pincode?.message}
            >
              {(props) => (
                <Input
                  {...props}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="713103"
                  {...form.register("pincode")}
                />
              )}
            </Field>
          </CardContent>
        </Card>

        {/* ====================================================== */}
        {/* Government IDs                                         */}
        {/* ====================================================== */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Government IDs</CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
            <Field
              id="aadhaar_number"
              label="Aadhaar Number"
              icon={IdCard}
              error={errors.aadhaar_number?.message}
            >
              {(props) => (
                <Input
                  {...props}
                  inputMode="numeric"
                  placeholder="1234 5678 9012"
                  maxLength={14}
                  {...form.register("aadhaar_number")}
                />
              )}
            </Field>

            <Field
              id="pan_number"
              label="PAN Number"
              icon={PanIcon}
              error={errors.pan_number?.message}
            >
              {(props) => (
                <Input
                  {...props}
                  className={`${props.className} uppercase`}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  {...form.register("pan_number", {
                    onChange: (event) => {
                      event.target.value = event.target.value.toUpperCase();
                    },
                  })}
                />
              )}
            </Field>
          </CardContent>
        </Card>

        {/* ====================================================== */}
        {/* Assignment (admin only)                                */}
        {/* ====================================================== */}

        {isAdmin && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assignment</CardTitle>
            </CardHeader>

            <Separator />

            <CardContent className="space-y-3 pt-4">
              <Label htmlFor="agent_id">
                Assign to Agent{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>

              <Select
                value={selectedAgentId ? String(selectedAgentId) : ""}
                onValueChange={(value) =>
                  form.setValue("agent_id", value ? Number(value) : undefined)
                }
              >
                <SelectTrigger id="agent_id" className="max-w-xl h-10">
                  <UserCog className="mr-2 h-4 w-4 text-muted-foreground" />

                  <span
                    className={!selectedAgentId ? "text-muted-foreground" : ""}
                  >
                    {optionTag(agentOptions, selectedAgentId) ??
                      "Leave blank for office"}
                  </span>
                </SelectTrigger>

                <SelectContent>
                  {agentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground">
                Leave blank to mark this application as{" "}
                <strong>applied from office</strong>.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Selected bank details — target audience + documents */}
        {selectedBank && (
          <Card className="border-blue-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {selectedBank.logo_path ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                    <img
                      src={documentUrl(selectedBank.logo_path) ?? ""}
                      alt={selectedBank.bank_name}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Landmark className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-sm">
                    {selectedBank.bank_name}
                  </CardTitle>
                  {selectedBank.tagline && (
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedBank.tagline}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4 pt-4">
              {/* Target Audience */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Target Audience
                </p>
                <ul className="space-y-1 text-xs text-foreground">
                  {selectedBank.target_audience
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-600">✔</span>
                        <span className="flex-1">{line.trim()}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Documents Required */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Documents Required
                </p>
                <ul className="space-y-1 text-xs text-foreground">
                  {selectedBank.documents_required
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue-600">✔</span>
                        <span className="flex-1">{line.trim()}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ====================================================== */}
        {/* FD Information                                          */}
        {/* ====================================================== */}

        {isFd && (
          <Card className="border-violet-500/30 bg-violet-500/5">
            <CardContent className="flex gap-3 p-4">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />

              <div className="space-y-1">
                <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
                  Documents required
                </p>

                <p className="text-xs text-violet-700/80 dark:text-violet-400/80">
                  FD credit cards require Aadhaar and PAN documents. You&apos;ll
                  upload them after saving the application details.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ====================================================== */}
        {/* Actions                                                  */}
        {/* ====================================================== */}

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Ready to submit?</p>

                <p className="text-xs text-muted-foreground">
                  {isFd
                    ? "Your application will be saved and you'll continue to document upload."
                    : "Review the information above before submitting the application."}
                </p>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={createM.isPending}
                >
                  Cancel
                </Button>

                <Button type="submit" size="lg" disabled={createM.isPending}>
                  {createM.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isFd ? (
                    <>
                      Save and continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Submit application
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <p className="text-center text-xs text-muted-foreground">
              Fields marked <span className="text-destructive">*</span> are
              required.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Suspense wrapper                                                   */
/* ------------------------------------------------------------------ */

export default function CreditCardApply() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full" />

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-72 w-full" />
              <Skeleton className="h-56 w-full" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <CreditCardApplyInner />
    </Suspense>
  );
}
