// modules/reports/components/ReportTypePicker.tsx
"use client";

import {
  Users,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Banknote,
  Wallet,
  AlertCircle,
  TrendingUp,
  Landmark,
  UserCog,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { REPORT_TYPES } from "../types";

const ICONS: Record<string, LucideIcon> = {
  Users,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Banknote,
  Wallet,
  AlertCircle,
  TrendingUp,
  Landmark,
  UserCog,
  Clock,
};

export function ReportTypePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border bg-card p-2">
      {REPORT_TYPES.map((rt) => {
        const Icon = ICONS[rt.icon] ?? FileSpreadsheet;
        const active = rt.type === value;
        return (
          <button
            key={rt.type}
            type="button"
            onClick={() => onChange(rt.type)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {rt.label}
          </button>
        );
      })}
    </div>
  );
}
