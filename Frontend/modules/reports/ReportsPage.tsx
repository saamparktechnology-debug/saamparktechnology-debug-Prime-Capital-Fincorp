// modules/reports/ReportsPage.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";

import { ReportTypePicker } from "./components/ReportTypePicker";
import { ReportFiltersPanel } from "./components/ReportFiltersPanel";
import { ReportTable } from "./components/ReportTable";
import { ExportButtons } from "./components/ExportButtons";
import { useReport } from "./hooks/useReports";
import { REPORT_TYPES } from "./types";
import type { ReportFilters } from "./types";

// Get today's date in YYYY-MM-DD (local time)
const today = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType = searchParams.get("type") || "customers";
  const [reportType, setReportType] = useState<string>(initialType);
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: today(),
    end_date: today(),
  });

  const reportQ = useReport(reportType, filters);

  const reportMeta = useMemo(
    () => REPORT_TYPES.find((r) => r.type === reportType),
    [reportType],
  );

  const handleTypeChange = (type: string) => {
    setReportType(type);
    // Keep today's date filter by default
    setFilters({ start_date: today(), end_date: today() });
    router.replace(`/reports?type=${type}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate, filter, and export business reports"
        action={
          <ExportButtons
            rows={reportQ.data?.data ?? []}
            filename={`${reportType}-${today()}`}
            reportType={reportType}
            title={reportMeta?.label ?? "Report"}
            disabled={!reportQ.data?.data?.length}
          />
        }
      />

      {/* Horizontal report type button strip */}
      <ReportTypePicker value={reportType} onChange={handleTypeChange} />

      {/* Filters */}
      <ReportFiltersPanel
        reportType={reportType}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({ start_date: today(), end_date: today() })}
      />

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {reportQ.isLoading
            ? "Loading..."
            : `${reportQ.data?.count ?? 0} record${(reportQ.data?.count ?? 0) === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Table */}
      <ReportTable
        data={reportQ.data?.data}
        loading={reportQ.isLoading}
        reportType={reportType}
      />
    </div>
  );
}
