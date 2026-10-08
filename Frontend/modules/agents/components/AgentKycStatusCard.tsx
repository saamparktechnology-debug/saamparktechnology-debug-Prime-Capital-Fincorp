// modules/agents/components/AgentKycStatusCard.tsx
"use client";

import { ShieldCheck, ShieldAlert, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KYC_STATUS, type KycStatus } from "@/lib/constants/statuses";

const ICON_MAP: Record<KycStatus, React.ReactNode> = {
  approved: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
  rejected: <ShieldAlert className="h-5 w-5 text-red-500" />,
  pending: <Clock className="h-5 w-5 text-amber-500" />,
};

export function AgentKycStatusCard({
  status,
  rejectionReason,
  onReview,
  onResubmit,
  canReview,
  canResubmit,
}: {
  status: KycStatus;
  rejectionReason?: string | null;
  onReview?: () => void;
  onResubmit?: () => void;
  canReview?: boolean;
  canResubmit?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {ICON_MAP[status]}
          KYC Status
        </CardTitle>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="space-y-3">
        {status === KYC_STATUS.REJECTED && rejectionReason && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <p className="text-xs font-medium text-red-700 dark:text-red-400">
              Rejection Reason
            </p>
            <p className="mt-1 text-sm">{rejectionReason}</p>
          </div>
        )}

        {canReview && status === KYC_STATUS.PENDING && (
          <Button className="w-full" onClick={onReview}>
            Review KYC
          </Button>
        )}

        {canResubmit && status === KYC_STATUS.REJECTED && (
          <Button className="w-full" variant="outline" onClick={onResubmit}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resubmit KYC
          </Button>
        )}

        {status === KYC_STATUS.PENDING && !canReview && (
          <p className="text-xs text-muted-foreground">
            Awaiting admin review. You can still update your details.
          </p>
        )}

        {status === KYC_STATUS.APPROVED && (
          <p className="text-xs text-muted-foreground">
            KYC verified. Contact admin for any changes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
