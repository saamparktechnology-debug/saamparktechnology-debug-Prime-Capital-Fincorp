// modules/loans/LoanList.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoanTable } from "./components/LoanTable";
import { LoanTypeSelectionModal } from "./components/LoanTypeSelectionModal";
import { useLoansList } from "./hooks/useLoans";

export default function LoanList() {
  const { data, isLoading } = useLoansList();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loans"
        description="Manage loan applications and their lifecycle"
        action={
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        }
      />
      <LoanTable data={data} loading={isLoading} />

      <LoanTypeSelectionModal open={pickerOpen} onOpenChange={setPickerOpen} />
    </div>
  );
}
