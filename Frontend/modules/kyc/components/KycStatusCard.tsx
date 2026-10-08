// modules/kyc/components/KycStatusCard.tsx
"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import { useResubmitKYC } from "../hooks/useKyc";
import { usePermission } from "@/lib/hooks/usePermission";
import { KYC_STATUS, type KycStatus } from "@/lib/constants/statuses";
import type { Customer } from "@/lib/types/customer";
import { ReviewKYCModal } from "../modals/ReviewKYCModal";

const ICON_MAP: Record<KycStatus, React.ReactNode> = {
  approved: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
  rejected: <ShieldAlert className="h-5 w-5 text-red-500" />,
  pending: <Clock className="h-5 w-5 text-amber-500" />,
};

export function KycStatusCard({ customer }: { customer: Customer }) {
  const { isAdmin } = usePermission();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const resubmitM = useResubmitKYC(customer.customer_id);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {ICON_MAP[customer.kyc_status]}
            KYC Status
          </CardTitle>
          <StatusBadge status={customer.kyc_status} />
        </CardHeader>
        <CardContent className="space-y-3">
          {customer.kyc_status === KYC_STATUS.REJECTED &&
            customer.kyc_rejection_reason && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs font-medium text-red-700 dark:text-red-400">
                  Rejection Reason
                </p>
                <p className="mt-1 text-sm">{customer.kyc_rejection_reason}</p>
              </div>
            )}

          {isAdmin && customer.kyc_status === KYC_STATUS.PENDING && (
            <Button className="w-full" onClick={() => setReviewOpen(true)}>
              Review KYC
            </Button>
          )}

          {!isAdmin && customer.kyc_status === KYC_STATUS.REJECTED && (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setResubmitOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Resubmit KYC
            </Button>
          )}

          {customer.kyc_status === KYC_STATUS.PENDING && (
            <p className="text-xs text-muted-foreground">
              Awaiting admin review.
            </p>
          )}

          {customer.kyc_status === KYC_STATUS.APPROVED && (
            <p className="text-xs text-muted-foreground">
              Customer is eligible to apply for loans.
            </p>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <ReviewKYCModal
          customerId={customer.customer_id}
          customerName={`${customer.first_name} ${customer.last_name}`}
          open={reviewOpen}
          onOpenChange={setReviewOpen}
        />
      )}

      <ConfirmDialog
        open={resubmitOpen}
        onOpenChange={setResubmitOpen}
        title="Resubmit KYC?"
        description="This will set the KYC status back to pending for admin review. Make sure you've uploaded the corrected documents first."
        confirmText="Resubmit"
        loading={resubmitM.isPending}
        onConfirm={() =>
          resubmitM.mutate(undefined, {
            onSuccess: () => setResubmitOpen(false),
          })
        }
      />
    </>
  );
}
