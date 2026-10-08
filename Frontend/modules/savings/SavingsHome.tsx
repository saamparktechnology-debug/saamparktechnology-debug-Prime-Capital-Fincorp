// modules/savings/SavingsHome.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Building2,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { usePermission } from "@/lib/hooks/usePermission";
import { formatDate, type SelectOption, optionTag } from "@/lib/format";

import { BankSelectionModal } from "./components/BankSelectionModal";
import { UpdateSavingsStatusModal } from "./modals/UpdateSavingsStatusModal";
import { useSavingsApplications } from "./hooks/useSavings";
import type { SavingsApplication } from "./types";

const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All Statuses" },
  { value: "initiated", tag: "Initiated" },
  { value: "completed", tag: "Completed" },
  { value: "cancelled", tag: "Cancelled" },
];

export default function SavingsHome() {
  const { isAdmin } = usePermission();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<SavingsApplication | null>(
    null,
  );

  // Backend only gets the enum filter — search is done client-side.
  const appsQ = useSavingsApplications({
    status: status === "all" ? undefined : status,
  });
  const rawApps = appsQ.data ?? [];

  const apps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rawApps;

    const qDigits = q.replace(/\D/g, "");

    return rawApps.filter((app) => {
      const idNum = String(app.application_id);
      const leadId = `sv${idNum.padStart(5, "0")}`; // "sv00005"
      const leadIdFull = `#${leadId}`; // "#sv00005"

      // ---- Lead ID ----
      if (
        idNum.includes(qDigits) ||
        idNum.padStart(5, "0").includes(qDigits) ||
        leadId.includes(q) ||
        leadIdFull.includes(q)
      ) {
        // Only trust a digits-only hit if the query is genuinely a lead-id shape
        if (qDigits.length > 0 && !/[a-z]/.test(q.replace(/sv|#/g, ""))) {
          return true;
        }
      }

      // ---- Text fields ----
      if (app.full_name?.toLowerCase().includes(q)) return true;
      if (app.email?.toLowerCase().includes(q)) return true;
      if (app.phone?.includes(q)) return true;
      if ((app.bank_name ?? "").toLowerCase().includes(q)) return true;
      if ((app.agent_name ?? "").toLowerCase().includes(q)) return true;

      return false;
    });
  }, [rawApps, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Accounts"
        description="Track savings account applications across partner banks"
        action={
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by lead ID, name, email, or phone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
            <SelectTrigger className="w-[180px]">
              <span>{optionTag(STATUS_OPTIONS, status) ?? "All Statuses"}</span>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Link
              href="/savings/banks"
              className={buttonVariants({ variant: "outline" })}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Manage Banks
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {appsQ.isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : apps.length === 0 ? (
          <EmptyState
            title="No savings applications yet"
            description={
              search || status !== "all"
                ? "Try adjusting your filters."
                : "Click 'New Application' to record one."
            }
            action={
              !search && status === "all" ? (
                <Button onClick={() => setPickerOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Application
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Contact
                  </TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead className="hidden lg:table-cell">Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Applied
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app.application_id}>
                    <TableCell className="font-mono text-xs">
                      #SV{String(app.application_id).padStart(5, "0")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {app.full_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col text-xs">
                        <span>{app.phone}</span>
                        <span className="text-muted-foreground">
                          {app.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{app.bank_name || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {app.agent_name || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(app.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setStatusTarget(app)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!appsQ.isLoading && apps.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {apps.length} application{apps.length === 1 ? "" : "s"}
        </p>
      )}

      <BankSelectionModal open={pickerOpen} onOpenChange={setPickerOpen} />

      {statusTarget && (
        <UpdateSavingsStatusModal
          applicationId={statusTarget.application_id}
          customerName={statusTarget.full_name}
          currentStatus={statusTarget.status}
          open={Boolean(statusTarget)}
          onOpenChange={(o) => !o && setStatusTarget(null)}
        />
      )}
    </div>
  );
}
