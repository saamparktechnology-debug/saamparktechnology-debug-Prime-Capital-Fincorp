// modules/loans/LoanDetail.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap, getErrorMessage } from "@/lib/api/client";
import { formatCurrency, formatDate, getInitials } from "@/lib/format";
import { usePermission } from "@/lib/hooks/usePermission";
import { useLoansList } from "./hooks/useLoans";
import { useEmisByLoan } from "@/modules/emis/hooks/useEmis";
import { LoanStatusTimeline } from "./components/LoanStatusTimeline";
import { EMIScheduleTable } from "./components/EMIScheduleTable";
import { LoanStatusModal } from "./modals/LoanStatusModal";
import type { Loan } from "./types";

export default function LoanDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const { isAdmin } = usePermission();
  const [statusOpen, setStatusOpen] = useState(false);
  const qc = useQueryClient();

  // ---- ALL HOOKS MUST RUN UNCONDITIONALLY ----
  const { data: loans, isLoading } = useLoansList();
  const loan = loans?.find((l) => l.loan_id === id);
  const { data: emis } = useEmisByLoan(id);

  const generateM = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/loans/${id}/generate-emis`);
      return unwrap(res);
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || "EMI schedule generated.");
      qc.invalidateQueries({ queryKey: ["emis"] });
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ---- Early returns NOW (all hooks have already run) ----
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="space-y-4">
        <PageHeader title="Loan not found" />
        <p className="text-sm text-muted-foreground">
          The loan may have been removed or you don't have access.
        </p>
        <Link href="/loans" className={buttonVariants({ variant: "outline" })}>
          Back to Loans
        </Link>
      </div>
    );
  }

  const canGenerateEmis =
    isAdmin &&
    ["Disbursed", "Active"].includes(loan.loan_status) &&
    (!emis || emis.length === 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Loan #${loan.loan_id}`}
        description={`${loan.loan_type} • Applied ${formatDate(loan.created_at)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={loan.loan_status} />

            {canGenerateEmis && (
              <Button
                variant="outline"
                onClick={() => generateM.mutate()}
                disabled={generateM.isPending}
              >
                {generateM.isPending ? "Generating..." : "Generate EMIs"}
              </Button>
            )}

            {isAdmin && (
              <Button onClick={() => setStatusOpen(true)}>Update Status</Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: timeline + customer card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {getInitials(
                    `${loan.first_name ?? ""} ${loan.last_name ?? ""}`,
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {loan.first_name && loan.last_name
                      ? `${loan.first_name} ${loan.last_name}`
                      : `Customer #${loan.customer_id}`}
                  </p>
                  {loan.primary_phone && (
                    <p className="truncate text-xs text-muted-foreground">
                      {loan.primary_phone}
                    </p>
                  )}
                </div>
              </div>

              <Link
                href={`/customers/${loan.customer_id}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                })}
              >
                View Customer Profile
              </Link>
            </CardContent>
          </Card>

          {/* Status timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <LoanStatusTimeline status={loan.loan_status} />
            </CardContent>
          </Card>
        </div>

        {/* Right: details + EMI schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Row label="Loan Type" value={loan.loan_type} />
              <Row
                label="Partner Bank"
                value={
                  loan.bank_name
                    ? `${loan.bank_name}${loan.bank_short_code ? ` (${loan.bank_short_code})` : ""}`
                    : "—"
                }
              />
              <Row
                label="Requested Amount"
                value={formatCurrency(loan.requested_amount)}
              />
              <Row
                label="Approved Amount"
                value={
                  loan.approved_amount
                    ? formatCurrency(loan.approved_amount)
                    : "—"
                }
              />
              <Row label="Tenure" value={`${loan.tenure_months} months`} />
              <Row
                label="Interest Rate"
                value={`${loan.interest_rate}% p.a.`}
              />
              <Row
                label="Interest Type"
                value={
                  loan.interest_type === "flat" ? "Flat" : "Reducing Balance"
                }
              />
              <Row
                label="Bank Reference"
                value={loan.bank_reference_number || "—"}
              />
              {isAdmin && (
                <Row label="Handled by Agent" value={loan.agent_name || "—"} />
              )}
              <Row
                label="Rejection Reason"
                value={loan.rejection_reason || "—"}
              />
              <Row label="Purpose" value={loan.purpose} />
            </CardContent>
          </Card>

          <EMIScheduleTable loanId={loan.loan_id} />
        </div>
      </div>

      {isAdmin && (
        <LoanStatusModal
          loan={loan}
          open={statusOpen}
          onOpenChange={setStatusOpen}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}
