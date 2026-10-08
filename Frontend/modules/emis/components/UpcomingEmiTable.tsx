// modules/emis/components/UpcomingEmiTable.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  BellRing,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import { usePermission } from "@/lib/hooks/usePermission";
import { formatCurrency, formatDate } from "@/lib/format";
import type { UpcomingEMI } from "../types";
import { useSendReminder, useUpdateEmiStatus } from "../hooks/useEmis";

export function UpcomingEmiTable({
  data,
  loading,
}: {
  data: UpcomingEMI[] | undefined;
  loading?: boolean;
}) {
  const { isAdmin } = usePermission();
  const [search, setSearch] = useState("");
  const [reminderTarget, setReminderTarget] = useState<UpcomingEMI | null>(
    null,
  );

  const reminderM = useSendReminder();
  const statusM = useUpdateEmiStatus();

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (e) =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
        e.primary_phone?.includes(q) ||
        String(e.loan_id).includes(q),
    );
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or loan #..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No upcoming EMIs"
            description={
              search
                ? "Try a different search term."
                : "All installments are settled or none are due yet."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Loan</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Contact
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emi) => (
                  <TableRow key={emi.emi_id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      <Link
                        href={`/customers/${emi.customer_id}`}
                        className="hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                      >
                        {emi.first_name} {emi.last_name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Link
                        href={`/loans/${emi.loan_id}`}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        #{emi.loan_id} • {emi.loan_type}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(emi.emi_amount)}
                    </TableCell>
                    <TableCell>{formatDate(emi.due_date)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {emi.primary_phone || emi.email_address || "—"}
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
                            onClick={() => setReminderTarget(emi)}
                          >
                            <BellRing className="mr-2 h-4 w-4" />
                            Send reminder
                          </DropdownMenuItem>

                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  statusM.mutate({
                                    emiId: emi.emi_id,
                                    status: "Paid",
                                  })
                                }
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  statusM.mutate({
                                    emiId: emi.emi_id,
                                    status: "Overdue",
                                  })
                                }
                                className="text-amber-600 focus:text-amber-600"
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Mark as Overdue
                              </DropdownMenuItem>
                            </>
                          )}
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

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {data?.length ?? 0} upcoming EMIs
        </p>
      )}

      <ConfirmDialog
        open={Boolean(reminderTarget)}
        onOpenChange={(o) => !o && setReminderTarget(null)}
        title="Send EMI reminder?"
        description={
          reminderTarget
            ? `Sends SMS + Email to ${reminderTarget.first_name} ${reminderTarget.last_name} for ${formatCurrency(reminderTarget.emi_amount)} due on ${formatDate(reminderTarget.due_date)}.`
            : ""
        }
        confirmText="Send Reminder"
        loading={reminderM.isPending}
        onConfirm={() => {
          if (!reminderTarget) return;
          reminderM.mutate(reminderTarget.emi_id, {
            onSettled: () => setReminderTarget(null),
          });
        }}
      />
    </div>
  );
}
