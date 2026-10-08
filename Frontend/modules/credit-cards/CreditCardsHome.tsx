// modules/credit-cards/CreditCardsHome.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  RefreshCw,
  Building2,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { formatDate, type SelectOption, optionTag } from "@/lib/format";

import { CardTypeSelectionModal } from "./components/CardTypeSelectionModal";
import { UpdateCCStatusModal } from "./modals/UpdateCCStatusModal";
import { useCreditCardApplications } from "./hooks/useCreditCards";
import { cardTypeLabel } from "./utils/cardTypes";
import type { CreditCardApplication } from "./types";

const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All Statuses" },
  { value: "initiated", tag: "Initiated" },
  { value: "completed", tag: "Completed" },
  { value: "cancelled", tag: "Cancelled" },
];

const TYPE_OPTIONS: SelectOption[] = [
  { value: "all", tag: "All Types" },
  { value: "fd", tag: "FD Credit Card" },
  { value: "normal", tag: "Credit Card" },
];

export default function CreditCardsHome() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [cardType, setCardType] = useState<string>("all");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [statusTarget, setStatusTarget] =
    useState<CreditCardApplication | null>(null);

  // Backend only gets the enum filters — search is done client-side.
  const filters = {
    status: status === "all" ? undefined : status,
    card_type: cardType === "all" ? undefined : cardType,
  };

  const appsQ = useCreditCardApplications(filters);
  const rawApps = appsQ.data ?? [];

  const apps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rawApps;

    const qDigits = q.replace(/\D/g, "");

    return rawApps.filter((app) => {
      const idNum = String(app.application_id);
      const leadId = `cc${idNum.padStart(5, "0")}`; // "cc00005"
      const leadIdFull = `#${leadId}`; // "#cc00005"

      // ---- Lead ID ----
      if (
        idNum.includes(qDigits) ||
        idNum.padStart(5, "0").includes(qDigits) ||
        leadId.includes(q) ||
        leadIdFull.includes(q)
      ) {
        // Only take the digits-only branch if the query is a lead-id shape
        if (qDigits.length > 0 && !/[a-z]/.test(q.replace(/cc|#/g, ""))) {
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
        title="Credit Cards"
        description="Track credit card applications"
        action={
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by lead ID, name, email, phone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={cardType}
            onValueChange={(v) => setCardType(v ?? "all")}
          >
            <SelectTrigger className="w-[180px]">
              <span>{optionTag(TYPE_OPTIONS, cardType) ?? "All Types"}</span>
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {appsQ.isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : apps.length === 0 ? (
          <EmptyState
            title="No credit card applications yet"
            description={
              search || status !== "all" || cardType !== "all"
                ? "Try adjusting your filters."
                : "Click 'New Application' to record one."
            }
            action={
              !search && status === "all" && cardType === "all" ? (
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
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Applied By
                  </TableHead>
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
                      #CC{String(app.application_id).padStart(5, "0")}
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
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          app.card_type === "fd"
                            ? "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400"
                            : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        }
                      >
                        {cardTypeLabel(app.card_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {app.applied_from_office ? (
                        <Badge
                          variant="outline"
                          className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        >
                          <Building2 className="mr-1 h-3 w-3" />
                          From Office
                        </Badge>
                      ) : app.agent_name ? (
                        <span className="text-sm text-muted-foreground">
                          {app.agent_name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
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

      <CardTypeSelectionModal open={pickerOpen} onOpenChange={setPickerOpen} />

      {statusTarget && (
        <UpdateCCStatusModal
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
