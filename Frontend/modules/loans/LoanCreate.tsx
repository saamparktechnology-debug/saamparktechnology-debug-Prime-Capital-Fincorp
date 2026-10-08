// modules/loans/LoanCreate.tsx
"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoanForm } from "./components/LoanForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoanCreate() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Loan Application"
        description="Only KYC-approved customers can be selected."
      />
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <LoanForm />
      </Suspense>
    </div>
  );
}
