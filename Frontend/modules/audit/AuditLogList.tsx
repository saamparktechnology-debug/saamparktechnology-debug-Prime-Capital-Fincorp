// modules/audit/AuditLogList.tsx
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { AuditStatsCards } from "./components/AuditStatsCards";
import { AuditLogTable } from "./components/AuditLogTable";
import { useAuditLogs } from "./hooks/useAudit";

export default function AuditLogList() {
  const { data, isLoading } = useAuditLogs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Complete system activity trail — who did what and when"
      />

      <AuditStatsCards data={data} loading={isLoading} />
      <AuditLogTable data={data} loading={isLoading} />
    </div>
  );
}
