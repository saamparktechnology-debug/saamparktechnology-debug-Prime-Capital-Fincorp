"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin,
  UserCog,
  IdCard,
  CreditCard as PanIcon,
  Landmark,
  CreditCard as CreditCardIcon,
  Building2,
  FileText,
  ShieldCheck,
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
import { WhatsAppShare } from "@/components/shared/WhatsAppShare";

const phoneRegex = /^\+?[0-9]{10,15}$/;
const pincodeRegex = /^[0-9]{4,10}$/;

const schema = z
  .object({
    card_type: z.enum(["fd", "normal"]),
    bank_id: z.number().optional(),
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
  })
  .superRefine((data, ctx) => {
    if (data.card_type === "normal" && !data.bank_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bank_id"],
        message: "Please choose a bank.",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

/* ------------------------------------------------------------------ */
/* Step indicator                                                      */
/* ------------------------------------------------------------------ */

function StepIndicator({
  current,
  steps,
}: {
  current: 1 | 2 | 3;
  steps: { n: number; label: string }[];
}) {
  return (
    <nav aria-label="Application progress" className="w-full">
      <ol className="flex w-full items-center">
        {steps.map((step, index) => {
          const done = current > step.n;
          const active = current === step.n;

          return (
            <li
              key={step.n}
              className={`flex items-center ${
                index < steps.length - 1 ? "flex-1" : ""
              }`}
              aria-current={active ? "step" : undefined}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    done || active
                      ? "bg-blue-600 text-white"
                      : "border bg-background text-muted-foreground"
                  } ${active ? "ring-4 ring-blue-500/20" : ""}`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : step.n}
                </span>

                <span
                  className={`hidden text-sm sm:inline ${
                    active
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-3 h-px flex-1 transition-colors ${
                    done ? "bg-blue-600" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable bits                                                       */
/* ------------------------------------------------------------------ */

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 bg-muted/30 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <CardTitle className="text-base leading-tight">{title}</CardTitle>

          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="grid gap-5 p-5 sm:grid-cols-2 lg:p-6">
        {children}
      </CardContent>
    </Card>
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
/* Main page                                                           */
/* ------------------------------------------------------------------ */

function CreditCardApplyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin } = usePermission();

  const queryType = searchParams.get("type");
  const initialType: CardType =
    queryType === "fd" || queryType === "normal" ? queryType : "normal";

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [created, setCreated] = useState<CreditCardApplication | null>(null);

  const { data: agents } = useAgentsList();
  const { data: banks, isLoading: banksLoading } = useCreditCardBanks(true);

  const activeAgents = (agents ?? []).filter((agent) => agent.is_active);

  const agentOptions: SelectOption[] = activeAgents.map((agent) => ({
    value: String(agent.agent_id),
    tag: agent.full_name,
  }));

  const bankOptions: SelectOption[] = (banks ?? []).map((b) => ({
    value: String(b.bank_id),
    tag: b.bank_name,
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      card_type: initialType,
      bank_id: undefined,
      full_name: "",
      email: "",
      phone: "",
      aadhaar_number: "",
      pan_number: "",
      pincode: "",
      agent_id: undefined,
    },
    mode: "onSubmit",
  });

  const createM = useCreateCreditCardApplication();

  const selectedCardType = form.watch("card_type") ?? initialType;
  const selectedBankId = form.watch("bank_id");
  const isFd = selectedCardType === "fd";
  const errors = form.formState.errors;

  // Sync card_type if URL changes after mount (e.g. client-side navigation)
  useEffect(() => {
    form.setValue("card_type", initialType);
    if (initialType === "fd") form.setValue("bank_id", undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialType]);

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

  const handleCardTypeChange = (value: CardType) => {
    form.setValue("card_type", value, { shouldValidate: true });
    if (value === "fd") {
      form.setValue("bank_id", undefined, { shouldValidate: true });
    } else {
      form.setValue("bank_id", undefined, { shouldValidate: true });
    }
  };

  const onSubmitStep1 = form.handleSubmit((values) => {
    createM.mutate(
      {
        card_type: values.card_type,
        bank_id: values.card_type === "normal" ? values.bank_id : undefined,
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
          setCurrentStep(data.card_type === "fd" ? 2 : 3);
        },
      },
    );
  });

  /* ---------------------------------------------------------------- */
  /* Step 3 — Success                                                 */
  /* ---------------------------------------------------------------- */

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

    return (
      <div className="w-full space-y-6">
        <StepIndicator current={3} steps={doneSteps} />

        <Card className="overflow-hidden shadow-sm">
          <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-10 text-center text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-8 ring-white/10">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Application submitted
              </h2>

              <p className="text-sm text-white/85">
                We&apos;ll process this credit card request shortly.
              </p>
            </div>
          </div>

          <CardContent className="space-y-6 p-6 lg:p-8">
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Reference ID</p>

                <p className="font-mono text-xl font-semibold tabular-nums">
                  #CC{String(created.application_id).padStart(5, "0")}
                </p>
              </div>

              <Badge variant="outline" className="w-fit">
                {cardTypeLabel(created.card_type)}
              </Badge>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Applicant details</h3>

              <Separator />

              <div className="grid grid-cols-1 gap-x-8 gap-y-5 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Name" value={created.full_name} />
                <Info label="Phone" value={created.phone} />
                <Info label="Email" value={created.email} />
                <Info label="Pincode" value={created.pincode} />
                <Info label="Aadhaar" value={created.aadhaar_number ?? "—"} />
                <Info label="PAN" value={created.pan_number ?? "—"} />
                {created.bank_name ? (
                  <Info label="Bank" value={created.bank_name} />
                ) : null}
              </div>
            </div>

            {created.applied_from_office ? (
              <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
                <Building2 className="h-4 w-4 shrink-0" />
                Applied from office — no agent assigned
              </div>
            ) : null}

            {/* WhatsApp share — only for normal cards with a bank apply link */}
            {created.card_type === "normal" &&
              created.bank_name &&
              created.bank_apply_link && (
                <WhatsAppShare
                  defaultPhone={created.phone}
                  message={`Hi,\n\nPlease complete your ${created.bank_name} credit card application using this link:\n\n${created.bank_apply_link}\n\n- Capital Fincorp Pvt. Ltd.`}
                  helperText="Send the application link directly to the customer."
                />
              )}

            <Separator />

            <Separator />

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => router.push("/credit-cards")}
              >
                Back to applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Step 2 — Documents                                               */
  /* ---------------------------------------------------------------- */

  if (currentStep === 2 && created) {
    return (
      <div className="w-full space-y-6">
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
  /* Step 1 — Details                                                 */
  /* ---------------------------------------------------------------- */

  const TypeIcon = isFd ? Landmark : CreditCardIcon;

  const typeAccent = isFd
    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
    : "bg-blue-500/10 text-blue-600 dark:text-blue-400";

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/credit-cards"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to applications
        </Link>
      </div>

      <PageHeader
        title="New credit card application"
        description="Enter the customer's details to record this application."
      />

      <StepIndicator current={1} steps={steps} />

      <form onSubmit={onSubmitStep1} noValidate className="space-y-6">
        {/* ---------------- Card type + Bank ---------------- */}
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b bg-muted/30 p-5 sm:flex-row sm:items-center">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${typeAccent}`}
            >
              <TypeIcon className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold">
                {cardTypeLabel(selectedCardType)}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {isFd
                  ? "Secured against a fixed deposit"
                  : "Standard unsecured credit card"}
              </p>
            </div>

            <Badge variant="outline" className="w-fit text-[10px]">
              {isFd ? "FD" : "NORMAL"}
            </Badge>
          </div>

          <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="card_type" className="text-sm font-medium">
                Card type <span className="text-destructive">*</span>
              </Label>

              <Select
                value={selectedCardType}
                onValueChange={(value) =>
                  handleCardTypeChange((value ?? "normal") as CardType)
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
                  <SelectItem value="normal">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank picker — visible for normal cards only */}
            {selectedCardType === "normal" && (
              <div className="space-y-2">
                <Label htmlFor="bank_id" className="text-sm font-medium">
                  Bank <span className="text-destructive">*</span>
                </Label>

                <Select
                  value={
                    selectedBankId != null && selectedBankId !== 0
                      ? String(selectedBankId)
                      : ""
                  }
                  onValueChange={(value) => {
                    form.setValue(
                      "bank_id",
                      value ? Number(value) : undefined,
                      { shouldValidate: true },
                    );
                  }}
                  disabled={banksLoading}
                >
                  <SelectTrigger id="bank_id" className="h-10">
                    <span
                      className={
                        selectedBankId == null ? "text-muted-foreground" : ""
                      }
                    >
                      {banksLoading
                        ? "Loading banks..."
                        : (optionTag(bankOptions, selectedBankId) ??
                          "Select a bank")}
                    </span>
                  </SelectTrigger>

                  <SelectContent>
                    {bankOptions.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No banks available. Ask admin to add one.
                      </div>
                    ) : (
                      bankOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.tag}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {errors.bank_id && (
                  <p className="text-xs text-destructive">
                    {errors.bank_id.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------------- Customer details ---------------- */}
        <SectionCard
          icon={User}
          title="Customer details"
          description="Basic contact information of the applicant"
        >
          <Field
            id="full_name"
            label="Full name"
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
        </SectionCard>

        {/* ---------------- Government IDs ---------------- */}
        <SectionCard
          icon={ShieldCheck}
          title="Government IDs"
          description="Identity information required for verification"
        >
          <Field
            id="aadhaar_number"
            label="Aadhaar number"
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
            label="PAN number"
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
        </SectionCard>

        {/* ---------------- Assignment ---------------- */}
        {isAdmin && (
          <SectionCard
            icon={UserCog}
            title="Application assignment"
            description="Choose which agent will handle this application"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="agent_id" className="text-sm font-medium">
                Assign to agent{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>

              <Select
                value={
                  form.watch("agent_id") ? String(form.watch("agent_id")) : ""
                }
                onValueChange={(value) =>
                  form.setValue("agent_id", value ? Number(value) : undefined)
                }
              >
                <SelectTrigger id="agent_id" className="h-10 max-w-xl">
                  <span
                    className={
                      !form.watch("agent_id") ? "text-muted-foreground" : ""
                    }
                  >
                    {optionTag(agentOptions, form.watch("agent_id")) ??
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
            </div>
          </SectionCard>
        )}

        {/* ---------------- FD info ---------------- */}
        {isFd && (
          <Card className="border-violet-500/30 bg-violet-500/5">
            <CardContent className="flex gap-3 p-4">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />

              <div className="space-y-1">
                <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
                  Documents required
                </p>

                <p className="text-sm text-violet-700/80 dark:text-violet-400/80">
                  FD credit cards require Aadhaar and PAN documents. You&apos;ll
                  upload them after saving the application details.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------- Bottom actions ---------------- */}
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
/* Suspense wrapper                                                    */
/* ------------------------------------------------------------------ */

export default function CreditCardApply() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        </div>
      }
    >
      <CreditCardApplyInner />
    </Suspense>
  );
}
