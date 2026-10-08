// modules/reports/components/ExportButtons.tsx
"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileType2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { exportReport, type ExportFormat } from "../utils/export";
import type { ReportRow } from "../types";

export function ExportButtons({
  rows,
  filename,
  reportType,
  title,
  disabled,
}: {
  rows: ReportRow[];
  filename: string;
  title: string;
  reportType?: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState<ExportFormat | null>(null);

  const handle = (format: ExportFormat) => {
    if (!rows || rows.length === 0) {
      toast.error("No data to export.");
      return;
    }
    try {
      setBusy(format);
      exportReport(format, rows, filename, title, reportType);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error("Export failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" disabled={disabled}>
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handle("csv")}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle("xlsx")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle("pdf")}>
          <FileType2 className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
