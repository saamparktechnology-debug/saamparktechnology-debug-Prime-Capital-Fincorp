// modules/kyc/KycList.tsx
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KycQueueTable } from "./components/KycQueueTable";
import { ReviewKYCModal } from "./modals/ReviewKYCModal";
import { usePermission } from "@/lib/hooks/usePermission";
import type { Customer } from "@/lib/types/customer";

export default function KycList() {
  const { isAdmin } = usePermission();
  const [reviewTarget, setReviewTarget] = useState<Customer | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC Management"
        description={
          isAdmin
            ? "Review customer KYC submissions and approve or reject"
            : "Track KYC status of your customers"
        }
      />

      <KycQueueTable onReview={isAdmin ? setReviewTarget : undefined} />

      {isAdmin && reviewTarget && (
        <ReviewKYCModal
          customerId={reviewTarget.customer_id}
          customerName={`${reviewTarget.first_name} ${reviewTarget.last_name}`}
          open={Boolean(reviewTarget)}
          onOpenChange={(o) => !o && setReviewTarget(null)}
        />
      )}
    </div>
  );
}
