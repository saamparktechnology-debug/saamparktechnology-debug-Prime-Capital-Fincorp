// modules/reports/components/ReportFiltersPanel.tsx
"use client";

import { useMemo } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { useAgentsList } from "@/modules/agents/hooks/useAgents";
import { useBanksList } from "@/modules/banks/hooks/useBanks";
import {
  LOAN_STATUS_LIST,
  LOAN_TYPES,
  KYC_STATUS,
} from "@/lib/constants/statuses";
import { type SelectOption, optionTag } from "@/lib/format";
import type { ReportFilters } from "../types";

interface Props {
  reportType: string;
  filters: ReportFilters;
  onChange: (f: ReportFilters) => void;
  onReset: () => void;
}

// ---- Static options ----
const STATUS_LOAN_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All" },
  ...LOAN_STATUS_LIST.map((s) => ({ value: s, tag: s })),
];

const STATUS_COLLECTION_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All" },
  { value: "Pending", tag: "Pending" },
  { value: "Paid", tag: "Paid" },
  { value: "Overdue", tag: "Overdue" },
];

const LOAN_TYPE_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All" },
  ...LOAN_TYPES.map((t) => ({ value: t, tag: t })),
];

const KYC_STATUS_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All" },
  { value: KYC_STATUS.PENDING, tag: "Pending" },
  { value: KYC_STATUS.APPROVED, tag: "Approved" },
  { value: KYC_STATUS.REJECTED, tag: "Rejected" },
];

export function ReportFiltersPanel({
  reportType,
  filters,
  onChange,
  onReset,
}: Props) {
  const { data: agents } = useAgentsList();
  const { data: banks } = useBanksList();

  const set = <K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const hasAny = Object.values(filters).some(
    (v) => v !== undefined && v !== null && v !== "",
  );

  // ---- Dynamic options ----
  const agentOptions = useMemo<SelectOption[]>(
    () => [
      { value: "all", tag: "All Agents" },
      ...(agents ?? []).map((a) => ({
        value: String(a.agent_id),
        tag: a.full_name,
      })),
    ],
    [agents],
  );

  const bankOptions = useMemo<SelectOption[]>(
    () => [
      { value: "all", tag: "All Banks" },
      ...(banks ?? []).map((b) => ({
        value: String(b.bank_id),
        tag: b.bank_name,
      })),
    ],
    [banks],
  );

  // ---- Which filters to show per report type ----
  const showDates = [
    "customers",
    "loans",
    "loan-applications",
    "approved-loans",
    "rejected-loans",
    "disbursements",
    "collections",
  ].includes(reportType);

  const showStatus = ["loans", "loan-applications", "collections"].includes(
    reportType,
  );

  const showLoanType = [
    "loans",
    "loan-applications",
    "approved-loans",
    "rejected-loans",
    "disbursements",
  ].includes(reportType);

  const showAmount = [
    "loans",
    "loan-applications",
    "approved-loans",
    "rejected-loans",
    "disbursements",
  ].includes(reportType);

  const showKycStatus = ["customers"].includes(reportType);

  const showAgent = !["bank-disbursements", "agent-performance"].includes(
    reportType,
  );

  const showBank = [
    "loans",
    "loan-applications",
    "approved-loans",
    "rejected-loans",
    "disbursements",
  ].includes(reportType);

  const getTodayStr = (): string => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const statusOptions =
    reportType === "collections"
      ? STATUS_COLLECTION_OPTIONS
      : STATUS_LOAN_OPTIONS;

  return (
    <div className="rounded-lg border bg-card p-4">
      {showDates && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const t = getTodayStr();
              onChange({ ...filters, start_date: t, end_date: t });
            }}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              const y = now.getFullYear();
              const m = String(now.getMonth() + 1).padStart(2, "0");
              const first = `${y}-${m}-01`;
              const last = `${y}-${m}-${String(new Date(y, now.getMonth() + 1, 0).getDate()).padStart(2, "0")}`;
              onChange({ ...filters, start_date: first, end_date: last });
            }}
          >
            This Month
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              const y = now.getFullYear();
              const fyStartYear = now.getMonth() >= 3 ? y : y - 1;
              const first = `${fyStartYear}-04-01`;
              const last = `${fyStartYear + 1}-03-31`;
              onChange({ ...filters, start_date: first, end_date: last });
            }}
          >
            This Financial Year
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...filters,
                start_date: undefined,
                end_date: undefined,
              })
            }
          >
            All Time
          </Button>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Filters</p>
        {hasAny && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
        {showDates && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={filters.start_date ?? ""}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={filters.end_date ?? ""}
                onChange={(e) => set("end_date", e.target.value)}
              />
            </div>
          </>
        )}

        {showStatus && (
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(v) =>
                set("status", v === "all" ? undefined : (v ?? undefined))
              }
            >
              <SelectTrigger>
                <span>
                  {optionTag(statusOptions, filters.status ?? "all") ?? "All"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showLoanType && (
          <div className="space-y-1.5">
            <Label className="text-xs">Loan Type</Label>
            <Select
              value={filters.loan_type ?? "all"}
              onValueChange={(v) =>
                set("loan_type", v === "all" ? undefined : (v ?? undefined))
              }
            >
              <SelectTrigger>
                <span>
                  {optionTag(LOAN_TYPE_OPTIONS, filters.loan_type ?? "all") ??
                    "All"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {LOAN_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showKycStatus && (
          <div className="space-y-1.5">
            <Label className="text-xs">KYC Status</Label>
            <Select
              value={filters.kyc_status ?? "all"}
              onValueChange={(v) =>
                set("kyc_status", v === "all" ? undefined : (v ?? undefined))
              }
            >
              <SelectTrigger>
                <span>
                  {optionTag(KYC_STATUS_OPTIONS, filters.kyc_status ?? "all") ??
                    "All"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {KYC_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showAgent && (
          <div className="space-y-1.5">
            <Label className="text-xs">Agent</Label>
            <Select
              value={filters.agent_id ? String(filters.agent_id) : "all"}
              onValueChange={(v) =>
                set("agent_id", v === "all" ? undefined : Number(v))
              }
            >
              <SelectTrigger>
                <span>
                  {optionTag(
                    agentOptions,
                    filters.agent_id ? String(filters.agent_id) : "all",
                  ) ?? "All Agents"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {agentOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showBank && (
          <div className="space-y-1.5">
            <Label className="text-xs">Bank</Label>
            <Select
              value={filters.bank_id ? String(filters.bank_id) : "all"}
              onValueChange={(v) =>
                set("bank_id", v === "all" ? undefined : Number(v))
              }
            >
              <SelectTrigger>
                <span>
                  {optionTag(
                    bankOptions,
                    filters.bank_id ? String(filters.bank_id) : "all",
                  ) ?? "All Banks"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {bankOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showAmount && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Min Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.min_amount ?? ""}
                onChange={(e) =>
                  set(
                    "min_amount",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max Amount</Label>
              <Input
                type="number"
                placeholder="100000"
                value={filters.max_amount ?? ""}
                onChange={(e) =>
                  set(
                    "max_amount",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
