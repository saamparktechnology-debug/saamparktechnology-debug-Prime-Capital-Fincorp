"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { usePermission } from "@/lib/hooks/usePermission";
import {
  formatCurrency,
  formatDate,
  type SelectOption,
  optionTag,
} from "@/lib/format";
import { LOAN_STATUS_LIST, type Loan } from "../types";

const LOAN_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All statuses" },
  ...LOAN_STATUS_LIST.map((s) => ({ value: s, tag: s })),
];

export function LoanTable({
  data,
  loading,
}: {
  data: Loan[] | undefined;
  loading?: boolean;
}) {
  const { isAdmin } = usePermission();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!data) return [];

    const q = search.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");

    return data.filter((l) => {
      if (statusFilter !== "all" && l.loan_status !== statusFilter) {
        return false;
      }
      if (!q) return true;

      const idNum = String(l.loan_id);
      const leadId = `ln${idNum.padStart(5, "0")}`;
      const leadIdFull = `#${leadId}`;

      // ---- Lead ID ----
      if (
        idNum.includes(qDigits) ||
        idNum.padStart(5, "0").includes(qDigits) ||
        leadId.includes(q) ||
        leadIdFull.includes(q)
      ) {
        if (qDigits.length > 0 && !/[a-z]/.test(q.replace(/ln|#/g, ""))) {
          return true;
        }
      }

      // ---- Text fields ----
      const name = (l.customer_full_name ?? "").toLowerCase();
      if (name.includes(q)) return true;
      if ((l.customer_phone ?? "").includes(q)) return true;
      if ((l.loan_type ?? "").toLowerCase().includes(q)) return true;
      if ((l.purpose ?? "").toLowerCase().includes(q)) return true;
      if ((l.agent_name ?? "").toLowerCase().includes(q)) return true;

      return false;
    });
  }, [data, search, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by lead ID, customer, phone, agent..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v ?? "all")}
          >
            <SelectTrigger className="w-[180px]">
              <span>
                {optionTag(LOAN_STATUS_FILTER_OPTIONS, statusFilter) ??
                  "All statuses"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {LOAN_STATUS_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {loading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No loans found"
            description={
              search || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "Applications will appear here once submitted."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">
                    Approved
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Tenure / Rate
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">Bank</TableHead>
                  {isAdmin && (
                    <TableHead className="hidden xl:table-cell">
                      Agent
                    </TableHead>
                  )}
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Applied
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.loan_id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs font-medium">
                      #LN{String(l.loan_id).padStart(5, "0")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {l.customer_full_name || `Loan #${l.loan_id}`}
                        </span>
                        {l.customer_phone && (
                          <span className="text-xs text-muted-foreground">
                            {l.customer_phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {l.loan_type || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(l.requested_amount)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right">
                      {l.approved_amount
                        ? formatCurrency(l.approved_amount)
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                      {l.tenure_months} mo • {l.interest_rate}%
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {l.bank_name || "—"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="hidden xl:table-cell">
                        {l.agent_id == null ? (
                          <Badge
                            variant="outline"
                            className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          >
                            <Building2 className="mr-1 h-3 w-3" />
                            From Office
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            {l.agent_name || "—"}
                          </span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <StatusBadge status={l.loan_status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(l.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/loans/${l.loan_id}`}
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {data?.length ?? 0} loans
        </p>
      )}
    </div>
  );
}
