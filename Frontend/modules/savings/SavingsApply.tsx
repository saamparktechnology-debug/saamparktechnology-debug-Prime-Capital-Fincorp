// modules/savings/SavingsApply.tsx
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
  Share2,
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

Your ${opts.bankName} savings account application has been initiated.

Please complete your application using the link below:
${opts.applyLink}

For any assistance, please contact us.
- Capital Fincorp Pvt. Ltd.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

function SavingsApplyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin } = usePermission();

  const bankId = Number(searchParams.get("bank"));
  const [created, setCreated] = useState<SavingsApplication | null>(null);

  const { data: banks, isLoading } = useSavingsBanks(true);
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

  const createM = useCreateSavingsApplication();

  const onSubmit = form.handleSubmit((values) => {
    if (isAdmin && !values.agent_id) {
      form.setError("agent_id", { message: "Please choose an agent." });
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
      { onSuccess: (data) => setCreated(data) },
    );
  });

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

  if (isLoading) {
    return <Skeleton className="h-96 w-full max-w-2xl" />;
  }

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

  // ---------- Success ----------
  if (created) {
    const waUrl = buildWhatsAppUrl({
      phone: created.phone,
      customerName: created.full_name,
      bankName: bank.bank_name,
      applyLink: bank.apply_link,
    });

    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-center text-white">
            <CheckCircle2 className="mx-auto h-14 w-14" />
            <h2 className="mt-3 text-xl font-bold">Application Recorded!</h2>
            <p className="mt-1 text-sm text-white/90">
              Complete the process on {bank.bank_name}'s site.
            </p>
          </div>
          <CardContent className="space-y-4 p-6">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Reference ID</p>
              <p className="font-mono text-lg font-semibold">
                #SV{String(created.application_id).padStart(5, "0")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Name" value={created.full_name} />
              <Info label="Phone" value={created.phone} />
              <Info label="Email" value={created.email} />
              <Info label="Pincode" value={created.pincode} />
              <Info label="Aadhaar" value={created.aadhaar_number ?? "—"} />
              <Info label="PAN" value={created.pan_number ?? "—"} />
            </div>

            {/* WhatsApp share */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Share2 className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Share with customer</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Send the {bank.bank_name} application link to{" "}
                    {created.full_name} on WhatsApp.
                  </p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonVariants({ variant: "default" })} mt-3 bg-emerald-600 hover:bg-emerald-700`}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={bank.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open {bank.bank_name}
              </a>
              <Button variant="outline" onClick={() => router.push("/savings")}>
                Back to Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- Form ----------
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/savings"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Applications
      </Link>

      <PageHeader
        title={`Open Savings — ${bank.bank_name}`}
        description="Fill in customer details to record this application"
      />

      <Card>
        <CardContent className="p-6">
          {/* Bank banner */}
          <div className="mb-6 flex items-center gap-4 rounded-lg border bg-muted/40 p-4">
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
                {bank.tagline || bank.short_code || "Savings Account"}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Agent selector (admin only) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label>
                  Assign to Agent <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={
                    form.watch("agent_id") ? String(form.watch("agent_id")) : ""
                  }
                  onValueChange={(v) =>
                    form.setValue("agent_id", v ? Number(v) : undefined, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <UserCog className="mr-2 h-4 w-4 text-muted-foreground" />
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
                    {agentOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.agent_id && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.agent_id.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
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

            <div className="space-y-2">
              <Label>
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Phone <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
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

              <div className="space-y-2">
                <Label>
                  Pincode <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
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

            {/* Government IDs */}
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="mb-3 text-sm font-semibold">Government IDs</p>
              <div className="grid gap-4 md:grid-cols-2">
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
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SavingsApply() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl" />}>
      <SavingsApplyInner />
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
