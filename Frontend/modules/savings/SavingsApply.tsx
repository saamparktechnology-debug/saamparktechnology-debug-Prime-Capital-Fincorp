// modules/savings/SavingsApply.tsx
"use client";

import { Suspense, useState, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  UserCog,
  IdCard,
  CreditCard as PanIcon,
  Building2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { documentUrl, type SelectOption, optionTag } from "@/lib/format";

import { usePermission } from "@/lib/hooks/usePermission";
import { useAgentsList } from "@/modules/agents/hooks/useAgents";

import {
  AADHAAR_REGEX,
  AADHAAR_ERROR,
  PAN_REGEX,
  PAN_ERROR,
} from "@/lib/utils/validators";

import {
  useCreateSavingsApplication,
  useSavingsBanks,
} from "./hooks/useSavings";
import type { SavingsApplication } from "./types";

const phoneRegex = /^\+?[0-9]{10,15}$/;
const pincodeRegex = /^[0-9]{4,10}$/;

const schema = z.object({
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
/* Shared components                                                   */
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
  className = "",
  children,
}: {
  id: string;
  label: string;
  icon: typeof User;
  error?: string;
  className?: string;
  children: (props: {
    id: string;
    className: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
}) {
  const describedBy = error ? `${id}-error` : undefined;

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

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
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

function SavingsApplyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin } = usePermission();

  const bankId = Number(searchParams.get("bank"));

  const [created, setCreated] = useState<SavingsApplication | null>(null);

  const { data: banks, isLoading } = useSavingsBanks(true);
  const { data: agents } = useAgentsList();

  const bank = banks?.find((b) => b.bank_id === bankId);

  const activeAgents = (agents ?? []).filter((agent) => agent.is_active);

  const agentOptions: SelectOption[] = activeAgents.map((agent) => ({
    value: String(agent.agent_id),
    tag: agent.full_name,
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      aadhaar_number: "",
      pan_number: "",
      pincode: "",
      agent_id: undefined,
    },
  });

  const createM = useCreateSavingsApplication();

  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) => {
    if (isAdmin && !values.agent_id) {
      form.setError("agent_id", {
        message: "Please choose an agent.",
      });
      return;
    }

    createM.mutate(
      {
        bank_id: bankId,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        aadhaar_number: values.aadhaar_number,
        pan_number: values.pan_number,
        pincode: values.pincode,
        agent_id: isAdmin ? values.agent_id : undefined,
      },
      {
        onSuccess: (data) => setCreated(data),
      },
    );
  });

  /* ---------------------------------------------------------------- */
  /* No bank selected                                                 */
  /* ---------------------------------------------------------------- */

  if (!bankId) {
    return (
      <EmptyState
        title="No bank selected"
        description="Please go back and choose a partner bank."
        action={
          <Link href="/savings" className={buttonVariants()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        }
      />
    );
  }

  /* ---------------------------------------------------------------- */
  /* Loading                                                           */
  /* ---------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Bank not found                                                    */
  /* ---------------------------------------------------------------- */

  if (!bank) {
    return (
      <EmptyState
        title="Bank not found"
        description="The selected bank is not available."
        action={
          <Link href="/savings" className={buttonVariants()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        }
      />
    );
  }

  /* ---------------------------------------------------------------- */
  /* Success                                                           */
  /* ---------------------------------------------------------------- */

  if (created) {
    return (
      <div className="w-full space-y-6">
        <PageHeader
          title="Savings application recorded"
          description={`Your application has been recorded for ${bank.bank_name}.`}
        />

        <Card className="overflow-hidden shadow-sm">
          <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-10 text-center text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-8 ring-white/10">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Application Recorded!
              </h2>

              <p className="text-sm text-white/90">
                Complete the remaining process on {bank.bank_name}&apos;s
                website.
              </p>
            </div>
          </div>

          <CardContent className="space-y-6 p-6 lg:p-8">
            {/* Bank */}
            <div className="flex flex-col gap-4 rounded-xl border bg-muted/40 p-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                {bank.logo_path ? (
                  <img
                    src={documentUrl(bank.logo_path) ?? ""}
                    alt={bank.bank_name}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span className="font-bold text-blue-600">
                    {bank.bank_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold">{bank.bank_name}</p>

                <p className="text-xs text-muted-foreground">
                  {bank.tagline || bank.short_code || "Savings Account"}
                </p>
              </div>

              <Badge variant="outline" className="w-fit">
                Savings Account
              </Badge>
            </div>

            {/* Reference */}
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Reference ID</p>

              <p className="font-mono text-xl font-semibold tabular-nums">
                #SV
                {String(created.application_id).padStart(5, "0")}
              </p>
            </div>

            {/* Applicant details */}
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
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.push("/savings")}>
                Back to Applications
              </Button>

              <a
                href={bank.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  size: "lg",
                })}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open {bank.bank_name}
              </a>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Use the bank website above to continue and complete the savings
              account opening process.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Form                                                              */
  /* ---------------------------------------------------------------- */

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/savings"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Link>
      </div>

      <PageHeader
        title={`Open Savings — ${bank.bank_name}`}
        description="Fill in the customer's details to record this savings application."
      />

      {/* Bank information */}
      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white">
              {bank.logo_path ? (
                <img
                  src={documentUrl(bank.logo_path) ?? ""}
                  alt={bank.bank_name}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <span className="font-bold text-blue-600">
                  {bank.bank_name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">{bank.bank_name}</h2>

                <Badge variant="outline" className="text-[10px]">
                  SAVINGS
                </Badge>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {bank.tagline || bank.short_code || "Savings Account"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {/* ========================================================= */}
        {/* Assignment                                                 */}
        {/* ========================================================= */}

        {isAdmin && (
          <SectionCard
            icon={UserCog}
            title="Application assignment"
            description="Select the agent responsible for this application"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="agent_id" className="text-sm font-medium">
                Assign to Agent <span className="text-destructive">*</span>
              </Label>

              <Select
                value={
                  form.watch("agent_id") ? String(form.watch("agent_id")) : ""
                }
                onValueChange={(value) =>
                  form.setValue("agent_id", value ? Number(value) : undefined, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="agent_id" className="h-10 max-w-xl">
                  <span
                    className={
                      !form.watch("agent_id") ? "text-muted-foreground" : ""
                    }
                  >
                    {optionTag(agentOptions, form.watch("agent_id")) ??
                      "Select agent"}
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

              {errors.agent_id && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.agent_id.message}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                An agent must be selected before the application can be
                submitted.
              </p>
            </div>
          </SectionCard>
        )}

        {/* ========================================================= */}
        {/* Customer details                                           */}
        {/* ========================================================= */}

        <SectionCard
          icon={User}
          title="Customer details"
          description="Basic contact information of the applicant"
        >
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

        {/* ========================================================= */}
        {/* Government IDs                                             */}
        {/* ========================================================= */}

        <SectionCard
          icon={ShieldCheck}
          title="Government IDs"
          description="Identity information required for verification"
        >
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
        </SectionCard>

        {/* ========================================================= */}
        {/* Bottom actions                                              */}
        {/* ========================================================= */}

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Ready to continue?</p>

                <p className="text-xs text-muted-foreground">
                  Review the customer information before saving this
                  application.
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
                  ) : (
                    <>
                      Continue
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <p className="text-center text-xs text-muted-foreground">
              After saving, you&apos;ll be redirected to{" "}
              <strong>{bank.bank_name}</strong>&apos;s website to complete the
              savings account opening process.
            </p>

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

export default function SavingsApply() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      }
    >
      <SavingsApplyInner />
    </Suspense>
  );
}
