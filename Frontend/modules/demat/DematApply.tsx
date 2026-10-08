// modules/demat/DematApply.tsx
"use client";

import { Suspense, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
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
import { documentUrl, type SelectOption, optionTag } from "@/lib/format";

import { usePermission } from "@/lib/hooks/usePermission";
import { useAgentsList } from "@/modules/agents/hooks/useAgents";
import {
  AADHAAR_REGEX,
  AADHAAR_ERROR,
  PAN_REGEX,
  PAN_ERROR,
} from "@/lib/utils/validators";

import { useCreateDematApplication, useDematBanks } from "./hooks/useDemat";
import type { DematApplication } from "./types";
import { WhatsAppShare } from "@/components/shared/WhatsAppShare";

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

function DematApplyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin } = usePermission();

  const bankId = Number(searchParams.get("bank"));
  const [created, setCreated] = useState<DematApplication | null>(null);

  const { data: banks, isLoading } = useDematBanks(true);
  const { data: agents } = useAgentsList();

  const bank = banks?.find((b) => b.bank_id === bankId);

  const activeAgents = (agents ?? []).filter((a) => a.is_active);

  const agentOptions: SelectOption[] = activeAgents.map((a) => ({
    value: String(a.agent_id),
    tag: a.full_name,
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

  const createM = useCreateDematApplication();

  const onSubmit = form.handleSubmit((values) => {
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
      { onSuccess: (data) => setCreated(data) },
    );
  });

  if (!bankId) {
    return (
      <EmptyState
        title="No bank selected"
        description="Please go back and choose a partner bank."
        action={
          <Link href="/demat" className={buttonVariants()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!bank) {
    return (
      <EmptyState
        title="Bank not found"
        description="The selected bank is not available."
        action={
          <Link href="/demat" className={buttonVariants()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        }
      />
    );
  }

  // ---------- Success screen ----------
  if (created) {
    return (
      <div className="w-full space-y-6">
        <Link
          href="/demat"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Link>

        <PageHeader
          title="Application Submitted"
          description="Your Demat application has been recorded successfully"
        />

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-center text-white">
            <CheckCircle2 className="mx-auto h-14 w-14" />
            <h2 className="mt-3 text-xl font-bold">Application Recorded!</h2>
            <p className="mt-1 text-sm text-white/90">
              Complete the remaining process on {bank.bank_name}'s site.
            </p>
          </div>

          <CardContent className="space-y-6 p-6">
            {/* Bank information */}
            <div className="flex items-center gap-4 rounded-lg border bg-muted/40 p-4">
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

              <div>
                <p className="font-semibold">{bank.bank_name}</p>
                <p className="text-xs text-muted-foreground">
                  {bank.tagline || bank.short_code || "Demat Account"}
                </p>
              </div>
            </div>
            {/* Reference */}
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Reference ID</p>
              <p className="font-mono text-lg font-semibold">
                #DM{String(created.application_id).padStart(5, "0")}
              </p>
            </div>
            {/* Applicant information */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Applicant Information
              </h3>

              <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="Name" value={created.full_name} />
                <Info label="Phone" value={created.phone} />
                <Info label="Email" value={created.email} />
                <Info label="Pincode" value={created.pincode} />
                <Info label="Aadhaar" value={created.aadhaar_number ?? "—"} />
                <Info label="PAN" value={created.pan_number ?? "—"} />
              </div>
            </div>
            {/* Bottom actions */}
            {/* Bottom actions */}
            <div className="space-y-3 border-t pt-6">
              <a
                href={bank.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  size: "lg",
                  className: "w-full",
                })}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open {bank.bank_name}
              </a>

              <WhatsAppShare
                defaultPhone={created.phone}
                message={`Hi,

Please complete your Demat application with ${bank.bank_name} using this link:

${bank.apply_link}

- Capital Fincorp Pvt. Ltd.`}
                helperText="Send the application link directly to the customer."
              />

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => router.push("/demat")}
              >
                Back to Applications
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Use the bank's website to complete the remaining account opening
                process.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- Form ----------
  return (
    <div className="w-full space-y-6">
      <Link
        href="/demat"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
        })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Applications
      </Link>

      <PageHeader
        title={`Open Demat — ${bank.bank_name}`}
        description="Fill in customer details to record this application"
      />

      {/* Bank information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 rounded-lg border bg-muted/40 p-4">
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

            <div className="min-w-0">
              <p className="font-semibold">{bank.bank_name}</p>
              <p className="text-xs text-muted-foreground">
                {bank.tagline || bank.short_code || "Demat Account"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="w-full space-y-6">
        {/* Assignment */}
        {/* Assignment */}
        {isAdmin && (
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold">Agent Assignment</h2>
                <p className="text-sm text-muted-foreground">
                  Optional. Leave blank for office-sourced leads.
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Assign to Agent{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                {/* ...Select unchanged... */}

                <p className="text-xs text-muted-foreground">
                  Leave blank to mark this application as{" "}
                  <strong>applied from office</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer details */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold">Customer Details</h2>
              <p className="text-sm text-muted-foreground">
                Enter the customer's basic contact information.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Full name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="full_name">
                  Full Name <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="full_name"
                    className="pl-9"
                    placeholder="e.g., Surajit Singh"
                    {...form.register("full_name")}
                  />
                </div>

                {form.formState.errors.full_name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    placeholder="you@example.com"
                    {...form.register("email")}
                  />
                </div>

                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="phone"
                    className="pl-9"
                    placeholder="9876543210"
                    {...form.register("phone")}
                  />
                </div>

                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <Label htmlFor="pincode">
                  Pincode <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="pincode"
                    className="pl-9"
                    placeholder="713103"
                    {...form.register("pincode")}
                  />
                </div>

                {form.formState.errors.pincode && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.pincode.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Government IDs */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold">Government IDs</h2>
              <p className="text-sm text-muted-foreground">
                Enter the customer's Aadhaar and PAN details.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Aadhaar */}
              <div className="space-y-2">
                <Label htmlFor="aadhaar_number">
                  Aadhaar Number <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="aadhaar_number"
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

              {/* PAN */}
              <div className="space-y-2">
                <Label htmlFor="pan_number">
                  PAN Number <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <PanIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="pan_number"
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
            </div>
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Submit Application</h2>
                <p className="text-sm text-muted-foreground">
                  Review the information above before saving the application.
                </p>
              </div>

              {createM.isError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  Unable to save the application. Please check the details and
                  try again.
                </div>
              )}

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/demat")}
                  disabled={createM.isPending}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  className="sm:min-w-48"
                  disabled={createM.isPending}
                >
                  {createM.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                After saving, you'll be redirected to {bank.bank_name}'s site to
                complete the process.
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default function DematApply() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <DematApplyInner />
    </Suspense>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}
