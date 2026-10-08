// modules/emis/EmiList.tsx
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { UpcomingEmiTable } from "./components/UpcomingEmiTable";
import { useUpcomingEmis } from "./hooks/useEmis";

export default function EmiList() {
  const { data, isLoading } = useUpcomingEmis();

  return (
    <div className="space-y-6">
      <PageHeader
        title="EMIs"
        description="Upcoming installments and reminders"
      />
      <UpcomingEmiTable data={data} loading={isLoading} />
    </div>
  );
}
